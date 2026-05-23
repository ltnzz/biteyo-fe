export default function BiteLoader({
  label = "Sedang memuat bites...",
  sublabel = "Sebentar ya, rasa-rasa terbaik lagi disiapkan.",
  className = "",
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 text-center ${
        compact ? "py-12" : "py-20"
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full bg-pink-100 animate-ping" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-pink-100 bg-white shadow-[0_14px_35px_rgba(236,72,153,0.18)]">
          <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-orange-200 via-pink-300 to-rose-400 shadow-inner">
            <span className="absolute right-0 top-0 h-4 w-4 rounded-bl-full rounded-tr-full bg-white" />
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="absolute h-1.5 w-1.5 rounded-full bg-white/90 animate-bite-dot"
                style={{
                  left: `${11 + dot * 9}px`,
                  top: `${18 + (dot % 2) * 7}px`,
                  animationDelay: `${dot * 140}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-5 text-sm font-extrabold text-gray-900">{label}</p>
      {sublabel && (
        <p className="mt-1 max-w-xs text-xs font-medium leading-relaxed text-gray-500">
          {sublabel}
        </p>
      )}
    </div>
  );
}
