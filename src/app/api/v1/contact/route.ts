import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactRequests, dresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sendTelegramNotification } from "@/lib/telegram/bot";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(1, "Phone is required").max(20),
  email: z.string().email().max(255).optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  dressId: z.string().uuid().optional(),
  locale: z.string().max(5).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    // Get dress name if dressId provided
    let dressName: string | undefined;
    if (validated.dressId) {
      const dress = await db.query.dresses.findFirst({
        where: eq(dresses.id, validated.dressId),
      });
      dressName = dress?.name;
    }

    // Create contact request
    const [contactRequest] = await db
      .insert(contactRequests)
      .values({
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        message: validated.message || null,
        dressId: validated.dressId || null,
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
