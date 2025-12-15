"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import {
  saveTelegramSettings,
  testTelegramConnection,
} from "@/actions/settings.actions";

interface TelegramSettingsFormProps {
  initialSettings: {
    botToken: string;
    chatId: string;
    isConfigured: boolean;
  };
}

const formSchema = z.object({
  botToken: z.string().min(1, "Bot token is required"),
  chatId: z.string().min(1, "Chat ID is required"),
});

type FormInput = z.infer<typeof formSchema>;

export function TelegramSettingsForm({
  initialSettings,
}: TelegramSettingsFormProps) {
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(initialSettings.isConfigured);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      botToken: initialSettings.botToken,
      chatId: initialSettings.chatId,
    },
  });

  async function onSubmit(data: FormInput) {
    try {
      await saveTelegramSettings(data.botToken, data.chatId);
      setIsConfigured(true);
      toast.success("Telegram settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  }

  async function handleTestConnection() {
    const values = form.getValues();
    if (!values.botToken || !values.chatId) {
      toast.error("Please fill in both fields first");
      return;
    }

    setIsTesting(true);
    try {
      const result = await testTelegramConnection(values.botToken, values.chatId);
      if (result.success) {
        toast.success("Test message sent! Check your Telegram.");
      } else {
        toast.error(result.error || "Failed to send test message");
      }
    } catch (error) {
      toast.error("Connection test failed");
    } finally {
      setIsTesting(false);
    }
  }

  const maskedToken = (token: string) => {
    if (!token) return "";
    if (token.length <= 8) return "********";
    return `${"*".repeat(token.length - 4)}${token.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Telegram Notifications
            </CardTitle>
            <CardDescription>
              Configure Telegram bot to receive notifications about new contact
              requests
            </CardDescription>
          </div>
          {isConfigured ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="botToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Token</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showToken ? "text" : "password"}
                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                        {...field}
                        value={showToken ? field.value : (field.value ? maskedToken(field.value) : "")}
                        onChange={(e) => {
                          if (showToken) {
                            field.onChange(e);
                          }
                        }}
                        onFocus={() => setShowToken(true)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Get this from @BotFather on Telegram
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chatId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chat ID</FormLabel>
                  <FormControl>
                    <Input placeholder="-1001234567890" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your personal or group chat ID. Use @userinfobot to get it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
