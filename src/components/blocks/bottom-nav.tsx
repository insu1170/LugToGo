import { NavLink } from "react-router-dom";
import { Map, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "지도", icon: Map, end: true },
  { to: "/me/bookings", label: "내 예약", icon: ClipboardList, end: false },
  { to: "/me", label: "내 정보", icon: User, end: false },
];

/** 유저용 하단 탭바 */
export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-3 border-t bg-background pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-2 text-xs",
              isActive ? "text-primary" : "text-muted-foreground",
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
