import { FC, useEffect, useState } from "react";
import { Bell, X, Circle } from "lucide-react";
import { Notification as NotificationType } from "@/lib/types/notification.type";
import { io } from "socket.io-client";
import { User } from "@/lib/types/user.type";
import { getTimeDifference } from "@/lib/utils";
import { useNavigate } from "react-router";
import { NotificationsService } from "@/lib/services/notifications.service";

interface Props {
  user: User;
}

const Notification: FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const notificationService = new NotificationsService();
    (async () => {
      const notifications = await notificationService.getUserNotifications();
      setNotifications(notifications);
      setUnreadCount(
        notifications.filter((notification) => !notification.isRead).length
      );
    })();
  }, []);

  useEffect(() => {
    const MESSAGE_TYPE = "notification";

    const socket = io(import.meta.env.VITE_API_BASE_URL, {
      query: { userId: user.id },
    });

    socket.on(MESSAGE_TYPE, (newNotification) => {
      console.log({ newNotification });
      
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off(MESSAGE_TYPE);
      socket.disconnect();
    };
  }, [user.id]);

  const markAsRead = async (notification: NotificationType) => {
    const notificationService = new NotificationsService();
    await notificationService.markNotificationAsRead(notification.id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => prev - 1);

    navigate(`/news-details/${notification.article?.id}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-200" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 shadow-lg z-50 animate-slide-left">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-100">
                Notifications
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {notifications.map((notification) =>
                !notification.isRead ? (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification)}
                    className="p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer text-start"
                  >
                    <div className="flex items-start gap-3">
                      <Circle className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-100">
                          {notification.message}
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">
                          {notification.article?.title}
                        </p>
                        <span className="text-xs text-gray-400 mt-2 block">
                          {getTimeDifference(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </button>
                ) : null
              )}

              {unreadCount === 0 && (
                <div className="p-4 text-center text-gray-300">
                  No new notifications
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black opacity-70 z-40 cursor-default"
          />
        </>
      )}
    </div>
  );
};

export default Notification;
