import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  MapPinCheck,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { loginGuru } from "../api/api";
import {
  getDeviceId,
  getDeviceInfo,
  getGuru,
  saveGuru,
} from "../utils/storage";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nip: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const guru = getGuru();

    if (guru) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nip.trim()) {
      toast.error("NIP wajib diisi.");
      return;
    }

    if (!form.password.trim()) {
      toast.error("Password wajib diisi.");
      return;
    }

    setLoading(true);

    const result = await loginGuru({
      nip: form.nip,
      password: form.password,
      deviceId: getDeviceId(),
      deviceInfo: getDeviceInfo(),
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Login gagal.");
      return;
    }

    saveGuru(result.data);
    toast.success("Login berhasil.");
    navigate("/", { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-x-0 top-0 h-[48vh] rounded-b-[3rem] bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500" />
      <div className="absolute -top-20 right-[-70px] h-64 w-64 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute top-36 left-[-90px] h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8">
        <div className="pt-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xl">
              <MapPinCheck size={30} />
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/login")}
              className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-xs font-black text-white backdrop-blur-xl active:scale-95"
            >
              <ShieldCheck size={17} />
              Admin
            </button>
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight">
            Mobile Absen
          </h1>

          <p className="mt-2 text-sm font-semibold leading-relaxed text-white/80">
            Absensi guru/karyawan berbasis GPS, device binding, dan target kerja
            harian.
          </p>
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <div className="mb-4 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700">
              Login Guru / Karyawan
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              Selamat Datang
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Masuk menggunakan NIP dan password terdaftar.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  NIP
                </label>

                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
                  <UserRound size={20} className="text-slate-400" />

                  <input
                    type="text"
                    name="nip"
                    value={form.nip}
                    onChange={handleChange}
                    placeholder="Masukkan NIP"
                    className="w-full bg-transparent px-3 py-4 text-sm font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Password
                </label>

                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
                  <LockKeyhole size={20} className="text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    className="w-full bg-transparent px-3 py-4 text-sm font-bold text-slate-800 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 text-sm font-black text-white shadow-premium transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Memeriksa akun..." : "Login Sekarang"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-slate-400">
          © {new Date().getFullYear()} e-Absensi SMPN 52
        </p>
      </div>
    </div>
  );
}
