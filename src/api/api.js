const BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

export async function request(action, payload = {}) {
  try {
    if (!BASE_URL) {
      return {
        success: false,
        message: "VITE_APPS_SCRIPT_URL belum diisi di file .env",
        data: null,
      };
    }

    const url = `${BASE_URL}?action=${action}`;

    const response = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("Response bukan JSON:", text);
      return {
        success: false,
        message: "Response server bukan JSON. Cek deployment Apps Script.",
        data: null,
      };
    }
  } catch (error) {
    console.error("API ERROR:", error);

    return {
      success: false,
      message:
        "Gagal terhubung ke server. Periksa URL Apps Script dan deployment.",
      data: null,
    };
  }
}

export function loginGuru(payload) {
  return request("loginGuru", payload);
}

export function getProfileGuru(payload) {
  return request("getProfileGuru", payload);
}

export function loginAdmin(payload) {
  return request("loginAdmin", payload);
}

export function getProfileAdmin(payload) {
  return request("getProfileAdmin", payload);
}

export function getSetting() {
  return request("getSetting");
}

export function getTodayAbsen(payload) {
  return request("getTodayAbsen", payload);
}

export function getRiwayatAbsen(payload) {
  return request("getRiwayatAbsen", payload);
}

export function absenDatang(payload) {
  return request("absenDatang", payload);
}

export function absenPulang(payload) {
  return request("absenPulang", payload);
}

export function getDashboardAdmin() {
  return request("getDashboardAdmin");
}

export function getRekapAbsensi(payload) {
  return request("getRekapAbsensi", payload);
}

export function getLibur(payload = {}) {
  return request("getLibur", payload);
}

export function saveLibur(payload) {
  return request("saveLibur", payload);
}

export function deleteLibur(payload) {
  return request("deleteLibur", payload);
}

export function getGuruList() {
  return request("getGuruList");
}

export function resetDeviceGuru(payload) {
  return request("resetDeviceGuru", payload);
}

export function getMonitoringHarian() {
  return request("getMonitoringHarian");
}

export function getMobileRealtime(payload) {
  return request("getMobileRealtime", payload);
}
