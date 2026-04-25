import { useEffect, useRef, useState } from "react";
import { Upload, Download, Edit, FileText, Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ApiError } from "../../services/httpClient";
import {
  deleteCVDocument,
  downloadCVDocument,
  getCVDocuments,
  markCVDocumentAsDefault,
  previewCVDocument,
  uploadCVDocument,
} from "../../services/cvDocumentsService";
import type { CVDocument } from "../../types/cvDocuments";

function getFormatStyles(format: string): {
  iconContainerClass: string;
  iconClass: string;
  badgeClass: string;
} {
  const normalized = format.toUpperCase();

  if (normalized === "PDF") {
    return {
      iconContainerClass: "bg-red-50",
      iconClass: "text-red-600",
      badgeClass: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (normalized === "DOCX" || normalized === "DOC") {
    return {
      iconContainerClass: "bg-blue-50",
      iconClass: "text-blue-600",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  return {
    iconContainerClass: "bg-muted",
    iconClass: "text-muted-foreground",
    badgeClass: "bg-gray-50 text-gray-700 border-gray-200",
  };
}

export function CVDocuments() {
  const [cvDocuments, setCvDocuments] = useState<CVDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [documentPendingDelete, setDocumentPendingDelete] = useState<CVDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      setIsLoading(true);
      setError(null);

      try {
        const documents = await getCVDocuments();

        if (isMounted) {
          setCvDocuments(documents);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("Unable to load CV documents.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  }

  function handleUploadButtonClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploaded = await uploadCVDocument(file);
      setCvDocuments((previous) => [uploaded, ...previous]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to upload CV document.");
      }
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleDownload(document: CVDocument) {
    setProcessingId(document.id);
    setError(null);

    try {
      const result = await downloadCVDocument(document.id);
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
        setError("Unable to download CV document.");
      }
    } finally {
      setProcessingId(null);
    }
  }

  async function handleSetDefault(document: CVDocument) {
    setProcessingId(document.id);
    setError(null);

    try {
      await markCVDocumentAsDefault(document.id);
      setCvDocuments((previous) =>
        previous.map((item) => ({
          ...item,
          isDefault: item.id === document.id,
        }))
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to set default CV document.");
      }
    } finally {
      setProcessingId(null);
    }
  }

  async function handlePreview(document: CVDocument) {
    setProcessingId(document.id);
    setError(null);

    try {
      const blob = await previewCVDocument(document.id);
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 60000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to preview CV document.");
      }
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(document: CVDocument) {
    setProcessingId(document.id);
    setError(null);

    try {
      await deleteCVDocument(document.id);
      setCvDocuments((previous) =>
        previous.filter((item) => item.id !== document.id)
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to delete CV document.");
      }
    } finally {
      setProcessingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!documentPendingDelete) {
      return;
    }

    await handleDelete(documentPendingDelete);
    setDocumentPendingDelete(null);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium mb-1">CV Documents</h1>
          <p className="text-muted-foreground">Manage your curriculum vitae versions</p>
        </div>
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(event) => void handleFileChange(event)}
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={handleUploadButtonClick}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-60"
          >
          <Upload className="w-4 h-4" />
          {isUploading ? "Uploading..." : "Upload New CV"}
          </button>
        </>
      </div>

      {isLoading && (
        <div className="bg-white rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
          Loading CV documents...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {cvDocuments.map((cv) => (
          <div key={cv.id} className="bg-white rounded-lg border border-border p-6 hover:border-muted-foreground transition-colors">
            {(() => {
              const formatStyles = getFormatStyles(cv.format);

              return (
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${formatStyles.iconContainerClass}`}>
                <FileText className={`w-6 h-6 ${formatStyles.iconClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{cv.name}</h3>
                  {cv.isDefault && (
                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span>{cv.version}</span>
                  <span>•</span>
                  <span>{cv.fileSize}</span>
                  <span>•</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${formatStyles.badgeClass}`}>
                    <FileText className="w-3 h-3" />
                    {cv.format}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  Uploaded {formatDate(cv.uploadDate)}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handlePreview(cv)}
                    disabled={processingId === cv.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors disabled:opacity-60"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDownload(cv)}
                    disabled={processingId === cv.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-60"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSetDefault(cv)}
                    disabled={processingId === cv.id || cv.isDefault}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors disabled:opacity-60"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {cv.isDefault ? "Default" : "Set Default"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentPendingDelete(cv)}
                    disabled={processingId === cv.id}
                    className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-60"
                    aria-label={`Delete ${cv.name}`}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
              );
            })()}
          </div>
        ))}

        {!isLoading && cvDocuments.length === 0 && (
          <div className="col-span-2 bg-white rounded-lg border border-border p-6 text-sm text-muted-foreground">
            No CV documents found.
          </div>
        )}
      </div>

      <AlertDialog
        open={documentPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDocumentPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove
              {" "}
              <span className="font-medium text-foreground">{documentPendingDelete?.name}</span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
              disabled={processingId !== null}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processingId !== null ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
