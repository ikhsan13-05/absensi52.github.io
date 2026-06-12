export default function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>

        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}