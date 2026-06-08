import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  deleteAllNotifications,
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationsService";
import { ApiError } from "../services/httpClient";
import type { NotificationItem } from "../types/notifications";

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = useCallback((reason: unknown): string => {
    if (reason instanceof ApiError) {
      return reason.message;
    }

    if (reason instanceof Error) {
      return reason.message;
    }

    return "Unable to complete notifications request.";
  }, []);

  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [notificationsResult, unreadCountResult] = await Promise.allSettled([
      getNotifications(),
      getUnreadNotificationsCount(),
    ]);

    let nextNotifications: NotificationItem[] | null = null;

    if (notificationsResult.status === "fulfilled") {
      nextNotifications = notificationsResult.value;
      setNotifications(nextNotifications);
    }

    if (unreadCountResult.status === "fulfilled") {
      setUnreadCount(unreadCountResult.value.unreadCount);
    } else if (nextNotifications) {
      setUnreadCount(nextNotifications.filter((notification) => !notification.read).length);
    }

    if (
      notificationsResult.status === "rejected" &&
      unreadCountResult.status === "rejected"
    ) {
      setError(getErrorMessage(notificationsResult.reason));
    } else if (notificationsResult.status === "rejected") {
      setError(getErrorMessage(notificationsResult.reason));
    } else if (unreadCountResult.status === "rejected") {
      setError(getErrorMessage(unreadCountResult.reason));
    }

    setLoading(false);
  }, [getErrorMessage]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    void refreshNotifications();
  }, [isAuthenticated, refreshNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    setError(null);

    try {
      await markNotificationAsRead(id);

      setNotifications((previous) => {
        let wasUnread = false;

        const next = previous.map((notification) => {
          if (notification.id !== id || notification.read) {
            return notification;
          }

          wasUnread = true;

          return {
            ...notification,
            read: true,
            readAt: notification.readAt ?? new Date().toISOString(),
          };
        });

        if (wasUnread) {
          setUnreadCount((current) => Math.max(0, current - 1));
        }

        return next;
      });
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  }, [getErrorMessage]);

  const markAllAsRead = useCallback(async () => {
    setError(null);

    try {
      const response = await markAllNotificationsAsRead();
      const readAt = new Date().toISOString();

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.read
            ? notification
            : { ...notification, read: true, readAt: notification.readAt ?? readAt }
        )
      );
      setUnreadCount(response.unreadCount);
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  }, [getErrorMessage]);

  const clearAllNotifications = useCallback(async () => {
    setError(null);

    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  }, [getErrorMessage]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteAllNotifications: clearAllNotifications,
    }),
    [
      clearAllNotifications,
      error,
      loading,
      markAllAsRead,
      markAsRead,
      notifications,
      refreshNotifications,
      unreadCount,
    ]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider.");
  }

  return context;
}
