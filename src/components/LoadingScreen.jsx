import logo from "../assets/logo52.png";

export default function LoadingScreen({ text = "Memuat data..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 px-6 backdrop-blur-md">
      <div className="rounded-[2rem] border border-white/60 bg-white/70 px-8 py-7 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-white p-3 shadow-xl">
          <img
            src={logo}
            alt="Logo"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="mt-5 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>

        <p className="mt-4 text-sm font-black text-slate-700">
          {text}
        </p>
      </div>
    </div>
  );
}