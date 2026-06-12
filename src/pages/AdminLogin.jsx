import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { loginAdmin } from "../api/api";
import { getAdmin, saveAdmin } from "../utils/adminStorage";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const admin = getAdmin();

    if (admin) {
      navigate("/admin", { replace: true });
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

    if (!form.username.trim()) {
      toast.error("Username wajib diisi.");
      return;
    }

    if (!form.password.trim()) {
      toast.error("Password wajib diisi.");
      return;
    }

    setLoading(true);

    const result = await loginAdmin({
      username: form.username,
      password: form.password,
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Login admin gagal.");
      return;
    }

    saveAdmin(result.data);
    toast.success("Login admin berhasil.");
    navigate("/admin", { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-8">
      <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/10 shadow-2xl backdrop-blur-xl">
            <ShieldCheck size={40} className="text-white" />
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-white">
            Admin Panel
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Login Administrator Absensi
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Masuk Admin</h2>
            <p className="mt-1 text-sm text-slate-500">
              Gunakan username dan password admin.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Username
              </label>

              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-500 focus-within:bg-white">
                <UserRound size={20} className="text-slate-400" />

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Masukkan username"
                  className="w-full bg-transparent px-3 py-4 text-sm font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Password
              </label>

              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-500 focus-within:bg-white">
                <LockKeyhole size={20} className="text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className="w-full bg-transparent px-3 py-4 text-sm font-semibold text-slate-800 outline-none"
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
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 text-sm font-black text-white shadow-premium transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Memeriksa akun..." : "Login Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
