export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl bg-white p-5 shadow-soft">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-4 h-8 w-24 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-40 rounded bg-slate-100" />
    </div>
  );
}