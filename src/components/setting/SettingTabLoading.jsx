export default function SettingTabLoading({
  text = "Memuat data...",
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

        <h3 className="text-sm font-bold text-slate-700">
          {text}
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Mohon tunggu sebentar...
        </p>
      </div>
    </div>
  );
}