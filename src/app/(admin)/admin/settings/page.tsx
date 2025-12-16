import { getTelegramSettings, getContactSettings, getContentSettings } from "@/actions/settings.actions";
import { TelegramSettingsForm } from "@/components/admin/telegram-settings-form";
import { ContactSettingsForm } from "@/components/admin/contact-settings-form";
import { ContentSettingsForm } from "@/components/admin/content-settings-form";

export default async function SettingsPage() {
  const [telegramSettings, contactSettings, contentSettings] = await Promise.all([
    getTelegramSettings(),
    getContactSettings(),
    getContentSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your application settings
        </p>
      </div>

      <div className="grid gap-6">
        <ContactSettingsForm initialSettings={contactSettings} />
        <ContentSettingsForm initialSettings={contentSettings} />
        <TelegramSettingsForm initialSettings={telegramSettings} />
      </div>
    </div>
  );
}
