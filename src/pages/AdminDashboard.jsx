import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import toast from "react-hot-toast";

import StatCard from "../components/StatCard";
import LoadingScreen from "../components/LoadingScreen";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSectionCard from "../components/AdminSectionCard";
import AdminEmptyState from "../components/AdminEmptyState";
import { getDashboardAdmin } from "../api/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard(showToast = false) {
    setLoading(true);

    const result = await getDashboardAdmin();

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Gagal mengambil dashboard admin.");
      return;
    }

    setData(result.data);

    if (showToast) {
      toast.success("Dashboard diperbarui.");
    }
  }

  useEffect(() => {
    loadDashboard(false);
  }, []);

  if (loading && !data) {
    return <LoadingScreen text="Memuat dashboard admin..." />;
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Monitoring Kehadiran"
        description="Rekap kehadiran guru/karyawan hari ini."
        loading={loading}
        onRefresh={() => loadDashboard(true)}
      />

      <div className="admin-grid-stats">
        <StatCard
          title="Total Guru"
          value={data?.totalGuru || 0}
          description="Guru aktif"
          icon={Users}
        />

        <StatCard
          title="Hadir"
          value={data?.hadirHariIni || 0}
          description="Hari ini"
          icon={UserCheck}
        />

        <StatCard
          title="Belum Hadir"
          value={data?.belumHadir || 0}
          description="Belum absen"
          icon={UserX}
        />

        <StatCard
          title="Kehadiran"
          value={`${data?.persentaseKehadiran || 0}%`}
          description="Persentase"
          icon={CheckCircle2}
        />
      </div>

      <AdminSectionCard
        title="Kehadiran Hari Ini"
        description={`Tanggal: ${data?.tanggal || "-"}`}
        icon={CalendarDays}
        right={
          loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          ) : null
        }
      >
        {!data?.daftarHadir?.length ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center">
            <p className="font-bold text-slate-500">
              Belum ada guru yang absen hari ini.
            </p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead className="admin-table-head">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">NIP</th>
                    <th className="px-4 py-3">Datang</th>
                    <th className="px-4 py-3">Pulang</th>
                    <th className="px-4 py-3">Durasi</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.daftarHadir.map((item) => (
                    <tr key={item.idGuru} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {item.nama}
                      </td>

                      <td className="px-4 py-3 text-slate-500">{item.nip}</td>

                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {item.jamDatang || "-"}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {item.jamPulang || "-"}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {item.durasiKerja || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={item.statusKerja} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-mobile-list">
              {data.daftarHadir.map((item) => (
                <HadirCard key={item.idGuru} item={item} />
              ))}
            </div>
          </>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="Belum Hadir"
        description="Guru/karyawan yang belum absen datang."
        icon={UserX}
      >
        {!data?.daftarBelumHadir?.length ? (
          <div className="rounded-2xl bg-emerald-50 p-6 text-center">
            <p className="font-bold text-emerald-700">
              Semua guru/karyawan sudah hadir.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.daftarBelumHadir.map((item) => (
              <BelumHadirCard key={item.idGuru} item={item} />
            ))}
          </div>
        )}
      </AdminSectionCard>

      {!data && (
        <AdminEmptyState
          icon={CalendarDays}
          title="Dashboard Tidak Tersedia"
          description="Data dashboard belum dapat dimuat. Silakan refresh halaman."
        />
      )}
    </div>
  );
}

function HadirCard({ item }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900">{item.nama}</h3>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            NIP {item.nip}
          </p>
        </div>

        <StatusBadge status={item.statusKerja} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoBox label="Datang" value={item.jamDatang || "-"} icon={Clock3} />
        <InfoBox label="Pulang" value={item.jamPulang || "-"} icon={Clock3} />
      </div>

      <div className="mt-3 rounded-2xl bg-white p-4">
        <p className="text-xs font-black uppercase text-slate-400">
          Total Jam Kerja
        </p>

        <p className="mt-1 text-lg font-black text-slate-900">
          {item.durasiKerja || "-"}
        </p>
      </div>
    </div>
  );
}

function BelumHadirCard({ item }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <UserX size={21} />
        </div>

        <div>
          <h3 className="font-black text-slate-900">{item.nama}</h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            NIP {item.nip}
          </p>

          <p className="text-xs font-semibold text-slate-400">
            {item.jabatan || "-"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-center text-xs font-black text-rose-700">
        Belum Absen Datang
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={[
        "inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-black",
        status === "Memenuhi Target"
          ? "bg-emerald-50 text-emerald-700"
          : status
          ? "bg-rose-50 text-rose-700"
          : "bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      {status || "Belum Pulang"}
    </span>
  );
}

function InfoBox({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex items-center gap-2 text-indigo-600">
        {Icon && <Icon size={16} />}
        <p className="text-xs font-black">{label}</p>
      </div>

      <p className="mt-2 text-base font-black text-slate-900">{value}</p>
    </div>
  );
}
