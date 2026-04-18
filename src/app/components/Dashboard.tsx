import { Link } from "react-router";
import { Plus, UserCircle, Mail, TrendingUp, TrendingDown } from "lucide-react";

const stats = [
  { label: "Total Applications", value: "42", change: "+12%", trend: "up", color: "text-foreground" },
  { label: "Draft", value: "8", change: "3 pending", trend: "neutral", color: "text-muted-foreground" },
  { label: "Applied", value: "18", change: "+5 this week", trend: "up", color: "text-blue-600" },
  { label: "Interviews", value: "6", change: "+2", trend: "up", color: "text-green-600" },
  { label: "Rejected", value: "10", change: "-", trend: "neutral", color: "text-muted-foreground" },
];

const recentApplications = [
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
];

const recentActivity = [
  { action: "Updated application for Vercel", time: "2 hours ago" },
  { action: "Created new application for Linear", time: "1 day ago" },
  { action: "Generated cover letter for Stripe", time: "2 days ago" },
  { action: "Updated profile information", time: "3 days ago" },
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

export function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-[28px] font-medium mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your job application progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-border p-6">
            <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
            <div className={`text-[32px] font-medium leading-none mb-2 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {stat.trend === "up" && <TrendingUp className="w-3 h-3" />}
              {stat.trend === "down" && <TrendingDown className="w-3 h-3" />}
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          to="/applications/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Application
        </Link>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
        >
          <UserCircle className="w-4 h-4" />
          Manage Profile
        </Link>
        <Link
          to="/cover-letters"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
        >
          <Mail className="w-4 h-4" />
          Cover Letter Templates
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="col-span-2 bg-white rounded-lg border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-[17px] font-medium">Recent Applications</h2>
            <Link to="/applications" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentApplications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-[#fafafa] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1">{app.company}</h3>
                    <p className="text-sm text-muted-foreground">{app.role}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mt-3">
                  <span>Created {app.created}</span>
                  <span>Updated {app.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-[17px] font-medium">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-4">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-muted mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm mb-1">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
