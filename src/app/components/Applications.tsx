import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, Filter, Trash2 } from "lucide-react";
import { ApiError } from "../../services/httpClient";
import {
  deleteApplication,
  getAllApplications,
  updateApplicationStatus,
} from "../../services/jobApplicationService";
import type { ApplicationStatus, JobApplication } from "../../types/jobApplications";

const filters: Array<"All" | ApplicationStatus> = [
  "All",
  "Draft",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

function getStatusColor(status: string) {
  switch (status) {
    case "Interview":
      return "bg-green-50 text-green-700 border-green-200";
    case "Applied":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Draft":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "Rejected":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export function Applications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadApplications() {
      setIsLoading(true);
      setError(null);
      setActionError(null);

      try {
        const data = await getAllApplications();

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
  }, []);

  const filteredApplications = useMemo(() => {
    if (activeFilter === "All") {
      return applications;
    }

    return applications.filter((application) => application.status === activeFilter);
  }, [activeFilter, applications]);

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium mb-1">Applications</h1>
          <p className="text-muted-foreground">Manage all your job applications</p>
        </div>
        <Link
          to="/applications/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Application
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
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
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Created</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Updated</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-sm text-muted-foreground text-center">
                  Loading applications...
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-sm text-red-700 bg-red-50 text-center">
                  {error}
                </td>
              </tr>
            )}

            {!isLoading && !error && filteredApplications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-sm text-muted-foreground text-center">
                  No applications found.
                </td>
              </tr>
            )}

            {!isLoading && !error && filteredApplications.map((app) => (
              <tr key={app.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-6 py-4 font-medium">{app.companyName}</td>
                <td className="px-6 py-4 text-muted-foreground">{app.roleTitle}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
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
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(app.createdAt)}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(app.updatedAt)}</td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => void handleDelete(app.id)}
                    disabled={deletingId === app.id || updatingStatusId === app.id}
                    className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
