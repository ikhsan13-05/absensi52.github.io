import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Edit,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import ConfirmModal from "../components/ConfirmModal";
import LoadingScreen from "../components/LoadingScreen";
import { deleteLibur, getLibur, saveLibur } from "../api/api";

const defaultForm = {
  idLibur: "",
  tanggal: "",
  keterangan: "",
  jenis: "Nasional",
  status: "Aktif",
};

export default function SettingLibur() {
  const currentYear = String(new Date().getFullYear());

  const [tahun, setTahun] = useState(currentYear);
  const [data, setData] = useState([]);
  const [form, setForm] = useState(defaultForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  const tahunList = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => String(now - 2 + index));
  }, []);

  async function loadData(showToast = false) {
    setLoading(true);

    const result = await getLibur({ tahun });

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Gagal mengambil data libur.");
      return;
    }

    setData(result.data || []);

    if (showToast) {
      toast.success("Data hari libur diperbarui.");
    }
  }

  useEffect(() => {
    loadData();
  }, [tahun]);

  function resetForm() {
    setForm(defaultForm);
    setSelected(null);
  }

  function openAdd() {
    resetForm();
    setOpenForm(true);
  }

  function openEdit(item) {
    setSelected(item);

    setForm({
      idLibur: item.idLibur,
      tanggal: item.tanggal,
      keterangan: item.keterangan,
      jenis: item.jenis || "Nasional",
      status: item.status || "Aktif",
    });

    setOpenForm(true);
  }

  function askDelete(item) {
    setSelected(item);
    setOpenDelete(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.tanggal) {
      toast.error("Tanggal wajib diisi.");
      return;
    }

    if (!form.keterangan.trim()) {
      toast.error("Keterangan wajib diisi.");
      return;
    }

    setSaving(true);

    const result = await saveLibur(form);

    setSaving(false);

    if (!result.success) {
      toast.error(result.message || "Gagal menyimpan data libur.");
      return;
    }

    toast.success(result.message || "Data libur berhasil disimpan.");
    setOpenForm(false);
    resetForm();
    loadData();
  }

  async function handleDelete() {
    if (!selected?.idLibur) return;

    setSaving(true);

    const result = await deleteLibur({
      idLibur: selected.idLibur,
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.message || "Gagal menghapus data libur.");
      return;
    }

    toast.success(result.message || "Data libur berhasil dihapus.");
    setOpenDelete(false);
    setSelected(null);
    loadData();
  }

  if (loading && data.length === 0) {
    return <LoadingScreen text="Memuat data hari libur..." />;
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* HEADER */}
      <div className="rounded-[2rem] bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 p-5 text-white shadow-premium lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/75">Admin Setting</p>

            <h1 className="mt-1 text-2xl font-black leading-tight lg:text-3xl">
              Hari Libur
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Atur libur nasional, cuti bersama, libur sekolah, dan libur
              khusus.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:flex">
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-xs font-black text-white backdrop-blur disabled:opacity-60 lg:text-sm"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-indigo-700 lg:text-sm"
            >
              <Plus size={18} />
              Tambah
            </button>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="rounded-[2rem] bg-white p-5 shadow-soft lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <CalendarDays size={24} />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">Data Libur</h2>
              <p className="text-sm text-slate-500">Filter berdasarkan tahun</p>
            </div>
          </div>

          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none lg:w-40"
          >
            {tahunList.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DATA */}
      {data.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-400">
            <CalendarDays size={38} />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-900">
            Belum Ada Hari Libur
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Tambahkan hari libur agar rekap absensi lebih akurat.
          </p>

          <button
            onClick={openAdd}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-premium"
          >
            <Plus size={18} />
            Tambah Hari Libur
          </button>
        </div>
      ) : (
        <div className="rounded-[2rem] bg-white p-5 shadow-soft lg:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Daftar Hari Libur
              </h2>
              <p className="text-sm text-slate-500">
                Total {data.length} data pada tahun {tahun}
              </p>
            </div>

            {loading && (
              <RefreshCw size={20} className="animate-spin text-indigo-600" />
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-100 lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.idLibur} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {item.tanggal}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-600">
                      {item.keterangan}
                    </td>

                    <td className="px-4 py-3">
                      <JenisBadge jenis={item.jenis} />
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() => askDelete(item)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="space-y-3 lg:hidden">
            {data.map((item) => (
              <LiburCard
                key={item.idLibur}
                item={item}
                onEdit={openEdit}
                onDelete={askDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {openForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-indigo-600">
                  Form Hari Libur
                </p>

                <h2 className="text-xl font-black text-slate-900">
                  {form.idLibur ? "Edit Libur" : "Tambah Libur"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <FormInput label="Tanggal">
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tanggal: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
                />
              </FormInput>

              <FormInput label="Keterangan">
                <input
                  type="text"
                  value={form.keterangan}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      keterangan: e.target.value,
                    }))
                  }
                  placeholder="Contoh: Hari Raya Idul Fitri"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
                />
              </FormInput>

              <FormInput label="Jenis">
                <select
                  value={form.jenis}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      jenis: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
                >
                  <option value="Nasional">Nasional</option>
                  <option value="Cuti Bersama">Cuti Bersama</option>
                  <option value="Libur Sekolah">Libur Sekolah</option>
                  <option value="Libur Khusus">Libur Khusus</option>
                </select>
              </FormInput>

              <FormInput label="Status">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </FormInput>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-premium disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Menyimpan..." : "Simpan Data"}
            </button>
          </form>
        </div>
      )}

      <ConfirmModal
        open={openDelete}
        title="Hapus Hari Libur?"
        message={`Data "${selected?.keterangan}" akan dihapus dari daftar hari libur.`}
        confirmText="Hapus"
        cancelText="Batal"
        loading={saving}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function LiburCard({ item, onEdit, onDelete }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <JenisBadge jenis={item.jenis} />
            <StatusBadge status={item.status} />
          </div>

          <h3 className="mt-3 text-base font-black text-slate-900">
            {item.keterangan}
          </h3>

          <p className="mt-1 text-sm font-bold text-slate-500">
            {item.tanggal}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onEdit(item)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
          >
            <Edit size={17} />
          </button>

          <button
            onClick={() => onDelete(item)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function JenisBadge({ jenis }) {
  const label = jenis || "-";

  const tone =
    label === "Nasional"
      ? "bg-indigo-50 text-indigo-700"
      : label === "Cuti Bersama"
      ? "bg-blue-50 text-blue-700"
      : label === "Libur Sekolah"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-black ${tone}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-[11px] font-black",
        status === "Aktif"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      {status || "-"}
    </span>
  );
}

function FormInput({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
