import { db } from "../src/lib/db";
import { users, accounts } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";

async function seed() {
  const email = process.env.ADMIN_EMAIL || "admin@sapfircouture.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";

  console.log("Creating admin user...");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  const hashedPassword = await hashPassword(password);

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existingUser) {
    console.log("User already exists, updating role to admin...");
    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, existingUser.id));
    console.log("Done!");
    process.exit(0);
  }

  const userId = randomUUID();

  // Create user with admin role
  const [user] = await db
    .insert(users)
    .values({
      id: userId,
      email,
      name,
      role: "admin",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Create credential account
  await db.insert(accounts).values({
    id: randomUUID(),
    userId: user.id,
    accountId: user.id,
    providerId: "credential",
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Admin user created successfully!");
  console.log(`\nLogin credentials:`);
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`\nChange these in production!`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
