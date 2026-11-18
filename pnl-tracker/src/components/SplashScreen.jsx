export default function SplashScreen({ isFadingOut = false }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white select-none transition-all duration-500 ease-out ${
        isFadingOut
          ? 'opacity-0 scale-[1.03] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      aria-label="Loading TradeJournal"
    >
      {/* Ambient background glow matching emerald dark theme */}
      <div className="absolute h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl -translate-y-8 pointer-events-none animate-pulse" />
      <div className="absolute h-56 w-56 rounded-full bg-teal-500/10 blur-2xl translate-y-16 pointer-events-none" />

      <div className="relative flex flex-col items-center z-10 px-6 text-center">
        {/* App Logo with layered glass glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/25 blur-2xl animate-pulse" />
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 p-2.5 border border-emerald-500/30 shadow-2xl shadow-emerald-500/25 flex items-center justify-center transition-transform duration-700">
            {/* Custom Trading Calendar SVG Logo */}
            <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="splashGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <rect width="512" height="512" rx="112" fill="#0f172a" />
              <path d="M128 160h256v64H128z" fill="url(#splashGreenGrad)" />
              <rect x="160" y="112" width="24" height="64" rx="12" fill="#e2e8f0" />
              <rect x="328" y="112" width="24" height="64" rx="12" fill="#e2e8f0" />
              <path
                d="M128 224h256v160c0 17.67-14.33 32-32 32H160c-17.67 0-32-14.33-32-32V224z"
                fill="#1e293b"
              />
              <path
                d="M176 352l48-64 48 32 80-96"
                fill="none"
                stroke="#10b981"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M312 224h40v40"
                fill="none"
                stroke="#10b981"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="212" y="272" width="12" height="40" fill="#10b981" />
              <rect x="216" y="256" width="4" height="72" fill="#10b981" />
              <rect x="272" y="288" width="12" height="40" fill="#ef4444" />
              <rect x="276" y="272" width="4" height="72" fill="#ef4444" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          Trade<span className="text-emerald-400">Journal</span>
        </h1>

        {/* Slogan */}
        <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-wide max-w-xs mb-8 leading-relaxed">
          Plan your trade, trade your plan.
        </p>

        {/* Smooth Loading Indicator */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
            <span className="text-[11px] font-mono text-slate-400 tracking-wider uppercase">
              Loading Session...
            </span>
          </div>

          {/* Glowing subtle progress track */}
          <div className="relative w-36 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Footer watermark */}
      <footer className="absolute bottom-6 text-[10px] text-slate-600 font-medium tracking-wider uppercase">
        Real-time Cloud Sync &middot; Encrypted
      </footer>
    </div>
  )
}
