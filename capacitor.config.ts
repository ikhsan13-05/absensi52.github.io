import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "id.sch.absensiguru.app",
  appName: "e-Absensi 52",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;