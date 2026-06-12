import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  LocateFixed,
  LogIn,
  LogOut,
  MapPin,
  RefreshCw,
  Timer,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import AppHeader from "../components/AppHeader";
import LoadingScreen from "../components/LoadingScreen";
import SkeletonCard from "../components/SkeletonCard";
import {
  absenDatang,
  absenPulang,
  getMobileRealtime,
  getSetting,
  getTodayAbsen,
} from "../api/api";
import { formatJarak, hitungJarakMeter } from "../utils/haversine";
import { getDeviceId, getGuru, removeGuru } from "../utils/storage";
import logo from "../assets/logo52.png";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

const schoolIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -34],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32],
});

function MapAutoCenter({ schoolPosition, userPosition }) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();

      if (schoolPosition && userPosition) {
        const bounds = L.latLngBounds([schoolPosition, userPosition]);
        map.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 18,
        });
      } else if (schoolPosition) {
        map.setView(schoolPosition, 17);
      }
    }, 300);
  }, [map, schoolPosition, userPosition]);

  return null;
}

function timeToMinutes(value) {
  if (!value) return null;

  if (
    typeof value === "string" &&
    value.includes(":") &&
    !value.includes("T")
  ) {
    const [hour, minute] = value.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.getHours() * 60 + date.getMinutes();
  }

  return null;
}

function isNowInRange(start, end) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (startMinutes === null || endMinutes === null) return false;

  return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
}

function isNowAfterStart(start) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = timeToMinutes(start);

  if (startMinutes === null) return false;

  return nowMinutes >= startMinutes;
}

function formatJamSetting(value) {
  const minutes = timeToMinutes(value);
  if (minutes === null) return "-";

  const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minute = String(minutes % 60).padStart(2, "0");

  return `${hour}:${minute}`;
}

function durasiToMenit(durasi) {
  if (!durasi) return 0;

  const str = String(durasi);

  const jamMatch = str.match(/(\d+)\s*Jam/i);
  const menitMatch = str.match(/(\d+)\s*Menit/i);

  const jam = jamMatch ? Number(jamMatch[1]) : 0;
  const menit = menitMatch ? Number(menitMatch[1]) : 0;

  return jam * 60 + menit;
}

function menitToDurasi(totalMenit) {
  const safe = Math.max(Number(totalMenit || 0), 0);
  const jam = Math.floor(safe / 60);
  const menit = safe % 60;

  return `${jam} Jam ${menit} Menit`;
}

function jamStringToDateToday(jamString) {
  if (!jamString) return null;

  const [hour, minute, second] = String(jamString).split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(Number.isNaN(second) ? 0 : second);
  date.setMilliseconds(0);

  return date;
}

export default function MobileAbsen() {
  const guru = getGuru();

  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [lastSync, setLastSync] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [deviceInvalid, setDeviceInvalid] = useState(false);

  const [setting, setSetting] = useState(null);
  const [loadingSetting, setLoadingSetting] = useState(true);

  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [todayAbsen, setTodayAbsen] = useState(null);
  const [loadingTodayAbsen, setLoadingTodayAbsen] = useState(true);

  const [loadingDatang, setLoadingDatang] = useState(false);
  const [loadingPulang, setLoadingPulang] = useState(false);

  const [openMapModal, setOpenMapModal] = useState(false);
  const [absenMode, setAbsenMode] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  async function loadMobileRealtime(showToast = false) {
    if (!guru?.idGuru) {
      setLoadingSetting(false);
      setLoadingTodayAbsen(false);
      return;
    }

    setRealtimeLoading(true);

    const result = await getMobileRealtime({
      idGuru: guru.idGuru,
      deviceId: getDeviceId(),
    });

    setRealtimeLoading(false);
    setLoadingSetting(false);
    setLoadingTodayAbsen(false);

    if (!result.success) {
      if (showToast) {
        toast.error(result.message || "Gagal sinkronisasi realtime.");
      }
      return;
    }

    const payload = result.data;

    setSetting(payload.setting || null);
    setTodayAbsen(payload.todayAbsen || null);
    setLastSync(payload.serverTime || "");

    if (payload.deviceValid === false) {
      setDeviceInvalid(true);
      toast.error("Device sudah direset admin. Silakan login ulang.");
      removeGuru();
      window.location.href = "/login";
      return;
    }

    setDeviceInvalid(false);

    if (showToast) {
      toast.success("Data realtime berhasil diperbarui.");
    }
  }

  async function loadSetting() {
    setLoadingSetting(true);

    const result = await getSetting();

    setLoadingSetting(false);

    if (!result.success) {
      toast.error(result.message || "Gagal mengambil setting sekolah.");
      return;
    }

    setSetting(result.data);
  }

  async function loadTodayAbsen() {
    if (!guru?.idGuru) {
      setLoadingTodayAbsen(false);
      return;
    }

    setLoadingTodayAbsen(true);

    const result = await getTodayAbsen({
      idGuru: guru.idGuru,
    });

    setLoadingTodayAbsen(false);

    if (!result.success) {
      toast.error(result.message || "Gagal mengambil absensi hari ini.");
      return;
    }

    setTodayAbsen(result.data);
  }

  async function getCurrentLocation(showToast = true) {
    try {
      setLoadingLocation(true);
      setLocationError("");

      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions();

        if (permission.location !== "granted") {
          setLoadingLocation(false);
          setLocationError("Izin lokasi belum diberikan.");
          toast.error("Izin lokasi belum diberikan.");
          return;
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });

        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        });

        setLoadingLocation(false);

        if (showToast) {
          toast.success("Lokasi berhasil diperbarui.");
        }

        return;
      }

      if (!navigator.geolocation) {
        setLoadingLocation(false);
        setLocationError("Perangkat tidak mendukung GPS.");
        toast.error("Perangkat tidak mendukung GPS.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoadingLocation(false);

          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          });

          if (showToast) {
            toast.success("Lokasi berhasil diperbarui.");
          }
        },
        (error) => {
          setLoadingLocation(false);

          let message = "Gagal mengambil lokasi.";

          if (error.code === 1) {
            message = "Izin lokasi ditolak. Aktifkan izin lokasi aplikasi.";
          }

          if (error.code === 2) {
            message = "Lokasi tidak tersedia. Pastikan GPS aktif.";
          }

          if (error.code === 3) {
            message = "Waktu mengambil lokasi habis. Coba lagi.";
          }

          setLocationError(message);
          toast.error(message);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        },
      );
    } catch (error) {
      setLoadingLocation(false);
      console.error(error);

      const message = "Gagal mengambil lokasi GPS.";
      setLocationError(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    loadMobileRealtime(false);
    getCurrentLocation(false);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadMobileRealtime(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, guru?.idGuru]);

  const school = useMemo(() => {
    if (!setting) return null;

    return {
      name: setting.schoolName || "Sekolah",
      lat: Number(setting.schoolLat),
      lng: Number(setting.schoolLng),
      radius: Number(setting.radiusMeter || 100),
    };
  }, [setting]);

  const jarak = useMemo(() => {
    if (!school || !location) return null;

    return hitungJarakMeter(
      Number(location.lat),
      Number(location.lng),
      Number(school.lat),
      Number(school.lng),
    );
  }, [school, location]);

  const dalamArea = useMemo(() => {
    if (jarak === null || !school) return false;
    return jarak <= school.radius;
  }, [jarak, school]);

  const schoolPosition = school ? [school.lat, school.lng] : null;
  const userPosition = location ? [location.lat, location.lng] : null;

  function openAbsenModal(mode) {
    setAbsenMode(mode);
    setOpenMapModal(true);
    getCurrentLocation(false);
  }

  const bolehAbsenDatang = useMemo(() => {
    return isNowAfterStart(setting?.jamMulaiDatang);
  }, [setting]);

  const bolehAbsenPulang = useMemo(() => {
    if (!setting) return false;

    return isNowInRange(setting.jamMulaiPulang, setting.jamBatasPulang);
  }, [setting]);

  async function handleAbsenDatang() {
    if (!guru) {
      toast.error("Data guru tidak ditemukan. Silakan login ulang.");
      return;
    }

    if (!location) {
      toast.error("Lokasi belum terdeteksi.");
      return;
    }

    if (!dalamArea) {
      toast.error("Anda berada di luar area sekolah.");
      return;
    }

    setLoadingDatang(true);

    const result = await absenDatang({
      idGuru: guru.idGuru,
      nama: guru.nama,
      nip: guru.nip,
      latDatang: location.lat,
      lngDatang: location.lng,
      jarakDatang: jarak,
      deviceId: getDeviceId(),
    });

    setLoadingDatang(false);

    if (!result.success) {
      toast.error(result.message || "Gagal absen datang.");
      await loadTodayAbsen();
      return;
    }

    toast.success(result.message || "Absen datang berhasil.");
    setOpenMapModal(false);
    await loadMobileRealtime(false);
  }

  async function handleAbsenPulang() {
    if (!guru) {
      toast.error("Data guru tidak ditemukan. Silakan login ulang.");
      return;
    }

    if (!location) {
      toast.error("Lokasi belum terdeteksi.");
      return;
    }

    if (!dalamArea) {
      toast.error("Anda berada di luar area sekolah.");
      return;
    }

    setLoadingPulang(true);

    const result = await absenPulang({
      idGuru: guru.idGuru,
      nama: guru.nama,
      nip: guru.nip,
      latPulang: location.lat,
      lngPulang: location.lng,
      jarakPulang: jarak,
      deviceId: getDeviceId(),
    });

    setLoadingPulang(false);

    if (!result.success) {
      toast.error(result.message || "Gagal absen pulang.");
      await loadTodayAbsen();
      return;
    }

    toast.success(result.message || "Absen pulang berhasil.");
    setOpenMapModal(false);
    await loadMobileRealtime(false);
  }

  const modalTitle =
    absenMode === "datang"
      ? "Konfirmasi Absen Datang"
      : "Konfirmasi Absen Pulang";

  const modalButtonText =
    absenMode === "datang" ? "Simpan Absen Datang" : "Simpan Absen Pulang";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const TARGET_HARIAN = 8 * 60;

  const totalMenitKerjaRealtime = useMemo(() => {
    if (!todayAbsen?.jamDatang) return 0;

    if (todayAbsen?.jamPulang) {
      return durasiToMenit(todayAbsen?.durasiKerja);
    }

    const datangDate = jamStringToDateToday(todayAbsen.jamDatang);

    if (!datangDate) return 0;

    const diff = Math.floor((currentTime - datangDate) / 60000);

    return Math.max(diff, 0);
  }, [todayAbsen, currentTime]);

  const totalJamKerjaRealtime = useMemo(() => {
    return menitToDurasi(totalMenitKerjaRealtime);
  }, [totalMenitKerjaRealtime]);

  const kekuranganMenitRealtime = useMemo(() => {
    return Math.max(TARGET_HARIAN - totalMenitKerjaRealtime, 0);
  }, [totalMenitKerjaRealtime]);

  const kekuranganJamRealtime = useMemo(() => {
    return menitToDurasi(kekuranganMenitRealtime);
  }, [kekuranganMenitRealtime]);

  const statusKerjaRealtime = useMemo(() => {
    if (!todayAbsen?.jamDatang) return "Belum Absen Datang";

    if (totalMenitKerjaRealtime >= TARGET_HARIAN) {
      return "Memenuhi Target";
    }

    return "Belum Memenuhi Target";
  }, [todayAbsen, totalMenitKerjaRealtime]);

  
  return (
    <div>
      <AppHeader subtitle="Absensi Digital" title="Guru / Staf" showLogout />

      <div className="mb-5 flex items-center justify-end">
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold",
            autoRefresh
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          <span
            className={[
              "h-2 w-2 rounded-full",
              autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-400",
            ].join(" ")}
          />

          {autoRefresh
            ? `Sync ${lastSync?.split(" ")?.[1] || ""}`
            : "Realtime OFF"}
        </span>
      </div>

      <div className="-mt-5 space-y-4 px-5 pb-6">
        {loadingSetting ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-soft backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <img
                    src={logo}
                    alt="Logo Sekolah"
                    className="w-16 h-16 object-contain"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Lokasi Sekolah
                  </p>
                  <h2 className="mt-1 text-lg font-black text-slate-900">
                    {school?.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Radius valid: {school?.radius} meter
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white p-4 shadow-soft text-center">
                <p className="text-xs text-slate-400">Jam Absen Datang</p>
                <h3 className="mt-1 text-sm font-black text-slate-900">
                  {formatJamSetting(setting?.jamMulaiDatang)} WITA
                </h3>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow-soft text-center">
                <p className="text-xs font-bold text-slate-400">
                  Jam Absen Pulang
                </p>
                <h3 className="mt-1 text-sm font-black text-slate-900">
                  {formatJamSetting(setting?.jamMulaiPulang)} -{" "}
                  {formatJamSetting(setting?.jamBatasPulang)} WITA
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white p-4 shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <LogIn size={24} />
                </div>

                <p className="mt-4 text-xs font-bold text-slate-400">
                  Jam Datang
                </p>

                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  {loadingTodayAbsen ? "..." : todayAbsen?.jamDatang || "-:-"}
                </h3>

                <button
                  onClick={() => openAbsenModal("datang")}
                  disabled={
                    loadingTodayAbsen ||
                    Boolean(todayAbsen?.jamDatang) ||
                    !bolehAbsenDatang
                  }
                  className="mt-4 w-full rounded-2xl bg-indigo-600 px-3 py-3 text-xs font-black text-white shadow-premium disabled:bg-slate-300 disabled:shadow-none"
                >
                  {todayAbsen?.jamDatang
                    ? "Sudah Datang"
                    : !bolehAbsenDatang
                      ? "Di Luar Jam"
                      : "Check In"}
                </button>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-red-600">
                  <LogOut size={24} />
                </div>

                <p className="mt-4 text-xs font-bold text-slate-400">
                  Jam Pulang
                </p>

                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  {loadingTodayAbsen ? "..." : todayAbsen?.jamPulang || "-:-"}
                </h3>

                <button
                  onClick={() => openAbsenModal("pulang")}
                  disabled={
                    loadingTodayAbsen ||
                    Boolean(todayAbsen?.jamPulang) ||
                    !bolehAbsenPulang
                  }
                  className="mt-4 w-full rounded-2xl bg-blue-600 px-3 py-3 text-xs font-black text-white shadow-premium disabled:bg-slate-300 disabled:shadow-none"
                >
                  {todayAbsen?.jamPulang
                    ? "Sudah Pulang"
                    : !bolehAbsenPulang
                      ? "Di Luar Jam"
                      : !todayAbsen?.jamDatang
                        ? "Check Out"
                        : "Check Out"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <Clock3 size={24} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500">
                    Total Jam Kerja
                  </p>
                  <h3 className="text-xl font-black text-slate-900">
                    {todayAbsen?.jamDatang ? totalJamKerjaRealtime : "-"}
                  </h3>
                </div>
              </div>

              <div
                className={[
                  "mt-4 rounded-2xl px-4 py-3 text-sm font-black",
                  todayAbsen?.statusKerja === "Memenuhi Target"
                    ? "bg-emerald-50 text-emerald-700"
                    : todayAbsen?.statusKerja
                      ? "bg-rose-50 text-rose-700"
                      : "bg-slate-50 text-slate-500",
                ].join(" ")}
              >
                {statusKerjaRealtime}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-wide text-slate-500">
                    Kekurangan Jam Hari Ini
                  </p>

                  <h3
                    className={[
                      "mt-2 text-xl font-black",
                      kekuranganMenitRealtime === 0
                        ? "text-emerald-600"
                        : "text-rose-600",
                    ].join(" ")}
                  >
                    {todayAbsen?.jamDatang
                      ? kekuranganJamRealtime
                      : "8 Jam 0 Menit"}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Target kerja harian 8 jam
                  </p>
                </div>

                <div
                  className={[
                    "flex h-14 w-14 items-center justify-center rounded-2xl",
                    kekuranganMenitRealtime === 0
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600",
                  ].join(" ")}
                >
                  <Timer size={26} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {openMapModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-md flex-col bg-slate-50">
            <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 px-5 pb-5 pt-8 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white/80">
                    Validasi Lokasi GPS
                  </p>
                  <h2 className="mt-1 text-2xl font-black">{modalTitle}</h2>
                </div>

                <button
                  onClick={() => setOpenMapModal(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div
                className={[
                  "mb-4 rounded-3xl border p-4",
                  dalamArea
                    ? "border-emerald-100 bg-emerald-50"
                    : "border-rose-100 bg-rose-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      dalamArea
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700",
                    ].join(" ")}
                  >
                    {dalamArea ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <AlertCircle size={24} />
                    )}
                  </div>

                  <div>
                    <h3
                      className={[
                        "font-black",
                        dalamArea ? "text-emerald-700" : "text-rose-700",
                      ].join(" ")}
                    >
                      {location
                        ? dalamArea
                          ? "Dalam Area Sekolah"
                          : "Di Luar Area Sekolah"
                        : "Lokasi Belum Terdeteksi"}
                    </h3>

                    <p className="text-sm font-semibold text-slate-600">
                      Jarak: {jarak !== null ? formatJarak(jarak) : "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
                <div className="flex items-center justify-between border-b border-slate-100 p-4">
                  <div>
                    <h3 className="font-black text-slate-900">Peta Lokasi</h3>
                    <p className="text-xs text-slate-500">
                      Pastikan posisi Anda berada dalam radius sekolah.
                    </p>
                  </div>

                  <MapPin size={22} className="text-indigo-600" />
                </div>

                <div className="h-[360px] w-full">
                  {schoolPosition ? (
                    <MapContainer
                      center={schoolPosition}
                      zoom={17}
                      scrollWheelZoom
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <MapAutoCenter
                        schoolPosition={schoolPosition}
                        userPosition={userPosition}
                      />

                      <Marker position={schoolPosition} icon={schoolIcon}>
                        <Popup>{school?.name}</Popup>
                      </Marker>

                      <Circle
                        center={schoolPosition}
                        radius={school?.radius || 100}
                        pathOptions={{
                          color: "#4f46e5",
                          fillColor: "#6366f1",
                          fillOpacity: 0.12,
                        }}
                      />

                      {userPosition && (
                        <Marker position={userPosition} icon={userIcon}>
                          <Popup>Lokasi Anda</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                      Setting sekolah belum tersedia.
                    </div>
                  )}
                </div>
              </div>

              {locationError && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
                  {locationError}
                </div>
              )}
            </div>

            <div className="safe-bottom border-t border-slate-200 bg-white p-5">
              <button
                onClick={() => getCurrentLocation(true)}
                disabled={loadingLocation}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-4 text-sm font-black text-slate-700 disabled:opacity-60"
              >
                {loadingLocation ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Mengambil Lokasi...
                  </>
                ) : (
                  <>
                    <LocateFixed size={18} />
                    Perbarui Lokasi
                  </>
                )}
              </button>

              <button
                onClick={
                  absenMode === "datang" ? handleAbsenDatang : handleAbsenPulang
                }
                disabled={
                  !dalamArea ||
                  !location ||
                  loadingDatang ||
                  loadingPulang ||
                  loadingLocation ||
                  (absenMode === "datang" && !bolehAbsenDatang) ||
                  (absenMode === "pulang" && !bolehAbsenPulang)
                }
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 text-sm font-black text-white shadow-premium disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
              >
                {loadingDatang || loadingPulang
                  ? "Menyimpan..."
                  : absenMode === "datang" && !bolehAbsenDatang
                    ? "Di Luar Jam Absen Datang"
                    : absenMode === "pulang" && !bolehAbsenPulang
                      ? "Di Luar Jam Absen Pulang"
                      : modalButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
