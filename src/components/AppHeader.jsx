import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { removeGuru } from "../utils/storage";
import toast from "react-hot-toast";

export default function AppHeader({ title, subtitle, right, showLogout = false }) {
  const navigate = useNavigate();

  function handleLogout() {
    removeGuru();
    toast.success("Berhasil logout.");
    navigate("/login", { replace: true });
  }

  return (
    <header className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 px-5 pb-8 pt-10 text-white shadow-premium">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-white/10" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/100">{subtitle}</p>
          <h1 className="mt-1 text-md font-bold leading-tight">{title}</h1>
        </div>

        {showLogout ? (
          <button
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md active:scale-95"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        ) : (
          right
        )}
      </div>
    </header>
  );
}