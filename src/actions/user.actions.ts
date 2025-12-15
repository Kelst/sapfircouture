"use server";

import { db } from "@/lib/db";
import { users, accounts, sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin, getCurrentUser } from "@/lib/auth/helpers";
import { auth } from "@/lib/auth";
import { hashPassword } from "better-auth/crypto";
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type ChangePasswordInput,
} from "@/lib/validators/user";

export async function getUsers() {
  await requireAdmin();
  return db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });
}

export async function getUserById(id: string) {
  await requireAdmin();
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function createUser(input: CreateUserInput) {
  await requireAdmin();
  const validated = createUserSchema.parse(input);

  // Check if email already exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, validated.email),
  });

  if (existing) {
    throw new Error("User with this email already exists");
  }

  // Use Better Auth API to create user with proper password hashing
  const result = await auth.api.signUpEmail({
    body: {
      name: validated.name,
      email: validated.email,
      password: validated.password,
    },
  });

  if (!result || !result.user) {
    throw new Error("Failed to create user");
  }

  // Set role to admin
  await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.id, result.user.id));

  revalidatePath("/admin/users");

  return result.user;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  await requireAdmin();
  const validated = updateUserSchema.parse(input);

  // Check if trying to change email to an existing one
  if (validated.email) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, validated.email),
    });

    if (existing && existing.id !== id) {
      throw new Error("User with this email already exists");
    }
  }

  const [user] = await db
    .update(users)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);

  return user;
}

export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  // Check if user is trying to delete themselves
  const currentUser = await getCurrentUser();
  if (currentUser?.id === id) {
    return {
      success: false,
      error: "You cannot delete your own account",
    };
  }

  // Delete user (sessions and accounts will cascade)
  await db.delete(users).where(eq(users.id, id));

  revalidatePath("/admin/users");

  return { success: true };
}

export async function changeUserPassword(
  id: string,
  input: ChangePasswordInput
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const validated = changePasswordSchema.parse(input);

  // Use Better Auth's hashPassword for consistent hashing
  const hashedPassword = await hashPassword(validated.newPassword);

  // Update account password
  await db
    .update(accounts)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(accounts.userId, id));

  // Invalidate all user sessions (force re-login)
  await db.delete(sessions).where(eq(sessions.userId, id));

  revalidatePath("/admin/users");

  return { success: true };
}

export async function toggleUserVerification(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  const newStatus = !user.emailVerified;

  await db
    .update(users)
    .set({
      emailVerified: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));

  revalidatePath("/admin/users");

  return { success: true };
}
