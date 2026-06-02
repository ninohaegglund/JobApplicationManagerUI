import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Download, Eye, Filter, Mail, Pencil, Plus, Search, Trash2, X } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { ApiError } from "../../services/httpClient";
import {
  createApplicationEmail,
  deleteApplicationEmail,
  getApplicationEmails,
  updateApplicationEmail,
} from "../../services/applicationEmailService";
import {
  deleteApplication,
  exportJobApplications,
  getAllApplications,
  updateApplicationStatus,
} from "../../services/jobApplicationService";
import { useLanguage } from "../../context/LanguageContext";
import { EmailType, type ApplicationEmailDto } from "../../types/applicationEmails";
import type { ApplicationStatus, JobApplication } from "../../types/jobApplications";

const filters: Array<"All" | ApplicationStatus> = [
  "All",
  "Draft",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

type EmailFormMode = "create" | "edit";

interface EmailFormState {
  mode: EmailFormMode;
  id?: number;
  subject: string;
  sender: string;
  body: string;
  receivedAt: string;
  type: EmailType;
}

const emailTypeOptions: Array<{ value: EmailType; label: string }> = [
  { value: EmailType.General, label: "General" },
  { value: EmailType.Interview, label: "Interview" },
  { value: EmailType.Rejection, label: "Rejection" },
  { value: EmailType.Offer, label: "Offer" },
  { value: EmailType.FollowUp, label: "FollowUp" },
];

function getEmailTypeLabel(type: EmailType): string {
  switch (type) {
    case EmailType.General:
      return "General";
    case EmailType.Interview:
      return "Interview";
    case EmailType.Rejection:
      return "Rejection";
    case EmailType.Offer:
      return "Offer";
    case EmailType.FollowUp:
      return "FollowUp";
    default:
      return "General";
  }
}

function getEmailTypeStyles(type: EmailType): string {
  switch (type) {
    case EmailType.Interview:
      return "bg-green-50 text-green-700 border-green-200";
    case EmailType.Rejection:
      return "bg-red-50 text-red-700 border-red-200";
    case EmailType.Offer:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case EmailType.FollowUp:
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function formatEmailDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTimeLocal(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getCurrentDateTimeLocal(): string {
  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function normalizeDateTimeInput(value: string): string {
  if (!value) {
    return value;
  }

  if (value.length === 16) {
    return `${value}:00`;
  }

  return value;
}

export function Applications() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [applicationPendingDelete, setApplicationPendingDelete] = useState<JobApplication | null>(null);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);
  const [emailApplication, setEmailApplication] = useState<JobApplication | null>(null);
  const [emails, setEmails] = useState<ApplicationEmailDto[]>([]);
  const [isEmailsLoading, setIsEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);
  const [emailFormState, setEmailFormState] = useState<EmailFormState | null>(null);
  const [emailFormError, setEmailFormError] = useState<string | null>(null);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailDetails, setEmailDetails] = useState<ApplicationEmailDto | null>(null);
  const [emailPendingDelete, setEmailPendingDelete] = useState<ApplicationEmailDto | null>(null);
  const [deletingEmailId, setDeletingEmailId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;

    async function loadApplications() {
      setIsLoading(true);
      setError(null);
      setActionError(null);

      try {
        const data = await getAllApplications(debouncedSearch);

        if (isMounted) {
          setApplications(data);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("Unable to load applications.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadApplications();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch]);

  useEffect(() => {
    const applicationId = emailApplication?.id;

    if (!emailDrawerOpen || applicationId === undefined || applicationId === null) {
      return;
    }

    const resolvedApplicationId = applicationId;

    let isMounted = true;

    async function loadEmails() {
      setIsEmailsLoading(true);
      setEmailsError(null);

      try {
        const data = await getApplicationEmails(resolvedApplicationId);

        if (isMounted) {
          setEmails(data);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setEmailsError(err.message);
          } else {
            setEmailsError("Unable to load emails.");
          }
        }
      } finally {
        if (isMounted) {
          setIsEmailsLoading(false);
        }
      }
    }

    void loadEmails();

    return () => {
      isMounted = false;
    };
  }, [emailDrawerOpen, emailApplication?.id]);

  const filteredApplications = useMemo(() => {
    if (activeFilter === "All") {
      return applications;
    }

    return applications.filter((application) => application.status === activeFilter);
  }, [activeFilter, applications]);

  const emailInputClassName =
    "w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border";

  function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  }

  async function handleDelete(id: string | number) {
    setActionError(null);
    setDeletingId(id);

    try {
      await deleteApplication(id);
      setApplications((previous) => previous.filter((application) => application.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("Unable to delete application.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!applicationPendingDelete) {
      return;
    }

    await handleDelete(applicationPendingDelete.id);
    setApplicationPendingDelete(null);
  }

  async function handleStatusChange(id: string | number, status: ApplicationStatus) {
    setActionError(null);
    setUpdatingStatusId(id);

    try {
      await updateApplicationStatus(id, { status });
      setApplications((previous) =>
        previous.map((application) =>
          application.id === id
            ? {
                ...application,
                status,
                updatedAt: new Date().toISOString(),
              }
            : application
        )
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("Unable to update application status.");
      }
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleExportApplications() {
    if (isExporting) {
      return;
    }

    setActionError(null);
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
        setActionError(err.message);
      } else {
        setActionError("Unable to export applications.");
      }
    } finally {
      setIsExporting(false);
    }
  }

  function handleOpenEmails(application: JobApplication) {
    setEmailApplication(application);
    setEmailDrawerOpen(true);
    setEmailsError(null);
    setEmailFormError(null);
    setEmailFormState(null);
  }

  function handleEmailDrawerOpenChange(open: boolean) {
    setEmailDrawerOpen(open);

    if (!open) {
      setEmailApplication(null);
      setEmails([]);
      setEmailsError(null);
      setEmailFormState(null);
      setEmailFormError(null);
      setIsEmailsLoading(false);
      setIsSavingEmail(false);
      setEmailDetails(null);
      setEmailPendingDelete(null);
      setDeletingEmailId(null);
    }
  }

  function startCreateEmail() {
    setEmailFormState({
      mode: "create",
      subject: "",
      sender: "",
      body: "",
      receivedAt: getCurrentDateTimeLocal(),
      type: EmailType.General,
    });
    setEmailFormError(null);
  }

  function startEditEmail(email: ApplicationEmailDto) {
    setEmailFormState({
      mode: "edit",
      id: email.id,
      subject: email.subject,
      sender: email.sender,
      body: email.body,
      receivedAt: formatDateTimeLocal(email.receivedAt),
      type: email.type,
    });
    setEmailFormError(null);
  }

  function updateEmailForm(next: Partial<EmailFormState>) {
    setEmailFormState((previous) => (previous ? { ...previous, ...next } : previous));
  }

  async function refreshEmails() {
    if (!emailApplication) {
      return;
    }

    setIsEmailsLoading(true);
    setEmailsError(null);

    try {
      const data = await getApplicationEmails(emailApplication.id);
      setEmails(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setEmailsError(err.message);
      } else {
        setEmailsError("Unable to load emails.");
      }
    } finally {
      setIsEmailsLoading(false);
    }
  }

  async function handleSaveEmail() {
    if (!emailFormState || !emailApplication || isSavingEmail) {
      return;
    }

    const subject = emailFormState.subject.trim();
    const sender = emailFormState.sender.trim();
    const body = emailFormState.body.trim();
    const receivedAt = emailFormState.receivedAt.trim();

    if (!subject) {
      setEmailFormError("Subject is required.");
      return;
    }

    if (subject.length > 200) {
      setEmailFormError("Subject must be 200 characters or less.");
      return;
    }

    if (!sender) {
      setEmailFormError("Sender is required.");
      return;
    }

    if (sender.length > 200) {
      setEmailFormError("Sender must be 200 characters or less.");
      return;
    }

    if (!body) {
      setEmailFormError("Body is required.");
      return;
    }

    if (!receivedAt) {
      setEmailFormError("Received date is required.");
      return;
    }

    setIsSavingEmail(true);
    setEmailFormError(null);

    const payload = {
      subject,
      sender,
      body,
      receivedAt: normalizeDateTimeInput(receivedAt),
      type: emailFormState.type,
    };

    try {
      if (emailFormState.mode === "edit" && emailFormState.id !== undefined) {
        await updateApplicationEmail(emailFormState.id, payload);
      } else {
        await createApplicationEmail(emailApplication.id, payload);
      }

      await refreshEmails();
      setEmailFormState(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setEmailFormError(err.message);
      } else {
        setEmailFormError("Unable to save email.");
      }
    } finally {
      setIsSavingEmail(false);
    }
  }

  async function handleConfirmEmailDelete() {
    if (!emailPendingDelete || deletingEmailId !== null) {
      return;
    }

    setDeletingEmailId(emailPendingDelete.id);
    setEmailsError(null);

    try {
      const deletedId = emailPendingDelete.id;

      await deleteApplicationEmail(deletedId);
      await refreshEmails();

      if (emailDetails?.id === deletedId) {
        setEmailDetails(null);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setEmailsError(err.message);
      } else {
        setEmailsError("Unable to delete email.");
      }
    } finally {
      setDeletingEmailId(null);
      setEmailPendingDelete(null);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium mb-1">{t("nav.applications")}</h1>
          <p className="text-muted-foreground">{t("pages.applications.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleExportApplications()}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Export to Excel"}
          </button>
          <Link
            to="/applications/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Application
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search company or role"
              className="w-full bg-white border border-border rounded-lg text-sm pl-9 pr-10 py-2 focus:outline-none focus:border-border"
            />
            {searchInput.trim() && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-[#fafafa] hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filter === activeFilter
                  ? "bg-foreground text-background"
                  : "bg-white border border-border hover:bg-[#fafafa]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {actionError && (
          <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
            {actionError}
          </div>
        )}

        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[#fafafa]">
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Company</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Role Title</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Notes</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Created</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Updated</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-sm text-muted-foreground text-center">
                  Loading applications...
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-sm text-red-700 bg-red-50 text-center">
                  {error}
                </td>
              </tr>
            )}

            {!isLoading && !error && filteredApplications.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-sm text-muted-foreground text-center">
                  No applications found.
                </td>
              </tr>
            )}

            {!isLoading && !error && filteredApplications.map((app) => (
              <tr key={app.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-6 py-4 font-medium">{app.companyName}</td>
                <td className="px-6 py-4 text-muted-foreground">{app.roleTitle}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground max-w-[260px]">
                  {app.notes ? (
                    <p className="truncate" title={app.notes}>{app.notes}</p>
                  ) : (
                    <span className="text-muted-foreground/70">No notes</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={app.status}
                    onChange={(event) =>
                      void handleStatusChange(app.id, event.target.value as ApplicationStatus)
                    }
                    disabled={updatingStatusId === app.id || deletingId === app.id}
                    className="px-2 py-1 text-xs bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(app.createdAt)}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(app.updatedAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleOpenEmails(app)}
                          disabled={deletingId === app.id || updatingStatusId === app.id}
                          className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-60"
                          aria-label={`View emails for ${app.companyName}`}
                        >
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">View emails</TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => setApplicationPendingDelete(app)}
                      disabled={deletingId === app.id || updatingStatusId === app.id}
                      className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={emailDrawerOpen} onOpenChange={handleEmailDrawerOpenChange}>
        <SheetContent side="right" className="sm:max-w-xl">
          <SheetHeader className="border-b border-border">
            <SheetTitle>
              Emails - {emailApplication?.companyName ?? "Application"}
            </SheetTitle>
            <SheetDescription>
              {emailApplication?.roleTitle ?? "Role title not set"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium">Saved emails</h2>
                {emailApplication && (
                  <p className="text-xs text-muted-foreground">
                    {emails.length} total
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={startCreateEmail}
                disabled={!emailApplication || isSavingEmail}
                className="inline-flex items-center gap-2 px-3 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                Add Email
              </button>
            </div>

            {emailFormState && (
              <div className="rounded-lg border border-border p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium">
                    {emailFormState.mode === "edit" ? "Edit email" : "Add email"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Paste the email details and save it to this application.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Subject</label>
                    <input
                      type="text"
                      value={emailFormState.subject}
                      onChange={(event) => updateEmailForm({ subject: event.target.value })}
                      maxLength={200}
                      className={emailInputClassName}
                      disabled={isSavingEmail}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Sender</label>
                    <input
                      type="text"
                      value={emailFormState.sender}
                      onChange={(event) => updateEmailForm({ sender: event.target.value })}
                      maxLength={200}
                      className={emailInputClassName}
                      disabled={isSavingEmail}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Body</label>
                  <textarea
                    rows={4}
                    value={emailFormState.body}
                    onChange={(event) => updateEmailForm({ body: event.target.value })}
                    className={`${emailInputClassName} resize-none`}
                    disabled={isSavingEmail}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Received</label>
                    <input
                      type="datetime-local"
                      value={emailFormState.receivedAt}
                      onChange={(event) => updateEmailForm({ receivedAt: event.target.value })}
                      className={emailInputClassName}
                      disabled={isSavingEmail}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Type</label>
                    <select
                      value={String(emailFormState.type)}
                      onChange={(event) =>
                        updateEmailForm({
                          type: Number(event.target.value) as EmailType,
                        })
                      }
                      className={emailInputClassName}
                      disabled={isSavingEmail}
                    >
                      {emailTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {emailFormError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                    {emailFormError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailFormState(null)}
                    className="px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSaveEmail()}
                    disabled={isSavingEmail}
                    className={`px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors ${
                      isSavingEmail ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSavingEmail
                      ? "Saving..."
                      : emailFormState.mode === "edit"
                        ? "Save Email"
                        : "Add Email"}
                  </button>
                </div>
              </div>
            )}

            {emailsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                {emailsError}
              </div>
            )}

            {isEmailsLoading && (
              <div className="text-sm text-muted-foreground">Loading emails...</div>
            )}

            {!isEmailsLoading && !emailsError && emails.length === 0 && (
              <div className="text-sm text-muted-foreground">No saved emails yet.</div>
            )}

            {!isEmailsLoading && !emailsError && emails.length > 0 && (
              <div className="space-y-3">
                {emails.map((email) => (
                  <div key={email.id} className="rounded-lg border border-border p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{email.subject}</p>
                        <p className="text-xs text-muted-foreground">{email.sender}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatEmailDate(email.receivedAt)}</span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded border ${getEmailTypeStyles(
                              email.type,
                            )}`}
                          >
                            {getEmailTypeLabel(email.type)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEmailDetails(email)}
                          disabled={isSavingEmail || deletingEmailId === email.id}
                          className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-60"
                          aria-label={`View email ${email.subject}`}
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditEmail(email)}
                          disabled={isSavingEmail || deletingEmailId === email.id}
                          className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-60"
                          aria-label={`Edit email ${email.subject}`}
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailPendingDelete(email)}
                          disabled={isSavingEmail || deletingEmailId === email.id}
                          className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-60"
                          aria-label={`Delete email ${email.subject}`}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {email.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={emailDetails !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEmailDetails(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          {emailDetails ? (
            <>
              <DialogHeader>
                <DialogTitle>{emailDetails.subject}</DialogTitle>
                <DialogDescription>Full email details</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{emailDetails.sender}</span>
                  <span>•</span>
                  <span>{formatEmailDate(emailDetails.receivedAt)}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded border ${getEmailTypeStyles(
                      emailDetails.type,
                    )}`}
                  >
                    {getEmailTypeLabel(emailDetails.type)}
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-[#fafafa] p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {emailDetails.body}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setEmailDetails(null)}
                  className="px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
                >
                  Close
                </button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={emailPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEmailPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete email?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the saved email
              {emailPendingDelete?.subject ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    "{emailPendingDelete.subject}"
                  </span>
                </>
              ) : null}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingEmailId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmEmailDelete();
              }}
              disabled={deletingEmailId !== null}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingEmailId !== null ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={applicationPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setApplicationPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the application for
              {" "}
              <span className="font-medium text-foreground">{applicationPendingDelete?.companyName}</span>
              {" "}
              ({applicationPendingDelete?.roleTitle}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
              disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingId !== null ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
