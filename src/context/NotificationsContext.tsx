import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { initialNotifications, type NotificationItem } from "../app/data/jobTrackerMockData";

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => initialNotifications);

  const markAsRead = useCallback((id: string) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.read ? notification : { ...notification, read: true }
      )
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
    }),
    [markAllAsRead, markAsRead, notifications, unreadCount]
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
