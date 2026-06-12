export default function ConfirmModal({
  open,
  title = "Konfirmasi",
  message = "Apakah Anda yakin?",
  confirmText = "Ya",
  cancelText = "Batal",
  onConfirm,
  onClose,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {message}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-premium disabled:opacity-60"
          >
            {loading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}