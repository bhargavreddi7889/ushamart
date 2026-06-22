import { getAdminSettings } from "@/actions/admin/management";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Store Settings" };

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
