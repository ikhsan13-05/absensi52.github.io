import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import useAndroidBackButton from "../hooks/useAndroidBackButton";

export default function MobileLayout() {
  useAndroidBackButton();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto min-h-screen max-w-md pb-24">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
