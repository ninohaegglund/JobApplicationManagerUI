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
  Bell,
  ChevronRight,
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
  const pageTitle = t(pageTitleKey);

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
    <div className="flex h-screen bg-[#f3f6fa]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1b2734] border-r border-[#2a3948] text-[#d8e4ef] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[#2a3948]">
          <h1 className="text-[19px] font-semibold tracking-tight text-[#f2f7fb]">JobTracker</h1>
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
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[14px]
                  ${isActive
                    ? "bg-[#253849] text-white shadow-[inset_0_0_0_1px_rgba(141,178,206,0.25)]"
                    : "text-[#a8bacb] hover:bg-[#223444] hover:text-[#ecf4fb]"
                  }
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#2a3948] space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#223444]">
            <div className="w-8 h-8 rounded-full bg-[#2f4659] text-[#f3f8fc] flex items-center justify-center select-none">
              <span className="text-sm font-semibold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#e6eff7] truncate">{fullName}</div>
              <div className="text-xs text-[#9cb0c3] truncate">{subtitle}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#9cb0c3]" />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#1f2f3d] border border-[#33495d] text-[#d9e8f5] rounded-lg hover:bg-[#263a4b] transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            {t("header.signOut")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#dde4ec] flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#7d8e9f] font-medium">JobTracker</span>
            <ChevronRight className="w-4 h-4 text-[#9fb0bf]" />
            <span className="font-semibold text-[#2b3a48]">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 hover:bg-[#f4f7fa] rounded-lg transition-colors">
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
