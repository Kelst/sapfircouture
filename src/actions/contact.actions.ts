"use server";

import { db } from "@/lib/db";
import { contactRequests, dresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { contactSchema, type ContactInput } from "@/lib/validators/contact";
import { sendTelegramNotification } from "@/lib/telegram/bot";
import { requireAdmin } from "@/lib/auth/helpers";

export async function submitContactRequest(input: ContactInput) {
  const validated = contactSchema.parse(input);

  // Get dress name if dressId is provided
  let dressName: string | undefined;
  if (validated.dressId) {
    const dress = await db.query.dresses.findFirst({
      where: eq(dresses.id, validated.dressId),
    });
    dressName = dress?.name;
  }

  // Save to database
  const [contactRequest] = await db
    .insert(contactRequests)
    .values(validated)
    .returning();

  // Send Telegram notification
  await sendTelegramNotification({
    name: validated.name,
    phone: validated.phone,
    email: validated.email || undefined,
    message: validated.message || undefined,
    dressName,
  });

  return contactRequest;
}

export async function getContactRequests(page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const [requests, totalResult] = await Promise.all([
    db.query.contactRequests.findMany({
      orderBy: (contactRequests, { desc }) => [desc(contactRequests.createdAt)],
      limit,
      offset,
    }),
    db.select({ count: contactRequests.id }).from(contactRequests),
  ]);

  const total = totalResult.length;
  const totalPages = Math.ceil(total / limit);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function getContactRequestsStats() {
  const all = await db.query.contactRequests.findMany();
  return {
    total: all.length,
    unprocessed: all.filter((r) => !r.isProcessed).length,
    processed: all.filter((r) => r.isProcessed).length,
  };
}

export async function markContactRequestProcessed(id: string) {
  await requireAdmin();

  const [request] = await db
    .update(contactRequests)
    .set({ isProcessed: true })
    .where(eq(contactRequests.id, id))
    .returning();

  revalidatePath("/admin/requests");
  return request;
}
