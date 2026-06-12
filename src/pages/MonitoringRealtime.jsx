import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  LogOut,
  Monitor,
  RefreshCw,
  Search,
  Timer,
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
import { getMonitoringHarian } from "../api/api";

export default function MonitoringRealtime() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [autoRefresh, setAutoRefresh] = useState(true);

  async function loadData(showToast = false) {
    setLoading(true);

    const result = await getMonitoringHarian();

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Gagal mengambil data monitoring.");
      return;
    }

    setData(result.data);

    if (showToast) {
      toast.success("Monitoring diperbarui.");
    }
  }

  useEffect(() => {
    loadData(false);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredData = useMemo(() => {
    const rows = data?.monitoring || [];

    return rows.filter((item) => {
      const searchText = [item.nama, item.nip, item.jabatan, item.status]
        .join(" ")
        .toLowerCase();

      const matchKeyword = searchText.includes(keyword.toLowerCase());

      const matchStatus =
        statusFilter === "Semua" ? true : item.status === statusFilter;

      return matchKeyword && matchStatus;
    });
  }, [data, keyword, statusFilter]);

  const summary = data?.summary || {};

  if (loading && !data) {
    return <LoadingScreen text="Memuat monitoring realtime..." />;
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Monitoring Realtime"
        title="Kehadiran Hari Ini"
        description={`Update terakhir: ${data?.lastUpdate || "-"}`}
        loading={loading}
        onRefresh={() => loadData(true)}
        action={
          <button
            onClick={() => setAutoRefresh((prev) => !prev)}
            className={[
              "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black lg:text-sm",
              autoRefresh
                ? "bg-emerald-100 text-emerald-700"
                : "bg-white/15 text-white backdrop-blur",
            ].join(" ")}
          >
            <Activity size={18} />
            {autoRefresh ? "Auto ON" : "Auto OFF"}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
        <StatCard
          title="Total Guru"
          value={summary.totalGuru || 0}
          description="Aktif"
          icon={Users}
        />

        <StatCard
          title="Sudah Hadir"
          value={summary.sudahHadir || 0}
          description="Absen datang"
          icon={UserCheck}
        />

        <StatCard
          title="Belum Hadir"
          value={summary.belumHadir || 0}
          description="Belum absen"
          icon={UserX}
        />

        <StatCard
          title="Bekerja"
          value={summary.sedangBekerja || 0}
          description="Belum pulang"
          icon={Clock3}
        />

        <div className="col-span-2 lg:col-span-1">
          <StatCard
            title="Sudah Pulang"
            value={summary.sudahPulang || 0}
            description={`${summary.persentaseHadir || 0}% hadir`}
            icon={LogOut}
          />
        </div>
      </div>

      <AdminSectionCard
        title="Filter Monitoring"
        description="Cari berdasarkan nama, NIP, jabatan, atau status."
        icon={Monitor}
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
            <Search size={20} className="text-slate-400" />

            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari nama, NIP, jabatan..."
              className="w-full bg-transparent px-3 py-3 text-sm font-semibold outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input"
          >
            <option value="Semua">Semua Status</option>
            <option value="Belum Hadir">Belum Hadir</option>
            <option value="Sedang Bekerja">Sedang Bekerja</option>
            <option value="Sudah Pulang">Sudah Pulang</option>
          </select>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Daftar Monitoring"
        description="Status absensi guru/karyawan hari ini."
        icon={Monitor}
        right={
          loading ? (
            <RefreshCw size={20} className="animate-spin text-indigo-600" />
          ) : null
        }
      >
        {filteredData.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-8 text-center">
            <p className="font-bold text-slate-500">
              Data monitoring tidak ditemukan.
            </p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead className="admin-table-head">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Jabatan</th>
                    <th className="px-4 py-3">Datang</th>
                    <th className="px-4 py-3">Pulang</th>
                    <th className="px-4 py-3">Durasi</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Target</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item) => (
                    <tr key={item.idGuru} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-black text-slate-900">{item.nama}</p>

                        <p className="text-xs font-semibold text-slate-500">
                          NIP {item.nip}
                        </p>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-600">
                        {item.jabatan || "-"}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-700">
                        {item.jamDatang || "-"}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-700">
                        {item.jamPulang || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <DurationBadge value={item.durasiKerja || "-"} />
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-4 py-3">
                        <TargetBadge status={item.statusKerja} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-mobile-list">
              {filteredData.map((item) => (
                <MonitoringCard key={item.idGuru} item={item} />
              ))}
            </div>
          </>
        )}
      </AdminSectionCard>

      {!data && (
        <AdminEmptyState
          icon={Monitor}
          title="Monitoring Tidak Tersedia"
          description="Data monitoring belum dapat dimuat. Silakan refresh halaman."
        />
      )}
    </div>
  );
}

function MonitoringCard({ item }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900">{item.nama}</h3>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            NIP {item.nip}
          </p>

          <p className="text-xs font-semibold text-slate-400">
            {item.jabatan || "-"}
          </p>
        </div>

        <StatusBadge status={item.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoBox
          label="Datang"
          value={item.jamDatang || "-"}
          icon={Clock3}
          tone="indigo"
        />

        <InfoBox
          label="Pulang"
          value={item.jamPulang || "-"}
          icon={LogOut}
          tone="blue"
        />
      </div>

      <div className="mt-3 rounded-2xl bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-slate-400">
              Total Jam Kerja
            </p>

            <p className="mt-1 text-lg font-black text-slate-900">
              {item.durasiKerja || "-"}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Timer size={22} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <TargetBadge status={item.statusKerja} />

        {item.jarakDatang && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            Datang: {formatJarak(item.jarakDatang)}
          </span>
        )}

        {item.jarakPulang && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            Pulang: {formatJarak(item.jarakPulang)}
          </span>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon, tone = "indigo" }) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-600"
      : "bg-indigo-50 text-indigo-600";

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className={`flex items-center gap-2 ${toneClass}`}>
        {Icon && <Icon size={16} />}
        <p className="text-xs font-black">{label}</p>
      </div>

      <p className="mt-2 text-base font-black text-slate-900">{value}</p>
    </div>
  );
}

function DurationBadge({ value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
      <Timer size={14} />
      {value}
    </div>
  );
}

function StatusBadge({ status }) {
  const className =
    status === "Sudah Pulang"
      ? "bg-blue-50 text-blue-700"
      : status === "Sedang Bekerja"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-rose-50 text-rose-700";

  return (
    <span
      className={[
        "inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-black",
        className,
      ].join(" ")}
    >
      {status || "Belum Hadir"}
    </span>
  );
}

function TargetBadge({ status }) {
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
      {status || "Belum Ada Target"}
    </span>
  );
}

function formatJarak(value) {
  const angka = Number(value || 0);

  if (Number.isNaN(angka)) return "-";

  if (angka >= 1000) {
    return `${(angka / 1000).toFixed(2)} km`;
  }

  return `${Math.round(angka)} m`;
}
