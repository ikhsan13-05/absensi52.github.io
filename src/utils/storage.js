const GURU_KEY = "ABSENSI_GURU_LOGIN";
const DEVICE_KEY = "ABSENSI_DEVICE_ID";

export function saveGuru(guru) {
  localStorage.setItem(GURU_KEY, JSON.stringify(guru));
}

export function getGuru() {
  try {
    const data = localStorage.getItem(GURU_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function removeGuru() {
  localStorage.removeItem(GURU_KEY);
}

export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_KEY);

  if (!deviceId) {
    deviceId = `DEVICE-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    localStorage.setItem(DEVICE_KEY, deviceId);
  }

  return deviceId;
}

export function getDeviceInfo() {
  return [
    navigator.platform || "Unknown Platform",
    navigator.userAgent || "Unknown UserAgent",
  ].join(" | ");
}