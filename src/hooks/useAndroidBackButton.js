import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useLocation, useNavigate } from "react-router-dom";

export default function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let handler = null;
    let isMounted = true;

    async function setupBackButton() {
      handler = await App.addListener("backButton", ({ canGoBack }) => {
        const path = location.pathname;

        if (
          path === "/" ||
          path === "/login" ||
          path === "/admin" ||
          path === "/admin/login"
        ) {
          App.exitApp();
          return;
        }

        if (canGoBack) {
          navigate(-1);
        } else {
          navigate("/", { replace: true });
        }
      });

      if (!isMounted && handler?.remove) {
        handler.remove();
      }
    }

    setupBackButton();

    return () => {
      isMounted = false;

      if (handler && typeof handler.remove === "function") {
        handler.remove();
      }
    };
  }, [navigate, location.pathname]);
}