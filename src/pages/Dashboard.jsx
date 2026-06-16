import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  History,
  MapPin,
  Timer,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import { getTodayAbsen } from "../api/api";
import { formatTanggal, getHari } from "../utils/date";
import { getGuru } from "../utils/storage";
import logo from "../assets/logo52.png";
import { getStatusHariIni } from "../api/api";

export default function Dashboard() {
  const guru = getGuru();

  const [now, setNow] = useState(new Date());
  const [todayAbsen, setTodayAbsen] = useState(null);
  const [loading, setLoading] = useState(true);

  const [statusHariIni, setStatusHariIni] = useState(null);
  const [loadingStatusHariIni, setLoadingStatusHariIni] = useState(true);

  const hari = getHari(now);
  const tanggal = formatTanggal(now);

  const jamRealtime = useMemo(() => {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(now);
  }, [now]);

  async function loadTodayAbsen() {
    if (!guru?.idGuru) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const result = await getTodayAbsen({
      idGuru: guru.idGuru,
    });

    setLoading(false);

    if (result.success) {
      setTodayAbsen(result.data);
    }
  }

  async function loadStatusHariIni() {
    setLoadingStatusHariIni(true);

    const result = await getStatusHariIni();

    setLoadingStatusHariIni(false);

    if (!result.success) {
      return;
    }

    setStatusHariIni(result.data || null);
  }

  useEffect(() => {
    loadTodayAbsen();
    loadStatusHariIni();

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // const isHariKerja = Boolean(statusHariIni?.isHariKerja);

  // const badgeHariClass = isHariKerja
  //   ? "bg-emerald-50 text-emerald-700"
  //   : "bg-rose-50 text-rose-700";

  // const badgeHariText = loadingStatusHariIni
  //   ? "Memeriksa..."
  //   : statusHariIni?.status || "Hari Kerja";

  return (
    <div>
      <AppHeader title="Dashboard" subtitle="Absensi Digital" showLogout />

      <div className="-mt-5 space-y-4 px-5 pb-6">
        <div className="rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-soft backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-indigo-50 p-2">
              <img
                src={logo}
                alt="Logo Sekolah"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Guru / Staf
              </p>

              <h2 className="mt-1 truncate text-xl font-black text-slate-900">
                {guru?.nama || "-"}
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                NIP {guru?.nip || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 p-5 text-white shadow-premium">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/75">
                Jam Realtime
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight">
                {jamRealtime}
              </h2>

              <p className="mt-3 text-sm font-semibold text-white/80">
                {hari}, {tanggal}
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/15 backdrop-blur">
              <Clock3 size={32} />
            </div>
          </div>

          <span
            className={[
              "inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-black mt-3",
              statusHariIni?.isHariKerja
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700",
            ].join(" ")}
          >
            {loadingStatusHariIni
              ? "Memeriksa..."
              : statusHariIni?.status || "Hari Kerja"}
          </span>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Timer size={28} />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Total Jam Kerja Hari Ini
              </p>

              <h3 className="mt-1 text-2xl font-black text-slate-900">
                {loading ? "..." : todayAbsen?.durasiKerja || "-:-"}
              </h3>

              <p
                className={[
                  "mt-1 text-sm font-black",
                  todayAbsen?.statusKerja === "Memenuhi Target"
                    ? "text-emerald-600"
                    : todayAbsen?.statusKerja
                    ? "text-rose-600"
                    : "text-slate-400",
                ].join(" ")}
              >
                {todayAbsen?.statusKerja || "Belum ada status kerja"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
