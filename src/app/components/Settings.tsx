import { Save } from "lucide-react";

export function Settings() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium mb-1">Settings</h1>
        <p className="text-muted-foreground">Configure your application preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          <h2 className="text-[17px] font-medium">General</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm mb-1">Email Notifications</div>
                <div className="text-xs text-muted-foreground">
                  Receive email updates about your applications
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm mb-1">Application Reminders</div>
                <div className="text-xs text-muted-foreground">
                  Get reminded to follow up on applications
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          <h2 className="text-[17px] font-medium">Export Preferences</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Default Export Format</label>
              <select className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border">
                <option>PDF</option>
                <option>DOCX</option>
                <option>Both</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">File Naming Convention</label>
              <select className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border">
                <option>Company_Role_Date</option>
                <option>Date_Company_Role</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          <h2 className="text-[17px] font-medium">Data Management</h2>

          <div className="space-y-4">
            <div>
              <button className="px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors text-sm">
                Export All Data
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Download all your applications and documents
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm">
                Delete All Data
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Permanently remove all your data from the system
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
