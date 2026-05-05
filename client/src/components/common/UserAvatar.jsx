// ─── UserAvatar.jsx ────────────────────────────────────────────────────────
import { getUserInitials } from "../../utils/helpers.js";

const sizeMap = {
  sm: "w-7 h-7 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

export default function UserAvatar({ user, size = "md", className = "" }) {
  const sizeClass = sizeMap[size] || sizeMap.md;

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username}
        className={`${sizeClass} rounded-full object-cover border-2 border-dark-500 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-brand flex items-center justify-center
                  font-bold text-white shrink-0 ${className}`}
    >
      {getUserInitials(user?.username || "?")}
    </div>
  );
}
