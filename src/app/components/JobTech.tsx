import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Search,
  Trash2,
  Wifi,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { ApiError } from "../../services/httpClient";
import { notifyApplicationsUpdated } from "../../services/jobApplicationService";
import { searchJobTech } from "../../services/jobTechService";
import {
  applySavedJob,
  createSavedJob,
  deleteSavedJob,
  getSavedJobs,
} from "../../services/savedJobsService";
import type {
  JobTechEmploymentType,
  JobTechJob,
  JobTechSearchRequest,
  JobTechSearchResponse,
} from "../../types/jobTech";
import type { SavedJob } from "../../types/savedJobs";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const PAGE_SIZE = 20;
const AVAILABLE_LOCATIONS = ["Stockholm", "Uppsala", "Göteborg", "Malmö"];

interface SearchFormState {
  q: string;
  roles: string;
  keywords: string;
  locations: string[];
  employmentType: "all" | JobTechEmploymentType;
  remote: boolean;
  excludedKeywords: string;
}

interface JobTechPreset {
  id: string;
  label: string;
  description: string;
  form: SearchFormState;
}

const INITIAL_FORM: SearchFormState = {
  q: "",
  roles: "",
  keywords: "",
  locations: [],
  employmentType: "all",
  remote: false,
  excludedKeywords: "",
};

const PRESETS: JobTechPreset[] = [
  {
    id: "dotnet",
    label: ".NET-utvecklare",
    description: "C#, ASP.NET Core, Web API och databaser",
    form: {
      q: ".NET",
      roles: ".NET-utvecklare, backendutvecklare, webbutvecklare",
      keywords: "C#, ASP.NET Core, Web API, REST API, SQL, Entity Framework, Azure",
      locations: ["Uppsala", "Stockholm"],
      employmentType: "all",
      remote: false,
      excludedKeywords: "",
    },
  },
  {
    id: "backend-api",
    label: "Backend & API",
    description: "Integrationer, automatisering och databehandling",
    form: {
      q: "backend",
      roles: "backendutvecklare, API-utvecklare, integrationsutvecklare",
      keywords: "C#, ASP.NET Core, API-integration, REST API, JSON, SQL, automatisering",
      locations: ["Uppsala", "Stockholm"],
      employmentType: "all",
      remote: false,
      excludedKeywords: "",
    },
  },
  {
    id: "technical-support",
    label: "Teknisk support",
    description: "Support, felsökning och teknisk dokumentation",
    form: {
      q: "teknisk support",
      roles: "IT-support, supporttekniker, tekniker",
      keywords: "felsökning, dokumentation, API, system",
      locations: ["Uppsala", "Stockholm"],
      employmentType: "all",
      remote: false,
      excludedKeywords: "",
    },
  },
  {
    id: "temporary-store",
    label: "Tillfälligt butiksjobb",
    description: "Ett bredare snabbval för tillfälligt arbete",
    form: {
      q: "butik",
      roles: "butikssäljare, butiksmedarbetare",
      keywords: "",
      locations: ["Uppsala", "Stockholm"],
      employmentType: "all",
      remote: false,
      excludedKeywords: "",
    },
  },
];

function splitValues(value: string): string[] {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toSearchRequest(form: SearchFormState, offset: number): JobTechSearchRequest {
  return {
    q: form.q,
    roles: splitValues(form.roles),
    keywords: splitValues(form.keywords),
    locations: form.locations,
    excludedKeywords: splitValues(form.excludedKeywords),
    employmentType: form.employmentType === "all" ? undefined : form.employmentType,
    remote: form.remote ? true : undefined,
    sort: "pubdate-desc",
    offset,
    limit: PAGE_SIZE,
  };
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatScope(min: number | null, max: number | null): string | null {
  if (min === null && max === null) {
    return null;
  }

  if (min === max || max === null) {
    return `${min ?? max}%`;
  }

  return `${min ?? ""}-${max}%`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "JobTech kunde inte hämta jobbannonser just nu.";
}

function getSavedJobKey(savedJob: SavedJob): string {
  return String(savedJob.id);
}

interface JobCardProps {
  job: JobTechJob;
  isSaved: boolean;
  isSaving: boolean;
  onSave: (job: JobTechJob) => void;
}

function JobCard({ job, isSaved, isSaving, onSave }: JobCardProps) {
  const scope = formatScope(job.scopeOfWorkMin, job.scopeOfWorkMax) ?? job.workingHoursType;

  return (
    <Card className="gap-0 border-[#dce5ed] bg-white shadow-sm">
      <CardHeader className="gap-3 border-b border-[#edf1f5] pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-[19px] font-semibold text-[#233445]">
              {job.headline}
            </CardTitle>
            <p className="mt-1 text-sm text-[#5c7083]">{job.employerName}</p>
          </div>
          <div className="rounded-full bg-[#e8f2fb] px-3 py-1 text-sm font-semibold text-[#1f5c88]">
            {job.matchScore} poäng
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5c7083]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {job.location || job.region || "Plats saknas"}
          </span>
          <span>{job.employmentType || "Anställningstyp saknas"}</span>
          {scope && <span>{scope}{formatScope(job.scopeOfWorkMin, job.scopeOfWorkMax) ? " omfattning" : ""}</span>}
          <span>Publicerad {formatDate(job.publishedAt)}</span>
          {job.remote && (
            <span className="inline-flex items-center gap-1.5 text-[#26734d]">
              <Wifi className="h-4 w-4" /> Distans
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {job.description && (
          <p className="line-clamp-3 text-sm leading-6 text-[#4c6173]">{job.description}</p>
        )}

        {job.matchReasons.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#233445]">Varför den matchar</h3>
            <div className="flex flex-wrap gap-2">
              {job.matchReasons.map((reason, index) => (
                <span
                  key={`${job.id}-reason-${index}`}
                  className="rounded-full border border-[#d9e7f1] bg-[#f5f9fc] px-3 py-1 text-xs text-[#456277]"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-[#edf1f5] pt-4">
          <Button
            type="button"
            size="sm"
            variant={isSaved ? "secondary" : "outline"}
            disabled={isSaved || isSaving}
            onClick={() => onSave(job)}
          >
            {isSaving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {isSaving ? "Sparar..." : isSaved ? "Sparad" : "Spara annons"}
          </Button>
          <Button asChild size="sm">
            <a href={job.webpageUrl} target="_blank" rel="noreferrer">
              Originalannons <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          {job.applicationUrl && (
            <Button asChild size="sm" variant="outline">
              <a href={job.applicationUrl} target="_blank" rel="noreferrer">
                Ansök <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SavedJobCardProps {
  savedJob: SavedJob;
  isDeleting: boolean;
  isApplying: boolean;
  isApplied: boolean;
  onDelete: (savedJob: SavedJob) => void;
  onApply: (savedJob: SavedJob) => void;
}

function SavedJobCard({
  savedJob,
  isDeleting,
  isApplying,
  isApplied,
  onDelete,
  onApply,
}: SavedJobCardProps) {
  const job = savedJob.snapshot;

  return (
    <Card className="gap-0 border-[#dce5ed] bg-white shadow-sm">
      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#233445]">{job.headline}</h3>
            <p className="mt-1 text-sm text-[#5c7083]">{job.employerName}</p>
          </div>
          {isApplied && (
            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              Ansökan skapad
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5c7083]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {job.location || job.region || "Plats saknas"}
          </span>
          <span>Matchningspoäng: {job.matchScore}</span>
          <span>Publicerad {formatDate(job.publishedAt)}</span>
        </div>

        {job.description && (
          <p className="line-clamp-2 text-sm leading-6 text-[#4c6173]">{job.description}</p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-[#edf1f5] pt-4">
          <Button
            type="button"
            size="sm"
            disabled={isApplied || isApplying || isDeleting}
            onClick={() => onApply(savedJob)}
          >
            {isApplying && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isApplying ? "Skapar ansökan..." : isApplied ? "Ansökan skapad" : "Lägg till bland sökta jobb"}
          </Button>
          <Button asChild type="button" size="sm" variant="outline">
            <a href={job.webpageUrl} target="_blank" rel="noreferrer">
              Originalannons <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isDeleting || isApplying}
            onClick={() => onDelete(savedJob)}
          >
            {isDeleting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? "Tar bort..." : "Ta bort"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function JobTech() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState<SearchFormState>(INITIAL_FORM);
  const [results, setResults] = useState<JobTechSearchResponse | null>(null);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isSavedJobsLoading, setIsSavedJobsLoading] = useState(false);
  const [savedJobsError, setSavedJobsError] = useState<string | null>(null);
  const [savingExternalJobId, setSavingExternalJobId] = useState<string | null>(null);
  const [deletingSavedJobId, setDeletingSavedJobId] = useState<string | null>(null);
  const [applyingSavedJobId, setApplyingSavedJobId] = useState<string | null>(null);
  const [appliedSavedJobIds, setAppliedSavedJobIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedJobs([]);
      setSavedJobsError(null);
      setAppliedSavedJobIds([]);
      setIsSavedJobsLoading(false);
      return;
    }

    let isMounted = true;
    setIsSavedJobsLoading(true);
    setSavedJobsError(null);

    async function loadSavedJobs() {
      try {
        const data = await getSavedJobs();

        if (isMounted) {
          setSavedJobs(data);
          setAppliedSavedJobIds(
            data
              .filter((savedJob) => savedJob.isApplied === true || savedJob.applicationId != null)
              .map(getSavedJobKey)
          );
        }
      } catch (savedJobsLoadError) {
        if (isMounted) {
          setSavedJobsError(getErrorMessage(savedJobsLoadError));
        }
      } finally {
        if (isMounted) {
          setIsSavedJobsLoading(false);
        }
      }
    }

    void loadSavedJobs();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  async function runSearch(nextOffset: number, event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setOffset(nextOffset);

    try {
      const response = await searchJobTech(toSearchRequest(form, nextOffset));
      setResults(response);
    } catch (searchError) {
      setResults(null);
      setError(getErrorMessage(searchError));
    } finally {
      setIsLoading(false);
    }
  }

  function toggleLocation(location: string) {
    setForm((current) => ({
      ...current,
      locations: current.locations.includes(location)
        ? current.locations.filter((item) => item !== location)
        : [...current.locations, location],
    }));
  }

  function selectPreset(preset: JobTechPreset) {
    setForm({ ...preset.form, locations: [...preset.form.locations] });
    setActivePresetId(preset.id);
    setResults(null);
    setError(null);
    setOffset(0);
  }

  async function handleSaveJob(job: JobTechJob) {
    if (
      !isAuthenticated ||
      savingExternalJobId === job.id ||
      savedJobs.some((savedJob) => savedJob.externalJobId === job.id)
    ) {
      return;
    }

    setSavingExternalJobId(job.id);
    setSavedJobsError(null);

    try {
      const savedJob = await createSavedJob({
        externalJobId: job.id,
        snapshot: job,
      });

      setSavedJobs((previous) => [
        savedJob,
        ...previous.filter((item) => item.externalJobId !== job.id),
      ]);
    } catch (saveError) {
      setSavedJobsError(getErrorMessage(saveError));
    } finally {
      setSavingExternalJobId(null);
    }
  }

  async function handleDeleteSavedJob(savedJob: SavedJob) {
    const savedJobKey = getSavedJobKey(savedJob);

    if (deletingSavedJobId === savedJobKey || applyingSavedJobId === savedJobKey) {
      return;
    }

    setDeletingSavedJobId(savedJobKey);
    setSavedJobsError(null);

    try {
      await deleteSavedJob(savedJob.id);
      setSavedJobs((previous) => previous.filter((item) => getSavedJobKey(item) !== savedJobKey));
      setAppliedSavedJobIds((previous) => previous.filter((id) => id !== savedJobKey));
    } catch (deleteError) {
      setSavedJobsError(getErrorMessage(deleteError));
    } finally {
      setDeletingSavedJobId(null);
    }
  }

  async function handleApplySavedJob(savedJob: SavedJob) {
    const savedJobKey = getSavedJobKey(savedJob);

    if (
      applyingSavedJobId === savedJobKey ||
      deletingSavedJobId === savedJobKey ||
      appliedSavedJobIds.includes(savedJobKey)
    ) {
      return;
    }

    setApplyingSavedJobId(savedJobKey);
    setSavedJobsError(null);

    try {
      await applySavedJob(savedJob.id);
      setAppliedSavedJobIds((previous) =>
        previous.includes(savedJobKey) ? previous : [...previous, savedJobKey]
      );
      notifyApplicationsUpdated();
    } catch (applyError) {
      setSavedJobsError(getErrorMessage(applyError));
    } finally {
      setApplyingSavedJobId(null);
    }
  }

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = results ? Math.max(1, Math.ceil(results.total / PAGE_SIZE)) : 0;
  const hasPreviousPage = offset > 0;
  const hasNextPage = Boolean(results && offset + PAGE_SIZE < results.total);
  const savedExternalJobIds = useMemo(
    () => new Set(savedJobs.map((savedJob) => savedJob.externalJobId)),
    [savedJobs]
  );

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="mb-1 text-[28px] font-medium">{t("nav.jobTech")}</h1>
        <p className="text-muted-foreground">{t("pages.jobTech.subtitle")}</p>
      </div>

      <Card className="gap-0 border-[#dce5ed] bg-white shadow-sm">
        <CardHeader className="border-b border-[#edf1f5] pb-5">
          <CardTitle className="text-[17px] font-medium">Snabbval</CardTitle>
          <p className="text-sm text-muted-foreground">
            Välj ett snabbval för att fylla i formuläret. Du kan justera filtren innan du söker.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          {PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset)}
                aria-pressed={isActive}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  isActive
                    ? "border-[#6f9dbb] bg-[#f0f7fc]"
                    : "border-[#dce5ed] hover:border-[#9db9cc] hover:bg-[#f8fbfd]"
                }`}
              >
                <span className="block text-sm font-semibold text-[#233445]">{preset.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[#5c7083]">
                  {preset.description}
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {!isAuthenticated && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Du behöver vara inloggad för att söka bland JobTechs platsannonser.
        </div>
      )}

      <Card className="gap-0 border-[#dce5ed] bg-white shadow-sm">
        <CardHeader className="border-b border-[#edf1f5] pb-5">
          <CardTitle className="text-[17px] font-medium">Sök jobb</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={(event) => void runSearch(0, event)}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="jobtech-q">Fritext</Label>
                <Input
                  id="jobtech-q"
                  value={form.q}
                  onChange={(event) => {
                    setActivePresetId(null);
                    setForm((current) => ({ ...current, q: event.target.value }));
                  }}
                  placeholder="Exempelvis butik eller IT"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobtech-roles">Roller</Label>
                <Input
                  id="jobtech-roles"
                  value={form.roles}
                  onChange={(event) => {
                    setActivePresetId(null);
                    setForm((current) => ({ ...current, roles: event.target.value }));
                  }}
                  placeholder="T.ex. systemutvecklare, support"
                />
                <p className="text-xs text-muted-foreground">Separera flera roller med komma.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobtech-keywords">Nyckelord/kompetenser</Label>
                <Input
                  id="jobtech-keywords"
                  value={form.keywords}
                  onChange={(event) => {
                    setActivePresetId(null);
                    setForm((current) => ({ ...current, keywords: event.target.value }));
                  }}
                  placeholder="T.ex. C#, .NET"
                />
                <p className="text-xs text-muted-foreground">Separera flera nyckelord med komma.</p>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Orter</legend>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_LOCATIONS.map((location) => (
                    <label key={location} className="flex items-center gap-2 text-sm text-[#4c6173]">
                      <Checkbox
                        checked={form.locations.includes(location)}
                        onCheckedChange={() => {
                          setActivePresetId(null);
                          toggleLocation(location);
                        }}
                      />
                      {location}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="jobtech-employment">Anställningstyp</Label>
                <select
                  id="jobtech-employment"
                  value={form.employmentType}
                  onChange={(event) =>
                    {
                      setActivePresetId(null);
                      setForm((current) => ({
                        ...current,
                        employmentType: event.target.value as SearchFormState["employmentType"],
                      }));
                    }
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="all">Alla</option>
                  <option value="part-time">Deltid</option>
                  <option value="full-time">Heltid</option>
                  <option value="temporary">Tillfälligt/vikariat</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobtech-excluded">Uteslutna ord</Label>
                <Input
                  id="jobtech-excluded"
                  value={form.excludedKeywords}
                  onChange={(event) =>
                    {
                      setActivePresetId(null);
                      setForm((current) => ({ ...current, excludedKeywords: event.target.value }));
                    }
                  }
                  placeholder="T.ex. natt, provision"
                />
                <p className="text-xs text-muted-foreground">Separera flera ord med komma.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#4c6173]">
              <Checkbox
                checked={form.remote}
                onCheckedChange={(checked) => {
                  setActivePresetId(null);
                  setForm((current) => ({ ...current, remote: checked === true }));
                }}
              />
              Visa endast distansjobb
            </label>

            <Button type="submit" disabled={isLoading || !isAuthenticated}>
              <Search className="h-4 w-4" />
              {isLoading ? "Söker..." : "Sök jobb"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-4" aria-labelledby="saved-jobs-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="saved-jobs-heading" className="text-[19px] font-medium text-[#233445]">
              Sparade annonser
            </h2>
            <p className="text-sm text-muted-foreground">
              {savedJobs.length > 0
                ? `${savedJobs.length} sparade annonser`
                : "Spara intressanta annonser för att hitta dem senare."}
            </p>
          </div>
        </div>

        {isSavedJobsLoading && (
          <div className="rounded-lg border border-[#dce5ed] bg-white px-4 py-4 text-sm text-muted-foreground">
            Laddar sparade annonser...
          </div>
        )}

        {savedJobsError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {savedJobsError}
          </div>
        )}

        {!isSavedJobsLoading && !savedJobsError && savedJobs.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#c9d7e2] bg-white px-4 py-6 text-center text-sm text-muted-foreground">
            Du har inga sparade annonser ännu.
          </div>
        )}

        {!isSavedJobsLoading && savedJobs.length > 0 && (
          <div className="grid gap-4">
            {savedJobs.map((savedJob) => {
              const savedJobKey = getSavedJobKey(savedJob);

              return (
                <SavedJobCard
                  key={savedJobKey}
                  savedJob={savedJob}
                  isDeleting={deletingSavedJobId === savedJobKey}
                  isApplying={applyingSavedJobId === savedJobKey}
                  isApplied={appliedSavedJobIds.includes(savedJobKey)}
                  onDelete={(item) => void handleDeleteSavedJob(item)}
                  onApply={(item) => void handleApplySavedJob(item)}
                />
              );
            })}
          </div>
        )}
      </section>

      {isLoading && (
        <div className="rounded-lg border border-[#dce5ed] bg-white px-4 py-4 text-sm text-muted-foreground">
          Laddar jobbannonser...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && results && results.jobs.length === 0 && (
        <div className="rounded-lg border border-[#dce5ed] bg-white px-4 py-8 text-center text-sm text-muted-foreground">
          Inga jobb matchade dina sökkriterier.
        </div>
      )}

      {!isLoading && !error && results && results.jobs.length > 0 && (
        <section className="space-y-4" aria-labelledby="jobtech-results-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="jobtech-results-heading" className="text-[19px] font-medium text-[#233445]">
                Jobbannonser
              </h2>
              <p className="text-sm text-muted-foreground">
                Visar {results.returned} av {results.total} träffar
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {results.jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedExternalJobIds.has(job.id)}
                isSaving={savingExternalJobId === job.id}
                onSave={(item) => void handleSaveJob(item)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-[#dce5ed] bg-white px-4 py-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!hasPreviousPage || isLoading}
                onClick={() => void runSearch(Math.max(0, offset - PAGE_SIZE))}
              >
                <ChevronLeft className="h-4 w-4" />
                Föregående
              </Button>
              <span className="text-sm text-muted-foreground">
                Sida {currentPage} av {totalPages}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!hasNextPage || isLoading}
                onClick={() => void runSearch(offset + PAGE_SIZE)}
              >
                Nästa
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
