export default function AdminSectionCard({
  title,
  description,
  icon,
  children,
  right,
  className = "",
}) {
  const Icon = icon;

  return (
    <div
      className={`rounded-[2rem] bg-white p-5 shadow-soft lg:p-6 ${className}`}
    >
      {(title || description || Icon || right) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Icon size={24} />
              </div>
            )}

            <div>
              {title && (
                <h2 className="text-lg font-black text-slate-900">{title}</h2>
              )}

              {description && (
                <p className="text-sm text-slate-500">{description}</p>
              )}
            </div>
          </div>

          {right}
        </div>
      )}

      {children}
    </div>
  );
}
