import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MonitorSmartphone,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Smartphone,
  UserRound,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import ConfirmModal from "../components/ConfirmModal";
import LoadingScreen from "../components/LoadingScreen";
import { getGuruList, resetDeviceGuru } from "../api/api";

export default function KelolaGuru() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [deviceFilter, setDeviceFilter] = useState("Semua");

  const [selected, setSelected] = useState(null);
  const [openReset, setOpenReset] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [openDetailId, setOpenDetailId] = useState(null);

  async function loadData(showToast = false) {
    setLoading(true);

    const result = await getGuruList();

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Gagal mengambil data guru.");
      return;
    }

    setData(result.data || []);

    if (showToast) {
      toast.success("Data guru diperbarui.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = data.length;
    const aktif = data.filter(
      (item) => String(item.status).toLowerCase() === "aktif",
    ).length;
    const bound = data.filter((item) => item.isDeviceBound).length;
    const unbound = total - bound;

    return { total, aktif, bound, unbound };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchText = [item.nama, item.nip, item.jabatan, item.deviceInfo]
        .join(" ")
        .toLowerCase();

      const matchKeyword = searchText.includes(keyword.toLowerCase());

      const matchStatus =
        statusFilter === "Semua" ? true : item.status === statusFilter;

      const matchDevice =
        deviceFilter === "Semua"
          ? true
          : deviceFilter === "Terikat"
          ? item.isDeviceBound
          : !item.isDeviceBound;

      return matchKeyword && matchStatus && matchDevice;
    });
  }, [data, keyword, statusFilter, deviceFilter]);

  function askReset(item) {
    setSelected(item);
    setOpenReset(true);
  }

  async function handleResetDevice() {
    if (!selected?.idGuru) return;

    setProcessing(true);

    const result = await resetDeviceGuru({
      idGuru: selected.idGuru,
    });

    setProcessing(false);

    if (!result.success) {
      toast.error(result.message || "Gagal reset device.");
      return;
    }

    toast.success(result.message || "Device berhasil direset.");
    setOpenReset(false);
    setSelected(null);
    setOpenDetailId(null);
    loadData();
  }

  if (loading && data.length === 0) {
    return <LoadingScreen text="Memuat data guru..." />;
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* HEADER */}
      <div className="rounded-[2rem] bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 p-5 text-white shadow-premium lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/75">
              Admin Device Binding
            </p>

            <h1 className="mt-1 text-2xl font-black leading-tight lg:text-3xl">
              Kelola Guru
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Pantau perangkat guru dan reset device jika guru berganti HP.
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

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatBox
          title="Total Guru"
          value={stats.total}
          icon={UserRound}
          tone="indigo"
        />

        <StatBox
          title="Guru Aktif"
          value={stats.aktif}
          icon={CheckCircle2}
          tone="emerald"
        />

        <StatBox
          title="Device Terikat"
          value={stats.bound}
          icon={ShieldCheck}
          tone="blue"
        />

        <StatBox
          title="Belum Terikat"
          value={stats.unbound}
          icon={XCircle}
          tone="rose"
        />
      </div>

      {/* FILTER */}
      <div className="rounded-[2rem] bg-white p-5 shadow-soft">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
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
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>

          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none"
          >
            <option value="Semua">Semua Device</option>
            <option value="Terikat">Device Terikat</option>
            <option value="Belum Terikat">Belum Terikat</option>
          </select>
        </div>
      </div>

      {/* DATA */}
      {filteredData.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-400">
            <MonitorSmartphone size={38} />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-900">
            Data Tidak Ditemukan
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Coba ubah kata kunci atau filter pencarian.
          </p>
        </div>
      ) : (
        <div className="space-y-3 lg:space-y-4">
          {filteredData.map((item) => (
            <GuruCard
              key={item.idGuru}
              item={item}
              openDetailId={openDetailId}
              setOpenDetailId={setOpenDetailId}
              askReset={askReset}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={openReset}
        title="Reset Device Guru?"
        message={`Device untuk ${
          selected?.nama || "guru ini"
        } akan dikosongkan. Setelah itu guru dapat login dari perangkat baru.`}
        confirmText="Reset"
        cancelText="Batal"
        loading={processing}
        onClose={() => setOpenReset(false)}
        onConfirm={handleResetDevice}
      />
    </div>
  );
}

function GuruCard({ item, openDetailId, setOpenDetailId, askReset }) {
  const isOpen = openDetailId === item.idGuru;

  return (
    <div className="rounded-[2rem] bg-white p-4 shadow-soft lg:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3 lg:gap-4">
          <div
            className={[
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl lg:h-14 lg:w-14",
              item.isDeviceBound
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500",
            ].join(" ")}
          >
            {item.isDeviceBound ? (
              <Smartphone size={26} />
            ) : (
              <MonitorSmartphone size={26} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-black text-slate-900 lg:text-lg">
                {item.nama}
              </h3>

              <StatusBadge status={item.status} />
              <DeviceBadge isBound={item.isDeviceBound} />
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              NIP {item.nip} • {item.jabatan || "-"}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
              <SmallInfo label="Last Login" value={item.lastLogin || "-"} />
              <SmallInfo
                label="Device"
                value={item.isDeviceBound ? "Terdaftar" : "Belum Terdaftar"}
              />
            </div>

            {/* MOBILE COLLAPSE DETAIL */}
            <div className="mt-3 lg:hidden">
              <button
                onClick={() => setOpenDetailId(isOpen ? null : item.idGuru)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700"
              >
                {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                {isOpen ? "Sembunyikan Detail" : "Lihat Detail Device"}
              </button>

              {isOpen && <DeviceDetail item={item} />}
            </div>

            {/* DESKTOP DETAIL ALWAYS SHOW */}
            <div className="mt-3 hidden lg:block">
              <DeviceDetail item={item} />
            </div>
          </div>
        </div>

        <button
          onClick={() => askReset(item)}
          disabled={!item.isDeviceBound}
          className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-soft disabled:bg-slate-300"
        >
          <RotateCcw size={18} />
          Reset Device
        </button>
      </div>
    </div>
  );
}

function DeviceDetail({ item }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase text-slate-400">Device ID</p>
        <p className="mt-1 break-all text-xs font-bold leading-relaxed text-slate-700 lg:text-sm">
          {item.deviceId || "-"}
        </p>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase text-slate-400">
          Device Info
        </p>
        <p className="mt-1 break-words text-xs font-semibold leading-relaxed text-slate-600 lg:text-sm">
          {item.deviceInfo || "-"}
        </p>
      </div>
    </div>
  );
}

function StatBox({ title, value, icon: Icon, tone = "indigo" }) {
  const toneClass = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
  }[tone];

  return (
    <div className="rounded-[2rem] bg-white p-4 shadow-soft lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-slate-400 lg:text-sm">
            {title}
          </p>
          <h3 className="mt-1 text-2xl font-black text-slate-900 lg:text-3xl">
            {value}
          </h3>
        </div>

        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-2xl lg:h-12 lg:w-12",
            toneClass,
          ].join(" ")}
        >
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function SmallInfo({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-[10px] font-black",
        status === "Aktif"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      {status || "-"}
    </span>
  );
}

function DeviceBadge({ isBound }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-[10px] font-black",
        isBound ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700",
      ].join(" ")}
    >
      {isBound ? "Device Terikat" : "Belum Terikat"}
    </span>
  );
}
