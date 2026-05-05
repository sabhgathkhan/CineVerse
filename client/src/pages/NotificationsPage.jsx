import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiHeart, FiUserPlus, FiMessageCircle, FiCheck } from "react-icons/fi";
import { userAPI } from "../api/index.js";
import UserAvatar from "../components/common/UserAvatar.jsx";
import { PageSpinner, EmptyState } from "../components/common/index.jsx";
import { formatRelativeTime } from "../utils/helpers.js";
import toast from "react-hot-toast";

const NOTIFICATION_ICONS = {
  follow: { icon: FiUserPlus, color: "text-brand-400", bg: "bg-brand-900/40" },
  review_like: { icon: FiHeart, color: "text-red-400", bg: "bg-red-900/30" },
  comment: { icon: FiMessageCircle, color: "text-blue-400", bg: "bg-blue-900/30" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await userAPI.getNotifications();
      setNotifications(res.data.data);
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingRead(true);
    try {
      await userAPI.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark notifications.");
    } finally {
      setIsMarkingRead(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiBell className="text-brand-400" size={22} />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingRead}
            className="btn-ghost flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300"
          >
            <FiCheck size={14} />
            {isMarkingRead ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={FiBell}
          title="No notifications yet"
          description="When someone follows you, likes your review, or comments, you'll see it here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification, idx) => (
            <NotificationItem key={notification._id || idx} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification }) {
  const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.follow;
  const Icon = config.icon;
  const fromUser = notification.fromUser;

  return (
    <div
      className={`card px-4 py-3.5 flex items-start gap-3 transition-all ${
        !notification.isRead ? "border-brand-800/50 bg-brand-900/10" : ""
      }`}
    >
      {/* Icon */}
      <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${config.bg}`}>
        <Icon size={16} className={config.color} />
      </div>

      {/* From user avatar + message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {fromUser && (
            <Link to={`/user/${fromUser.username}`} className="shrink-0">
              <UserAvatar user={fromUser} size="sm" />
            </Link>
          )}
          <p className="text-sm text-gray-300 leading-snug">
            {notification.message}
          </p>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="shrink-0 w-2 h-2 rounded-full bg-brand-500 mt-1.5" />
      )}
    </div>
  );
}
