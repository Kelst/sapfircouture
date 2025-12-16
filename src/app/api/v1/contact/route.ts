import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactRequests, dresses } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { z } from "zod";
import { sendTelegramNotification } from "@/lib/telegram/bot";
import { contactSchema } from "@/lib/validators/contact";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_IP = 5; // Max 5 requests per IP per hour
const MAX_REQUESTS_PER_PHONE = 3; // Max 3 requests per phone per hour
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes for duplicate check

// In-memory rate limiter (for serverless, consider using Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(ip: string): string {
  return `ip:${ip}`;
}

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Clean old entries periodically
function cleanRateLimitMap() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

// Get client IP from request
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    // Clean old rate limit entries
    cleanRateLimitMap();

    // Get client info
    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Check IP rate limit
    const ipRateLimit = checkRateLimit(getRateLimitKey(ip), MAX_REQUESTS_PER_IP);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Too many requests. Please try again later.",
            code: "RATE_LIMIT_EXCEEDED",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": "3600",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await request.json();

    // Check honeypot - if filled, silently reject (bot detected)
    if (body.website && body.website.length > 0) {
      // Return success to not alert the bot, but don't process
      console.log(`[SPAM] Bot detected via honeypot from IP: ${ip}`);
      return NextResponse.json({
        success: true,
        data: {
          id: "blocked",
          message: "Contact request submitted successfully",
        },
      });
    }

    const validated = contactSchema.parse(body);

    // Check phone rate limit
    const phoneRateLimit = checkRateLimit(`phone:${validated.phone}`, MAX_REQUESTS_PER_PHONE);
    if (!phoneRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Too many requests from this phone number. Please try again later.",
            code: "RATE_LIMIT_EXCEEDED",
          },
        },
        { status: 429 }
      );
    }

    // Check for duplicate requests (same phone + same message in last 5 minutes)
    const duplicateWindowStart = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    const existingRequest = await db.query.contactRequests.findFirst({
      where: and(
        eq(contactRequests.phone, validated.phone),
        gte(contactRequests.createdAt, duplicateWindowStart)
      ),
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "You have already submitted a request recently. Please wait before submitting again.",
            code: "DUPLICATE_REQUEST",
          },
        },
        { status: 429 }
      );
    }

    // Get dress name if dressId provided
    let dressName: string | undefined;
    if (validated.dressId) {
      const dress = await db.query.dresses.findFirst({
        where: eq(dresses.id, validated.dressId),
      });
      dressName = dress?.name;
    }

    // Create contact request with IP tracking
    const [contactRequest] = await db
      .insert(contactRequests)
      .values({
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        message: validated.message || null,
        dressId: validated.dressId || null,
        ipAddress: ip,
        userAgent: userAgent,
      })
      .returning();

    // Send Telegram notification (non-blocking)
    sendTelegramNotification({
      name: validated.name,
      phone: validated.phone,
      email: validated.email,
      message: validated.message,
      dressName,
      locale: validated.locale,
    }).catch((error) => {
      console.error("Failed to send Telegram notification:", error);
    });

    return NextResponse.json({
      success: true,
      data: {
        id: contactRequest.id,
        message: "Contact request submitted successfully",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Validation error",
            code: "VALIDATION_ERROR",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error("Failed to submit contact request:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to submit contact request", code: "SUBMIT_ERROR" },
      },
      { status: 500 }
    );
  }
}
