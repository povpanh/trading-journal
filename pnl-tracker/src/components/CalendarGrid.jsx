import { format, isSameMonth, isToday } from 'date-fns'
import { formatPnL, getPnLTextColor } from '../utils/formatters'

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarGrid({
  days,
  currentMonth,
  dayStats,
  onDayClick,
}) {
  return (
    <div className="rounded-xl border border-gray-800/60 bg-[#0e1219] overflow-hidden shadow-lg w-full">
      {/* 7-Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-800/60 bg-[#0a0d13]/80">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 select-none"
          >
            <span className="sm:hidden">{d.slice(0, 1)}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      {/* Calendar 7-Column Cells Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-800/40">
        {days.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)
          const stat = dayStats[dateKey]

          // Responsive PnL background styling
          let cellStyle = 'bg-transparent border-gray-800/30'
          if (stat && inMonth && stat.count > 0) {
            if (stat.pnl > 0) {
              cellStyle =
                'bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12] active:bg-emerald-500/[0.16] border-emerald-500/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.06)]'
            } else if (stat.pnl < 0) {
              cellStyle =
                'bg-red-500/[0.08] hover:bg-red-500/[0.12] active:bg-red-500/[0.16] border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.06)]'
            } else {
              cellStyle = 'bg-gray-800/30 hover:bg-gray-800/50 border-gray-700/40'
            }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onDayClick(day)}
              className={`
                group relative flex min-h-[72px] sm:min-h-[95px] md:min-h-[112px] flex-col p-1 sm:p-2 md:p-2.5 text-left transition-all cursor-pointer select-none
                ${cellStyle}
                ${inMonth ? 'hover:brightness-110 active:scale-[0.98]' : 'opacity-20 hover:opacity-40'}
              `}
              title={inMonth ? `Tap to view trades for ${format(day, 'MMM d, yyyy')}` : ''}
            >
              {/* Top row: Date Number + Active Pip */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`
                    inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-transform
                    ${
                      today
                        ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-400/40'
                        : inMonth
                        ? 'text-gray-300'
                        : 'text-gray-600'
                    }
                  `}
                >
                  {format(day, 'd')}
                </span>

                {stat && inMonth && stat.count > 0 && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      stat.pnl > 0 ? 'bg-emerald-400' : stat.pnl < 0 ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                  />
                )}
              </div>

              {/* Trade metrics inside cell (scaled for mobile to prevent overlapping) */}
              {stat && inMonth && stat.count > 0 && (
                <div className="mt-auto flex flex-col gap-0.5 pt-1 w-full overflow-hidden">
                  {/* Daily Net PnL */}
                  <span
                    className={`text-[11px] sm:text-sm md:text-base font-bold font-mono leading-none tracking-tight truncate ${getPnLTextColor(
                      stat.pnl
                    )}`}
                  >
                    {formatPnL(stat.pnl, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>

                  {/* Mobile Trade Count & Win Rate */}
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400 font-medium truncate">
                    <span className="truncate">
                      {stat.count}
                      <span className="sm:hidden">t</span>
                      <span className="hidden sm:inline"> trade{stat.count !== 1 ? 's' : ''}</span>
                    </span>
                    <span className="text-gray-600 hidden sm:inline">•</span>
                    <span
                      className={`hidden sm:inline truncate ${
                        Number(stat.winRate) >= 50 ? 'text-emerald-400/90' : 'text-gray-400'
                      }`}
                    >
                      {stat.winRate}%
                    </span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
