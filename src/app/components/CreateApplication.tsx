import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { createApplication } from "../../services/jobApplicationService";
import { ApiError } from "../../services/httpClient";
import { useLanguage } from "../../context/LanguageContext";
import type { ApplicationStatus } from "../../types/jobApplications";

const cvVersions = [
  { id: 1, name: "Standard CV - Full Stack", version: "v2.3", date: "2026-04-10" },
  { id: 2, name: "Frontend Focused CV", version: "v1.5", date: "2026-04-08" },
  { id: 3, name: "Leadership CV", version: "v1.2", date: "2026-03-25" },
];

export function CreateApplication() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Draft");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!companyName.trim() || !roleTitle.trim()) {
      setError("Company name and role title are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await createApplication({
        companyName: companyName.trim(),
        roleTitle: roleTitle.trim(),
        status,
        notes: notes.trim(),
      });

      setSuccessMessage("Application created successfully.");
      navigate("/applications", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to save application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link to="/applications" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          {t("pages.createApplication.backToApplications")}
        </Link>
        <h1 className="text-[28px] font-medium mb-1">{t("pages.createApplication.title")}</h1>
        <p className="text-muted-foreground">{t("pages.createApplication.subtitle")}</p>
      </div>

      <div className="max-w-4xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-border p-6 space-y-5">
            <h2 className="text-[17px] font-medium">Basic Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g., Vercel"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g., Senior Frontend Engineer"
                  value={roleTitle}
                  onChange={(event) => setRoleTitle(event.target.value)}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
                disabled={isSubmitting}
              >
                <option value="Draft">Draft</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Notes</label>
              <textarea
                rows={4}
                placeholder="Add any notes about this application..."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border resize-none"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm px-3 py-2">
                {successMessage}
              </div>
            )}
          </div>

          {/* CV Document Selection */}
          <div className="bg-white rounded-lg border border-border p-6 space-y-5">
            <h2 className="text-[17px] font-medium">Select CV Version</h2>
            <div className="space-y-2">
              {cvVersions.map((cv) => (
                <label key={cv.id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-[#fafafa] cursor-pointer transition-colors">
                  <input type="radio" name="cv" className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{cv.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {cv.version} • Updated {cv.date}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-60"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save Application"}
            </button>
            <Link
              to="/applications"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
