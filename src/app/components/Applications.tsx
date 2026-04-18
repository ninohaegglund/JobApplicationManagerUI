import { Link } from "react-router";
import { Plus, Filter, MoreVertical } from "lucide-react";

const applications = [
  {
    id: 1,
    company: "Vercel",
    role: "Senior Frontend Engineer",
    status: "Interview",
    created: "2026-04-10",
    updated: "2026-04-11"
  },
  {
    id: 2,
    company: "Linear",
    role: "Product Engineer",
    status: "Applied",
    created: "2026-04-09",
    updated: "2026-04-09"
  },
  {
    id: 3,
    company: "Stripe",
    role: "Full Stack Developer",
    status: "Applied",
    created: "2026-04-08",
    updated: "2026-04-10"
  },
  {
    id: 4,
    company: "Figma",
    role: "Software Engineer",
    status: "Draft",
    created: "2026-04-07",
    updated: "2026-04-11"
  },
  {
    id: 5,
    company: "Notion",
    role: "Frontend Developer",
    status: "Interview",
    created: "2026-04-05",
    updated: "2026-04-10"
  },
  {
    id: 6,
    company: "GitHub",
    role: "Staff Engineer",
    status: "Applied",
    created: "2026-04-03",
    updated: "2026-04-08"
  },
  {
    id: 7,
    company: "Shopify",
    role: "Senior Developer",
    status: "Rejected",
    created: "2026-03-28",
    updated: "2026-04-05"
  },
  {
    id: 8,
    company: "Airbnb",
    role: "Frontend Engineer",
    status: "Interview",
    created: "2026-03-25",
    updated: "2026-04-09"
  },
];

const filters = ["All", "Draft", "Applied", "Interview", "Rejected"];

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
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filter === "All"
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
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-6 py-4 font-medium">{app.company}</td>
                <td className="px-6 py-4 text-muted-foreground">{app.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{app.created}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{app.updated}</td>
                <td className="px-6 py-4">
                  <button className="p-1 hover:bg-muted rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
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
