import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";

import Dashboard from "./pages/Dashboard";
import MobileAbsen from "./pages/MobileAbsen";
import RiwayatAbsen from "./pages/RiwayatAbsen";

import AdminDashboard from "./pages/AdminDashboard";
import MonitoringRealtime from "./pages/MonitoringRealtime";
import RekapAbsensi from "./pages/RekapAbsensi";
import SettingLibur from "./pages/SettingLibur";
import KelolaGuru from "./pages/KelolaGuru";

import MobileLayout from "./layouts/MobileLayout";
import AdminLayout from "./layouts/AdminLayout";

import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* WAJIB DI ATAS /admin */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/"
        element={
          <AuthGuard>
            <MobileLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="absensi" element={<MobileAbsen />} />
        <Route path="riwayat" element={<RiwayatAbsen />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="monitoring" element={<MonitoringRealtime />} />
        <Route path="rekap" element={<RekapAbsensi />} />
        <Route path="libur" element={<SettingLibur />} />
        <Route path="guru" element={<KelolaGuru />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
