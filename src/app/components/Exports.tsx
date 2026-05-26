import { useState } from "react";
import { Download } from "lucide-react";
import { ApiError } from "../../services/httpClient";
import { exportJobApplications } from "../../services/jobApplicationService";
import { useLanguage } from "../../context/LanguageContext";

export function Exports() {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExportApplications() {
    if (isExporting) {
      return;
    }

    setError(null);
    setIsExporting(true);

    try {
      const result = await exportJobApplications();
      const objectUrl = URL.createObjectURL(result.blob);
      const anchor = window.document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = result.fileName;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to export applications.");
      }
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium mb-1">{t("nav.exports")}</h1>
          <p className="text-muted-foreground">{t("pages.exports.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleExportApplications()}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-border">
        <div className="p-6 space-y-2">
          <h2 className="text-sm font-medium">Job applications</h2>
          <p className="text-sm text-muted-foreground">
            Export all applications as an Excel (.xlsx) file.
          </p>
        </div>
      </div>
    </div>
  );
}
