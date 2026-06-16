import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Monitor,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { getAdmin, removeAdmin } from "../utils/adminStorage";

const menus = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Monitoring",
    path: "/admin/monitoring",
    icon: Monitor,
  },
  {
    label: "Rekap",
    path: "/admin/rekap",
    icon: BarChart3,
  },
  {
    label: "Guru",
    path: "/admin/guru",
    icon: Users,
  },
  {
    label: "Libur",
    path: "/admin/libur",
    icon: CalendarDays,
  },
  {
    label: "Setting",
    path: "/admin/setting",
    icon: Settings,
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const admin = getAdmin();

  function handleLogoutAdmin() {
    removeAdmin();
    toast.success("Berhasil logout admin.");
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-72 border-r border-slate-100 bg-white shadow-soft lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-premium">
                <ShieldCheck size={26} />
              </div>

              <div>
                <h1 className="text-lg font-black text-slate-900">
                  Admin Panel
                </h1>
                <p className="text-xs font-semibold text-slate-500">
                  Mobile Absen
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {menus.map((menu) => {
              const Icon = menu.icon;

              return (
                <NavLink
                  key={menu.path}
                  to={menu.path}
                  end={menu.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition",
                      isActive
                        ? "bg-indigo-600 text-white shadow-premium"
                        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
                    ].join(" ")
                  }
                >
                  <Icon size={20} />
                  {menu.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="mb-3 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-slate-400">
                Login sebagai
              </p>
              <p className="mt-1 truncate text-sm font-black text-slate-900">
                {admin?.nama || "Admin"}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {admin?.role || "-"}
              </p>
            </div>

            <button
              onClick={handleLogoutAdmin}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100"
            >
              <LogOut size={18} />
              Logout Admin
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-premium">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h1 className="text-base font-black leading-tight text-slate-900">
                Admin Panel
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                {admin?.role || "Mobile Absen"}
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogoutAdmin}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="pb-28 lg:ml-72 lg:pb-0">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/40 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={menu.end}
                className={({ isActive }) =>
                  [
                    "flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[10px] font-black transition",
                    isActive
                      ? "bg-indigo-600 text-white shadow-premium"
                      : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-700",
                  ].join(" ")
                }
              >
                <Icon size={19} />
                <span className="mt-1 truncate">{menu.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
