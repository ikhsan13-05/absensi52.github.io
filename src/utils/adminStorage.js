const ADMIN_KEY = "ABSENSI_ADMIN_LOGIN";

export function saveAdmin(admin) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function getAdmin() {
  try {
    const data = localStorage.getItem(ADMIN_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function removeAdmin() {
  localStorage.removeItem(ADMIN_KEY);
}

export function isAdminLoggedIn() {
  return !!getAdmin();
}