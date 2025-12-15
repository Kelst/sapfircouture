"use server";

import { db } from "@/lib/db";
import { contactRequests, dresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { contactSchema, type ContactInput } from "@/lib/validators/contact";
import { sendTelegramNotification } from "@/lib/telegram/bot";

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

export async function getContactRequests() {
  return db.query.contactRequests.findMany({
    orderBy: (contactRequests, { desc }) => [desc(contactRequests.createdAt)],
  });
}

export async function markContactRequestProcessed(id: string) {
  const [request] = await db
    .update(contactRequests)
    .set({ isProcessed: true })
    .where(eq(contactRequests.id, id))
    .returning();

  return request;
}
