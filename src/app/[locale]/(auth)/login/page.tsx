"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, signOut } from "@/lib/auth/client";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

type ErrorCode =
  | "INVALID_EMAIL_OR_PASSWORD"
  | "USER_NOT_FOUND"
  | "INVALID_PASSWORD"
  | "TOO_MANY_REQUESTS"
  | "EMAIL_NOT_VERIFIED"
  | "ACCOUNT_LOCKED"
  | "ACCESS_DENIED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

function getErrorMessage(error: { code?: string; message?: string } | null): {
  code: ErrorCode;
  message: string;
} {
  if (!error) {
    return { code: "UNKNOWN", message: "An unexpected error occurred" };
  }

  const code = error.code?.toUpperCase() || "";
  const message = error.message?.toLowerCase() || "";

  // Better Auth error codes mapping
  if (
    code.includes("INVALID_EMAIL_OR_PASSWORD") ||
    code.includes("INVALID_CREDENTIALS") ||
    message.includes("invalid email or password") ||
    message.includes("invalid credentials")
  ) {
    return {
      code: "INVALID_EMAIL_OR_PASSWORD",
      message: "Invalid email or password. Please check your credentials and try again.",
    };
  }

  if (
    code.includes("USER_NOT_FOUND") ||
    message.includes("user not found") ||
    message.includes("no user")
  ) {
    return {
      code: "USER_NOT_FOUND",
      message: "No account found with this email address.",
    };
  }

  if (
    code.includes("INVALID_PASSWORD") ||
    message.includes("invalid password") ||
    message.includes("wrong password") ||
    message.includes("incorrect password")
  ) {
    return {
      code: "INVALID_PASSWORD",
      message: "Incorrect password. Please try again.",
    };
  }

  if (
    code.includes("TOO_MANY_REQUESTS") ||
    code.includes("RATE_LIMIT") ||
    message.includes("too many") ||
    message.includes("rate limit")
  ) {
    return {
      code: "TOO_MANY_REQUESTS",
      message: "Too many login attempts. Please wait a few minutes and try again.",
    };
  }

  if (
    code.includes("EMAIL_NOT_VERIFIED") ||
    message.includes("email not verified") ||
    message.includes("verify your email")
  ) {
    return {
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email address before signing in.",
    };
  }

  if (
    code.includes("ACCOUNT_LOCKED") ||
    code.includes("ACCOUNT_DISABLED") ||
    message.includes("locked") ||
    message.includes("disabled")
  ) {
    return {
      code: "ACCOUNT_LOCKED",
      message: "Your account has been locked. Please contact an administrator.",
    };
  }

  // Generic fallback
  return {
    code: "UNKNOWN",
    message: error.message || "An error occurred during sign in. Please try again.",
  };
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/collections";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ code: ErrorCode; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Handle access denied error from admin redirect
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "access_denied") {
      // Sign out the user and show error
      signOut().then(() => {
        setError({
          code: "ACCESS_DENIED",
          message: "Access denied. You don't have permission to access the admin panel.",
        });
      });
    }
  }, [searchParams]);

  function validateForm(): boolean {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("[LOGIN] Starting sign in...", { email: email.trim().toLowerCase() });

      const result = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log("[LOGIN] Sign in result:", JSON.stringify(result, null, 2));

      if (result.error) {
        console.log("[LOGIN] Sign in error:", result.error);
        const parsedError = getErrorMessage(result.error);
        setError(parsedError);

        // Set field-specific errors for better UX
        if (parsedError.code === "USER_NOT_FOUND") {
          setFieldErrors({ email: "No account found with this email" });
        } else if (parsedError.code === "INVALID_PASSWORD") {
          setFieldErrors({ password: "Incorrect password" });
        }
        return;
      }

      // Success - redirect
      console.log("[LOGIN] Success! Redirecting to:", callbackUrl);
      router.push(callbackUrl);
      console.log("[LOGIN] router.push called, now calling refresh...");
      router.refresh();
      console.log("[LOGIN] router.refresh called");
    } catch (err) {
      console.error("[LOGIN] Unexpected error:", err);
      // Network or unexpected errors
      setError({
        code: "NETWORK_ERROR",
        message: "Unable to connect. Please check your internet connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function clearError() {
    if (error) {
      setError(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-purple-300/30 dark:from-pink-900/20 dark:to-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="mx-auto mb-4">
            <Image
              src="/logo.svg"
              alt="Sapfir Couture"
              width={180}
              height={72}
              className="object-contain"
              priority
            />
          </div>

          <CardTitle className="text-xl font-medium text-foreground">
            Admin Panel
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to access the admin panel
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={fieldErrors.email ? "text-red-600 dark:text-red-400" : ""}
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                disabled={isLoading}
                className={`h-11 transition-colors ${
                  fieldErrors.email
                    ? "border-red-500 focus-visible:ring-red-500 dark:border-red-500"
                    : "focus-visible:ring-pink-500"
                }`}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={fieldErrors.password ? "text-red-600 dark:text-red-400" : ""}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  disabled={isLoading}
                  className={`h-11 pr-10 transition-colors ${
                    fieldErrors.password
                      ? "border-red-500 focus-visible:ring-red-500 dark:border-red-500"
                      : "focus-visible:ring-pink-500"
                  }`}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-pink-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer hint */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Contact administrator if you need access
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
