import { useEffect, useMemo } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  User,
  FileText,
  Download,
  Settings as SettingsIcon,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { useLanguage, type TranslationKey } from "../../context/LanguageContext";
import { LanguageSwitch } from "./LanguageSwitch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navigation: Array<{
  labelKey: TranslationKey;
  path: string;
  icon: LucideIcon;
}> = [
  { labelKey: "nav.dashboard", path: "/", icon: LayoutDashboard },
  { labelKey: "nav.applications", path: "/applications", icon: Briefcase },
  { labelKey: "nav.calendar", path: "/calendar", icon: CalendarDays },
  { labelKey: "nav.notifications", path: "/notifications", icon: Bell },
  { labelKey: "nav.profile", path: "/profile", icon: User },
  { labelKey: "nav.cvDocuments", path: "/cv-documents", icon: FileText },
  { labelKey: "nav.exports", path: "/exports", icon: Download },
  { labelKey: "nav.settings", path: "/settings", icon: SettingsIcon },
];

function getRouteTitleKey(pathname: string): TranslationKey {
  if (pathname === "/") {
    return "nav.dashboard";
  }

  if (
    pathname === "/applications/new" ||
    /^\/applications\/[^/]+\/edit$/.test(pathname)
  ) {
    return "pages.createApplication.title";
  }

  const routeTitle = navigation.find(
    (item) => item.path !== "/" && pathname.startsWith(item.path)
  );

  return routeTitle?.labelKey ?? "nav.dashboard";
}

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const { t } = useLanguage();

  const pageTitleKey = useMemo(
    () => getRouteTitleKey(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    window.document.title = `${t(pageTitleKey)} | JobTracker`;
  }, [pageTitleKey, t]);

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : t("header.authenticatedUser");
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "U";
  const subtitle = user?.email ?? t("header.identityAccount");

  const latestUnreadNotifications = useMemo(() => {
    return [...notifications]
      .filter((notification) => !notification.read)
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )
      .slice(0, 3);
  }, [notifications]);

  function formatNotificationTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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
                <span className="text-[15px]">{t(item.labelKey)}</span>
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
            {t("header.signOut")}
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
                placeholder={t("header.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 hover:bg-[#fafafa] rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {t("header.unreadNotifications")}
                </DropdownMenuLabel>
                {latestUnreadNotifications.length === 0 && (
                  <div className="px-2 py-3 text-sm text-muted-foreground">
                    {t("header.noUnreadNotifications")}
                  </div>
                )}
                {latestUnreadNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onSelect={(event) => event.preventDefault()}
                    className="flex flex-col items-start gap-1 px-2 py-2 cursor-default"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => navigate("/notifications")}
                  className="cursor-pointer"
                >
                  {t("header.viewAllNotifications")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
