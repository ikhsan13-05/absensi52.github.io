import { NavLink } from "react-router-dom";
import { Clock3, History, LayoutDashboard } from "lucide-react";

const menus = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Absensi",
    path: "/absensi",
    icon: Clock3,
  },
  {
    label: "Riwayat",
    path: "/riwayat",
    icon: History,
  },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-md border-t border-white/40 bg-white/90 px-4 py-2 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="grid grid-cols-3 gap-2">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={menu.path === "/"}
                className={({ isActive }) =>
                  [
                    "flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold transition",
                    isActive
                      ? "bg-indigo-600 text-white shadow-premium"
                      : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600",
                  ].join(" ")
                }
              >
                <Icon size={20} />
                <span className="mt-1">{menu.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}