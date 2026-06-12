import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import LoadingScreen from "./LoadingScreen";
import { getProfileGuru } from "../api/api";
import { getDeviceId, getGuru, removeGuru, saveGuru } from "../utils/storage";

export default function AuthGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const guru = getGuru();

      if (!guru?.idGuru) {
        setValid(false);
        setChecking(false);
        return;
      }

      const result = await getProfileGuru({
        idGuru: guru.idGuru,
        deviceId: getDeviceId(),
      });

      if (!result.success) {
        removeGuru();
        toast.error(result.message || "Session tidak valid. Silakan login ulang.");
        setValid(false);
        setChecking(false);
        return;
      }

      saveGuru(result.data);
      setValid(true);
      setChecking(false);
    }

    checkSession();
  }, []);

  if (checking) {
    return <LoadingScreen text="Memeriksa ID Perangkat..." />;
  }

  if (!valid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}