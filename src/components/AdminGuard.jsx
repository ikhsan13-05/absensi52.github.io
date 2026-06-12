import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import LoadingScreen from "./LoadingScreen";
import { getProfileAdmin } from "../api/api";
import { getAdmin, removeAdmin, saveAdmin } from "../utils/adminStorage";

export default function AdminGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const admin = getAdmin();

      if (!admin?.idAdmin) {
        setValid(false);
        setChecking(false);
        return;
      }

      const result = await getProfileAdmin({
        idAdmin: admin.idAdmin,
      });

      if (!result.success) {
        removeAdmin();
        toast.error(result.message || "Session admin tidak valid.");
        setValid(false);
        setChecking(false);
        return;
      }

      saveAdmin(result.data);
      setValid(true);
      setChecking(false);
    }

    checkAdmin();
  }, []);

  if (checking) {
    return <LoadingScreen text="Memeriksa Akses Admin..." />;
  }

  if (!valid) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}