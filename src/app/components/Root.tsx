import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Briefcase,
  User,
  FileText,
  Mail,
  FileStack,
  Download,
  Settings as SettingsIcon,
  Search,
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Applications", path: "/applications", icon: Briefcase },
  { name: "Profile", path: "/profile", icon: User },
  { name: "CV Documents", path: "/cv-documents", icon: FileText },
  { name: "Cover Letter Templates", path: "/cover-letters", icon: Mail },
  { name: "Text Blocks", path: "/text-blocks", icon: FileStack },
  { name: "Exports", path: "/exports", icon: Download },
  { name: "Settings", path: "/settings", icon: SettingsIcon },
];

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "Authenticated User";
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "U";
  const subtitle = user?.email ?? "Identity account";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <h1 className="text-[19px] font-medium tracking-tight">JobTracker</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive
                    ? "bg-[#f5f5f5] text-foreground"
                    : "text-muted-foreground hover:bg-[#fafafa] hover:text-foreground"
                  }
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-[15px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center select-none">
              <span className="text-sm font-medium">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{fullName}</div>
              <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search applications, companies..."
                className="w-full pl-10 pr-4 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-[#fafafa] rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
