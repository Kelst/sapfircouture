"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import { createUser, updateUser } from "@/actions/user.actions";
import type { User } from "@/lib/db/schema";

interface UserFormProps {
  user?: User;
}

// Create a combined schema for the form
const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

type FormInput = z.infer<typeof formSchema>;

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const isEditing = !!user;

  const form = useForm<FormInput>({
    resolver: zodResolver(
      isEditing
        ? formSchema.omit({ password: true })
        : formSchema.extend({
            password: z.string().min(8, "Password must be at least 8 characters"),
          })
    ),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
    },
  });

  async function onSubmit(data: FormInput) {
    try {
      if (isEditing) {
        const updateData: { name?: string; email?: string } = {};
        if (data.name !== user.name) updateData.name = data.name;
        if (data.email !== user.email) updateData.email = data.email;

        await updateUser(user.id, updateData);
        toast.success("User updated");
      } else {
        await createUser({
          name: data.name,
          email: data.email,
          password: data.password!,
        });
        toast.success("User created");
      }
      router.push("/admin/users");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit User" : "New Admin"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update user details" : "Create a new admin account"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormDescription>Minimum 8 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update User"
                  : "Create Admin"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
