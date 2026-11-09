import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";
import { Link, useParams } from "react-router";
import {
  getApplicationById,
  notifyApplicationsUpdated,
  updateApplicationNotes,
} from "../../services/jobApplicationService";
import { ApiError } from "../../services/httpClient";
import type { JobApplication } from "../../types/jobApplications";

const MAX_NOTES_LENGTH = 2000;

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadApplication() {
      if (!id) {
        setError("Application id is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getApplicationById(id);

        if (isMounted) {
          setApplication(data);
          setNotesDraft(data.notes ?? "");
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load application.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadApplication();

    return () => {
      isMounted = false;
    };
  }, [id]);

  function startEditingNotes() {
    setNotesDraft(application?.notes ?? "");
    setSaveError(null);
    setIsEditingNotes(true);
  }

  function cancelEditingNotes() {
    setNotesDraft(application?.notes ?? "");
    setSaveError(null);
    setIsEditingNotes(false);
  }

  async function handleSaveNotes() {
    if (!application || !id || isSavingNotes) {
      return;
    }

    if (notesDraft.length > MAX_NOTES_LENGTH) {
      setSaveError(`Notes must be ${MAX_NOTES_LENGTH} characters or less.`);
      return;
    }

    setIsSavingNotes(true);
    setSaveError(null);

    const notes = notesDraft.trim().length === 0 ? null : notesDraft;

    try {
      await updateApplicationNotes(id, { notes });
      setApplication((previous) => (previous ? { ...previous, notes } : previous));
      setNotesDraft(notes ?? "");
      setIsEditingNotes(false);
      notifyApplicationsUpdated();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Unable to update notes.");
    } finally {
      setIsSavingNotes(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link
          to="/applications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to applications
        </Link>
        <h1 className="text-[28px] font-medium mb-1">Application details</h1>
        <p className="text-muted-foreground">
          Review the details for this job application.
        </p>
      </div>

      {isLoading && (
        <div className="bg-white rounded-lg border border-border p-6 text-sm text-muted-foreground">
          Loading application...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {!isLoading && !error && application && (
        <div className="max-w-4xl bg-white rounded-lg border border-border p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Company name</p>
              <p className="mt-1 font-medium">{application.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role title</p>
              <p className="mt-1 font-medium">{application.roleTitle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="mt-1">{application.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Application id</p>
              <p className="mt-1">{String(application.id)}</p>
            </div>
          </div>

          <section className="space-y-3" aria-labelledby="application-notes-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="application-notes-heading" className="text-[17px] font-medium">
                Notes
              </h2>
              {!isEditingNotes && (
                <button
                  type="button"
                  onClick={startEditingNotes}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit notes
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={notesDraft}
                  maxLength={MAX_NOTES_LENGTH}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  disabled={isSavingNotes}
                  aria-label="Notes"
                  className="w-full px-3 py-2 bg-[#fafafa] border border-border rounded-lg focus:outline-none focus:border-border resize-none disabled:opacity-60"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {notesDraft.length}/{MAX_NOTES_LENGTH}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEditingNotes}
                      disabled={isSavingNotes}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors disabled:opacity-60"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveNotes()}
                      disabled={isSavingNotes}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingNotes ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
                {saveError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                    {saveError}
                  </div>
                )}
              </div>
            ) : (
              <p className="whitespace-pre-wrap rounded-lg border border-border bg-[#fafafa] px-3 py-3 text-sm text-muted-foreground">
                {application.notes?.trim() ? application.notes : "No notes added."}
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
