import { RefreshCw } from "lucide-react";

export default function AdminPageHeader({
  eyebrow = "Admin Panel",
  title,
  description,
  loading = false,
  onRefresh,
  action,
}) {
  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 p-5 text-white shadow-premium lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-white/75">{eyebrow}</p>

          <h1 className="mt-1 text-2xl font-black leading-tight lg:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 lg:flex">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-xs font-black text-white backdrop-blur disabled:opacity-60 lg:text-sm"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          )}

          {action}
        </div>
      </div>
    </div>
  );
}
