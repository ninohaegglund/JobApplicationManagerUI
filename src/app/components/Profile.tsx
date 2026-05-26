import { Save, User } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function Profile() {
  const { t } = useLanguage();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium mb-1">{t("nav.profile")}</h1>
        <p className="text-muted-foreground">{t("pages.profile.subtitle")}</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Profile Picture */}
        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          <h2 className="text-[17px] font-medium">Profile Picture</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <button className="px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors text-sm">
                Upload Photo
              </button>
              <p className="text-xs text-muted-foreground mt-2">JPG or PNG, max 2MB</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          <h2 className="text-[17px] font-medium">Personal Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">First Name</label>
              <input
                type="text"
                defaultValue="Nino"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Last Name</label>
              <input
                type="text"
                defaultValue="Hägglund"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Email</label>
              <input
                type="email"
                defaultValue="ninomh99@gmail.com"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Phone Number</label>
              <input
                type="tel"
                defaultValue="+46 72 152 98 60"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Address</label>
            <input
              type="text"
              defaultValue="Tövädersgatan 13D"
              className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Postal Code</label>
              <input
                type="text"
                defaultValue="754 31"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">City</label>
              <input
                type="text"
                defaultValue="Uppsala"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Country</label>
              <input
                type="text"
                defaultValue="Sweden"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Birth Year</label>
              <input
                type="number"
                defaultValue="1999"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Legal Gender</label>
              <select className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border">
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          <h2 className="text-[17px] font-medium">Professional Links</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">LinkedIn URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                defaultValue="https://www.linkedin.com/in/nino-h%C3%A4gglund-441740307/"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">GitHub URL</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                defaultValue="https://github.com/ninohaegglund"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <button className="px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
