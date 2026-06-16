import { useEffect, useState } from "react";
import { Save, Settings } from "lucide-react";
import toast from "react-hot-toast";

import LoadingScreen from "../components/LoadingScreen";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSectionCard from "../components/AdminSectionCard";
import { getSettingSekolah, saveSettingSekolah } from "../api/api";

const defaultForm = {
  schoolName: "",
  schoolLat: "",
  schoolLng: "",
  radiusMeter: "100",
  jamMulaiDatang: "06:00",
  jamBatasDatang: "08:00",
  jamMulaiPulang: "14:00",
  jamBatasPulang: "17:00",
  maxGpsAccuracy: "50",
  hariKerja: ["1", "2", "3", "4", "5"],
};

const hariList = [
  { value: "1", label: "Senin" },
  { value: "2", label: "Selasa" },
  { value: "3", label: "Rabu" },
  { value: "4", label: "Kamis" },
  { value: "5", label: "Jumat" },
  { value: "6", label: "Sabtu" },
  { value: "0", label: "Minggu" },
];

export default function SettingSekolah() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);

    const result = await getSettingSekolah();

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Gagal mengambil setting sekolah.");
      return;
    }

    const data = result.data || {};

    setForm({
      ...defaultForm,
      ...data,
      hariKerja: String(data.hariKerja || "1,2,3,4,5")
        .split(",")
        .map((item) => item.trim()),
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function toggleHari(value) {
    setForm((prev) => {
      const exists = prev.hariKerja.includes(value);

      return {
        ...prev,
        hariKerja: exists
          ? prev.hariKerja.filter((item) => item !== value)
          : [...prev.hariKerja, value],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.schoolName.trim()) {
      toast.error("Nama sekolah wajib diisi.");
      return;
    }

    if (!form.schoolLat || !form.schoolLng) {
      toast.error("Latitude dan longitude sekolah wajib diisi.");
      return;
    }

    if (form.hariKerja.length === 0) {
      toast.error("Minimal pilih 1 hari kerja.");
      return;
    }

    setSaving(true);

    const result = await saveSettingSekolah({
      ...form,
      hariKerja: form.hariKerja.join(","),
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.message || "Gagal menyimpan setting sekolah.");
      return;
    }

    toast.success("Setting sekolah berhasil disimpan.");
    loadData();
  }

  if (loading) {
    return <LoadingScreen text="Memuat setting sekolah..." />;
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Admin Setting"
        title="Setting Sekolah"
        description="Atur lokasi, radius, jam absen, akurasi GPS, dan hari kerja."
        loading={loading}
        onRefresh={loadData}
      />

      <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
        <AdminSectionCard
          title="Identitas & Lokasi Sekolah"
          description="Data ini digunakan untuk validasi radius absensi GPS."
          icon={Settings}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Input
              label="Nama Sekolah"
              name="schoolName"
              value={form.schoolName}
              onChange={handleChange}
            />

            <Input
              label="Radius Meter"
              name="radiusMeter"
              type="number"
              value={form.radiusMeter}
              onChange={handleChange}
            />

            <Input
              label="Latitude Sekolah"
              name="schoolLat"
              value={form.schoolLat}
              onChange={handleChange}
            />

            <Input
              label="Longitude Sekolah"
              name="schoolLng"
              value={form.schoolLng}
              onChange={handleChange}
            />

            <Input
              label="Max Akurasi GPS Meter"
              name="maxGpsAccuracy"
              type="number"
              value={form.maxGpsAccuracy}
              onChange={handleChange}
            />
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Jam Absensi"
          description="Absen datang memakai jam mulai. Absen pulang memakai jam mulai dan batas."
          icon={Settings}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <Input
              label="Jam Mulai Datang"
              name="jamMulaiDatang"
              type="time"
              value={form.jamMulaiDatang}
              onChange={handleChange}
            />

            <Input
              label="Jam Batas Datang"
              name="jamBatasDatang"
              type="time"
              value={form.jamBatasDatang}
              onChange={handleChange}
            />

            <Input
              label="Jam Mulai Pulang"
              name="jamMulaiPulang"
              type="time"
              value={form.jamMulaiPulang}
              onChange={handleChange}
            />

            <Input
              label="Jam Batas Pulang"
              name="jamBatasPulang"
              type="time"
              value={form.jamBatasPulang}
              onChange={handleChange}
            />
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Hari Kerja"
          description="Pilih hari kerja aktif. Sabtu dan Minggu tidak perlu dimasukkan ke Hari Libur jika tidak dipilih di sini."
          icon={Settings}
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-7">
            {hariList.map((hari) => {
              const active = form.hariKerja.includes(hari.value);

              return (
                <button
                  key={hari.value}
                  type="button"
                  onClick={() => toggleHari(hari.value)}
                  className={[
                    "rounded-2xl px-4 py-4 text-sm font-black transition",
                    active
                      ? "bg-indigo-600 text-white shadow-premium"
                      : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  {hari.label}
                </button>
              );
            })}
          </div>
        </AdminSectionCard>

        <button
          type="submit"
          disabled={saving}
          className="admin-btn-primary w-full"
        >
          <Save size={18} />
          {saving ? "Menyimpan..." : "Simpan Setting Sekolah"}
        </button>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="admin-input w-full"
      />
    </div>
  );
}