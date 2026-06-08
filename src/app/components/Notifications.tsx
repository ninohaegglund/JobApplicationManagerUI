import { useMemo } from "react";
import { useState } from "react";
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
import { useNotifications } from "../../context/NotificationsContext";
import { useLanguage } from "../../context/LanguageContext";
import type { NotificationType } from "../../types/notifications";

function formatNotificationDate(value: string): string {
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

function getNotificationTypeStyles(type: NotificationType): string {
  switch (type) {
    case "Interview reminder":
      return "bg-green-50 text-green-700 border-green-200";
    case "Follow-up reminder":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Deadline soon":
      return "bg-red-50 text-red-700 border-red-200";
    case "Application updated":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export function Notifications() {
  const { t } = useLanguage();
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAllAsRead,
    markAsRead,
    deleteAllNotifications,
  } = useNotifications();

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      ),
    [notifications]
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium mb-1">{t("nav.notifications")}</h1>
          <p className="text-muted-foreground">{t("pages.notifications.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0 || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors text-sm disabled:opacity-60"
          >
            Mark all as read
          </button>
          <button
            type="button"
            onClick={() => setClearAllOpen(true)}
            disabled={loading || notifications.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors text-sm disabled:opacity-60"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border divide-y">
        {loading && (
          <div className="p-6 text-sm text-muted-foreground">Loading notifications...</div>
        )}

        {!loading && error && (
          <div className="p-6 flex items-center justify-between gap-4">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => void refreshNotifications()}
              className="px-3 py-2 text-xs bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error &&
          sortedNotifications.map((notification) => {
            return (
              <div
                key={notification.id}
                className={`p-6 flex items-start justify-between gap-6 ${
                  notification.read
                    ? "bg-white"
                    : "bg-[#fafafa] border-l-4 border-blue-500 pl-5"
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{notification.title}</h3>
                    {!notification.read && (
                      <span className="text-[11px] text-blue-600 font-medium">Unread</span>
                    )}
                    <span className={`text-[11px] px-2 py-0.5 rounded border ${getNotificationTypeStyles(notification.type)}`}>
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                    <span>{formatNotificationDate(notification.createdAt)}</span>
                    {notification.application && (
                      <span>
                        {notification.application.company}
                        {notification.application.role ? ` • ${notification.application.role}` : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => void markAsRead(notification.id)}
                      className="px-3 py-2 text-xs bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {!loading && !error && sortedNotifications.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">No notifications yet.</div>
        )}
      </div>

      <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all notifications from your view. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void deleteAllNotifications().finally(() => setClearAllOpen(false));
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
