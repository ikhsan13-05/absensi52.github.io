import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  History,
  RefreshCw,
  Timer,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import AppHeader from "../components/AppHeader";
import SkeletonCard from "../components/SkeletonCard";
import { getRiwayatAbsen } from "../api/api";
import { getGuru } from "../utils/storage";
import { getBulanList } from "../utils/date";

export default function RiwayatAbsen() {
  const guru = getGuru();

  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = String(currentDate.getFullYear());

  const [bulan, setBulan] = useState(currentMonth);
  const [tahun, setTahun] = useState(currentYear);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const bulanList = getBulanList();

  const bulanLabel =
    bulanList.find((item) => item.value === bulan)?.label || bulan;

  const tahunList = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => String(now - index));
  }, []);

  const summary = useMemo(() => {
    const total = data.length;
    const memenuhi = data.filter(
      (item) => item.statusKerja === "Memenuhi Target",
    ).length;
    const belumMemenuhi = data.filter(
      (item) => item.statusKerja === "Belum Memenuhi Target",
    ).length;
    const belumPulang = data.filter(
      (item) => item.jamDatang && !item.jamPulang,
    ).length;

    return {
      total,
      memenuhi,
      belumMemenuhi,
      belumPulang,
    };
  }, [data]);

  async function loadData() {
    if (!guru?.idGuru) return;

    setLoading(true);

    const result = await getRiwayatAbsen({
      idGuru: guru.idGuru,
      bulan,
      tahun,
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Gagal mengambil riwayat absen.");
      return;
    }

    setData(result.data || []);
  }

  useEffect(() => {
    loadData();
  }, [bulan, tahun]);

  function getStatusStyle(status) {
    if (status === "Memenuhi Target") {
      return {
        badge: "bg-emerald-50 text-emerald-700",
        icon: <CheckCircle2 size={14} />,
      };
    }

    if (status === "Belum Memenuhi Target") {
      return {
        badge: "bg-rose-50 text-rose-700",
        icon: <XCircle size={14} />,
      };
    }

    return {
      badge: "bg-slate-100 text-slate-500",
      icon: <Clock3 size={14} />,
    };
  }

  return (
    <div>
      <AppHeader
        title="Riwayat Absen"
        subtitle="Data Kehadiran Bulanan"
        showLogout
      />

      <div className="-mt-5 space-y-4 px-5 pb-6">
        <div className="rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-soft backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Filter size={24} />
            </div>

            <div>
              <h3 className="font-black text-slate-900">Filter Riwayat</h3>
              <p className="text-xs font-semibold text-slate-500">
                Periode {bulanLabel} {tahun}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              {bulanList.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              {tahunList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-premium disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {data.length === 0 ? (
              <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-400">
                  <History size={38} />
                </div>

                <h3 className="mt-5 text-lg font-black text-slate-900">
                  Belum Ada Riwayat
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Tidak ada data absensi pada bulan dan tahun yang dipilih.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.map((item) => {
                  const statusStyle = getStatusStyle(item.statusKerja);

                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-[2rem] bg-white shadow-soft"
                    >
                      <div className="border-b border-slate-100 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                              <CalendarDays size={24} />
                            </div>

                            <div>
                              <h3 className="font-black text-slate-900">
                                {item.hari || "-"}
                              </h3>

                              <p className="text-sm font-semibold text-slate-500">
                                {item.tanggal || "-"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={[
                                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black",
                                statusStyle.badge,
                              ].join(" ")}
                            >
                              {statusStyle.icon}
                              {item.statusKerja || "Belum Pulang"}
                            </span>

                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-700">
                              {item.durasiKerja || "0 Jam 0 Menit"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-5">
                        <div className="rounded-2xl bg-indigo-50 p-4">
                          <div className="flex items-center gap-2 text-indigo-600">
                            <Clock3 size={18} />
                            <p className="text-xs font-black">Jam Datang</p>
                          </div>

                          <p className="mt-2 text-2xl font-black text-slate-900">
                            {item.jamDatang || "-:-"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-4">
                          <div className="flex items-center gap-2 text-blue-600">
                            <Clock3 size={18} />
                            <p className="text-xs font-black">Jam Pulang</p>
                          </div>

                          <p className="mt-2 text-2xl font-black text-slate-900">
                            {item.jamPulang || "-:-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
