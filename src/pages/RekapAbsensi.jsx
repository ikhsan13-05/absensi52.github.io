import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import StatCard from "../components/StatCard";
import LoadingScreen from "../components/LoadingScreen";
import { getBulanList } from "../utils/date";
import { getRekapAbsensi } from "../api/api";
import { exportRekapAbsensiExcel } from "../utils/exportRekapAbsensiExcel";
import { exportRekapAbsensiPdf } from "../utils/exportRekapAbsensiPdf";

export default function RekapAbsensi() {
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = String(currentDate.getFullYear());

  const [bulan, setBulan] = useState(currentMonth);
  const [tahun, setTahun] = useState(currentYear);
  const [minggu, setMinggu] = useState("1");
  const [idGuru, setIdGuru] = useState("");

  const [data, setData] = useState(null);
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPreview, setOpenPreview] = useState(false);

  const bulanList = getBulanList();

  const bulanLabel =
    bulanList.find((item) => item.value === bulan)?.label || bulan;

  const tahunList = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => String(now - index));
  }, []);

  async function loadData(showToast = false) {
    setLoading(true);

    const result = await getRekapAbsensi({
      idGuru,
      bulan,
      tahun,
      minggu,
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Gagal mengambil rekap absensi.");
      return;
    }

    setData(result.data);

    if (!idGuru && result.data?.rekap) {
      setGuruList(result.data.rekap);
    }

    if (showToast) {
      toast.success("Rekap absensi diperbarui.");
    }
  }

  useEffect(() => {
    loadData(false);
  }, [bulan, tahun, idGuru, minggu]);

  const summary = data?.summary;

  if (loading && !data) {
    return <LoadingScreen text="Memuat rekap absensi..." />;
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* HEADER */}
      <div className="rounded-[2rem] bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 p-5 text-white shadow-premium lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/75">Rekap Absensi</p>

            <h1 className="mt-1 text-2xl font-black leading-tight lg:text-3xl">
              Laporan Kehadiran
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Rekap Guru/Staf berdasarkan periode bulanan dan mingguan
            </p>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-indigo-700 disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="rounded-[2rem] bg-white p-5 shadow-soft lg:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Filter size={24} />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">Filter Rekap</h2>
            <p className="text-sm text-slate-500">
              Pilih Guru, Bulan, Tahun, dan Minggu
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <select
            value={idGuru}
            onChange={(e) => setIdGuru(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="">Semua Guru & Staf</option>
            {guruList.map((guru) => (
              <option key={guru.idGuru} value={guru.idGuru}>
                {guru.nama}
              </option>
            ))}
          </select>

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

          <select
            value={minggu}
            onChange={(e) => setMinggu(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="1">Minggu 1</option>
            <option value="2">Minggu 2</option>
            <option value="3">Minggu 3</option>
            <option value="4">Minggu 4</option>
            <option value="5">Minggu 5</option>
          </select>
        </div>
      </div>

      {/* EXPORT ACTION */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <button
          onClick={() => setOpenPreview(true)}
          disabled={loading || !data?.rekap?.length}
          className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-premium disabled:bg-slate-300 disabled:shadow-none"
        >
          <Eye size={18} />
          Preview Laporan
        </button>

        <button
          onClick={() =>
            exportRekapAbsensiExcel({
              data,
              bulanLabel,
              tahun,
              minggu,
            })
          }
          disabled={loading || !data?.rekap?.length}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-soft disabled:bg-slate-300"
        >
          <FileSpreadsheet size={18} />
          Export Excel
        </button>

        <button
          onClick={() =>
            exportRekapAbsensiPdf({
              data,
              bulanLabel,
              tahun,
            })
          }
          disabled={loading || !data?.rekap?.length}
          className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-4 text-sm font-black text-white shadow-soft disabled:bg-slate-300"
        >
          <FileText size={18} />
          Export PDF
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          title="Hari Kerja"
          value={summary?.hariKerja || 0}
          description="Efektif"
          icon={CalendarDays}
        />

        <StatCard
          title="Total Hadir"
          value={summary?.totalHadir || 0}
          description="Akumulasi"
          icon={UserCheck}
        />

        <StatCard
          title="Belum Hadir"
          value={summary?.totalTidakHadir || 0}
          description="Tidak tercatat"
          icon={UserX}
        />

        <StatCard
          title="Kehadiran"
          value={`${summary?.persentaseKehadiran || 0}%`}
          description="Periode"
          icon={BarChart3}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft lg:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Clock3 size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-400">
                Total Jam Kerja
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {summary?.totalJamKerja || "0 Jam 0 Menit"}
              </h2>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft lg:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-400">Guru Direkap</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {summary?.totalGuru || 0}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE / MOBILE CARD */}
      <div className="rounded-[2rem] bg-white p-5 shadow-soft lg:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-900">
            Tabel Rekap Absensi
          </h2>
          <p className="text-sm text-slate-500">
            Periode {bulanLabel} {tahun} • Minggu {minggu}
          </p>
        </div>

        {!data?.rekap?.length ? (
          <div className="rounded-2xl bg-slate-50 p-8 text-center">
            <p className="font-bold text-slate-500">
              Tidak ada data rekap pada periode ini.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-100 lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">NIP</th>
                    <th className="px-4 py-3">Hari Kerja</th>
                    <th className="px-4 py-3">Hadir</th>
                    <th className="px-4 py-3">Belum Hadir</th>
                    <th className="px-4 py-3">Total Jam</th>
                    <th className="px-4 py-3">Persentase</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.rekap.map((item) => (
                    <tr key={item.idGuru} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-black text-slate-900">
                        {item.nama}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{item.nip}</td>
                      <td className="px-4 py-3 font-semibold">
                        {item.hariKerja}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">
                        {item.totalHadir}
                      </td>
                      <td className="px-4 py-3 font-semibold text-rose-600">
                        {item.totalTidakHadir}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {item.totalJamKerja}
                      </td>
                      <td className="px-4 py-3">
                        <PercentBadge value={item.persentaseKehadiran} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD */}
            <div className="space-y-3 lg:hidden">
              {data.rekap.map((item) => (
                <RekapCard key={item.idGuru} item={item} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {openPreview && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 p-3 backdrop-blur-sm lg:p-4">
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-sm font-bold text-indigo-600">
                  Preview Laporan
                </p>
                <h2 className="text-lg font-black text-slate-900 lg:text-xl">
                  Rekap Absensi {bulanLabel} {tahun}
                </h2>
              </div>

              <button
                onClick={() => setOpenPreview(false)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-100 p-4 lg:p-6">
              <div className="mx-auto min-w-[900px] max-w-5xl bg-white p-8 shadow-soft">
                <div className="text-center">
                  <h1 className="text-xl font-black uppercase text-slate-900">
                    Rekap Absensi Guru/Staf
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Periode: {bulanLabel} {tahun} • Minggu {minggu}
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-5 gap-3 text-center">
                  <PreviewBox
                    label="Total Guru"
                    value={data?.summary?.totalGuru}
                  />
                  <PreviewBox
                    label="Hari Kerja"
                    value={data?.summary?.hariKerja}
                  />
                  <PreviewBox
                    label="Total Hadir"
                    value={data?.summary?.totalHadir}
                  />
                  <PreviewBox
                    label="Belum Hadir"
                    value={data?.summary?.totalTidakHadir}
                  />
                  <PreviewBox
                    label="Kehadiran"
                    value={`${data?.summary?.persentaseKehadiran}%`}
                  />
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Total Jam Kerja</p>
                  <h3 className="text-xl font-black text-slate-900">
                    {data?.summary?.totalJamKerja}
                  </h3>
                </div>

                <LiburPreview data={data} />

                <table className="mt-6 w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-indigo-600 text-white">
                      <th className="border border-indigo-600 px-3 py-3">No</th>
                      <th className="border border-indigo-600 px-3 py-3 text-left">
                        Nama
                      </th>
                      <th className="border border-indigo-600 px-3 py-3">
                        NIP
                      </th>
                      <th className="border border-indigo-600 px-3 py-3">
                        Jabatan
                      </th>
                      <th className="border border-indigo-600 px-3 py-3">
                        Hari Kerja
                      </th>
                      <th className="border border-indigo-600 px-3 py-3">
                        Hadir
                      </th>
                      <th className="border border-indigo-600 px-3 py-3">
                        Belum Hadir
                      </th>
                      <th className="border border-indigo-600 px-3 py-3">
                        Total Jam
                      </th>
                      <th className="border border-indigo-600 px-3 py-3">%</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data?.rekap?.map((item, index) => (
                      <tr key={item.idGuru}>
                        <td className="border border-slate-300 px-3 py-2 text-center">
                          {index + 1}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 font-semibold">
                          {item.nama}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center">
                          {item.nip}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center">
                          {item.jabatan || "-"}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center">
                          {item.hariKerja}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center">
                          {item.totalHadir}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center">
                          {item.totalTidakHadir}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center">
                          {item.totalJamKerja}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center">
                          {item.persentaseKehadiran}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-10 grid grid-cols-2 gap-10 text-center text-sm">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah</p>
                    <div className="h-20" />
                    <p className="font-bold underline">
                      .........................
                    </p>
                    <p>NIP. .........................</p>
                  </div>

                  <div>
                    <p>Operator,</p>
                    <p className="font-bold">Admin Absensi</p>
                    <div className="h-20" />
                    <p className="font-bold underline">
                      .........................
                    </p>
                    <p>NIP. .........................</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 p-5 lg:flex-row lg:justify-end">
              <button
                onClick={() =>
                  exportRekapAbsensiExcel({
                    data,
                    bulanLabel,
                    tahun,
                    minggu,
                  })
                }
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white"
              >
                <Download size={18} />
                Download Excel
              </button>

              <button
                onClick={() =>
                  exportRekapAbsensiPdf({
                    data,
                    bulanLabel,
                    tahun,
                  })
                }
                className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-4 text-sm font-black text-white"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RekapCard({ item }) {
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

        <PercentBadge value={item.persentaseKehadiran} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniStat label="Hari Kerja" value={item.hariKerja} tone="slate" />
        <MiniStat label="Hadir" value={item.totalHadir} tone="emerald" />
        <MiniStat
          label="Belum Hadir"
          value={item.totalTidakHadir}
          tone="rose"
        />
        <MiniStat label="Total Jam" value={item.totalJamKerja} tone="indigo" />
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone = "slate" }) {
  const toneClass = {
    slate: "bg-white text-slate-900",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    indigo: "bg-indigo-50 text-indigo-700",
  }[tone];

  return (
    <div className={`rounded-2xl p-4 ${toneClass}`}>
      <p className="text-[11px] font-black uppercase opacity-70">{label}</p>
      <p className="mt-1 text-lg font-black">{value || 0}</p>
    </div>
  );
}

function PercentBadge({ value }) {
  const persen = Number(value || 0);

  return (
    <span
      className={[
        "inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-black",
        persen >= 90
          ? "bg-emerald-50 text-emerald-700"
          : persen >= 70
          ? "bg-indigo-50 text-indigo-700"
          : "bg-rose-50 text-rose-700",
      ].join(" ")}
    >
      {persen}%
    </span>
  );
}

function PreviewBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <h3 className="text-lg font-black">{value || 0}</h3>
    </div>
  );
}

function LiburPreview({ data }) {
  return (
    <div className="mt-5 rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">Daftar Hari Libur</p>
          <p className="text-xs text-slate-500">
            Hari libur aktif yang mengurangi hari kerja efektif
          </p>
        </div>

        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">
          {data?.daftarLibur?.length || 0} Libur
        </span>
      </div>

      {data?.daftarLibur?.length > 0 ? (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-rose-600 text-white">
              <th className="border border-rose-600 px-3 py-2">No</th>
              <th className="border border-rose-600 px-3 py-2">Tanggal</th>
              <th className="border border-rose-600 px-3 py-2 text-left">
                Keterangan
              </th>
              <th className="border border-rose-600 px-3 py-2">Jenis</th>
            </tr>
          </thead>

          <tbody>
            {data.daftarLibur.map((item, index) => (
              <tr key={`${item.tanggal}-${index}`}>
                <td className="border border-slate-300 px-3 py-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center">
                  {item.tanggal}
                </td>
                <td className="border border-slate-300 px-3 py-2">
                  {item.keterangan || "-"}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center">
                  {item.jenis || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
          Tidak ada hari libur aktif pada periode ini.
        </div>
      )}
    </div>
  );
}
