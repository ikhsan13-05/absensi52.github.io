import { Inbox } from "lucide-react";

export default function AdminEmptyState({
  icon: Icon = Inbox,
  title = "Data Tidak Ditemukan",
  description = "Belum ada data yang tersedia.",
  action,
}) {
  return (
    <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-400">
        <Icon size={38} />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
