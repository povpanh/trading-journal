import { Calendar, ChevronRight } from 'lucide-react'
import { formatPnL, getPnLTextColor } from '../utils/formatters'

export default function WeeklySummary({
  weeksList = [],
  onSelectWeek,
  monthlyPnl = 0,
  monthlyTradingDays = 0,
}) {
  return (
    <div className="rounded-xl border border-gray-800/60 bg-[#0e1219] p-3.5 sm:p-4.5 h-fit shadow-lg w-full">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-200">
          <Calendar className="h-4 w-4 text-emerald-400" />
          Weekly Summary
        </h3>
        <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Tap week to inspect</span>
      </div>

      {/* Week items list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
        {weeksList.map((weekItem) => {
          const { weekNum, stat, dateRangeLabel } = weekItem
          const hasTrades = stat && stat.trades > 0
          const isLoss = hasTrades && stat.pnl < 0
          const isProfit = hasTrades && stat.pnl > 0

          return (
            <button
              key={weekNum}
              type="button"
              onClick={() => onSelectWeek(weekItem)}
              className={`
                group w-full flex items-center justify-between rounded-xl border p-3 sm:p-3.5 text-left transition-all cursor-pointer select-none active:scale-[0.98]
                ${
                  hasTrades
                    ? isLoss
                      ? 'border-red-500/25 bg-red-500/[0.04] hover:bg-red-500/[0.08] active:bg-red-500/[0.12] border-red-500/40 shadow-sm'
                      : 'border-emerald-500/25 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] active:bg-emerald-500/[0.12] border-emerald-500/40 shadow-sm'
                    : 'border-gray-800/60 bg-[#0a0d13]/60 hover:border-gray-700 active:bg-gray-800/40'
                }
              `}
              title={`View details for Week ${weekNum}`}
            >
              {/* Left: Week & PnL */}
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-200">
                    Week {weekNum}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate">
                    {dateRangeLabel}
                  </span>
                </div>

                <div className="mt-1">
                  {hasTrades ? (
                    <p
                      className={`text-sm sm:text-base font-bold font-mono tracking-tight truncate ${getPnLTextColor(
                        stat.pnl
                      )}`}
                    >
                      {formatPnL(stat.pnl)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 font-medium italic">
                      No trades
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Badges & Chevron */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-end gap-1">
                  {hasTrades ? (
                    <>
                      <span className="rounded-full bg-gray-800/90 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-gray-300 border border-gray-700/60">
                        {stat.days}d active
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium">
                        {stat.trades} trade{stat.trades !== 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <span className="rounded-full bg-gray-800/40 px-2 py-0.5 text-[9px] sm:text-[10px] text-gray-500">
                      Empty
                    </span>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-gray-600 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-300" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Month Totals Footer */}
      <div className="mt-3.5 border-t border-gray-800/60 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Monthly Total
            </span>
            <p className="text-[10px] text-gray-500">
              {monthlyTradingDays} active trading day{monthlyTradingDays !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="text-right">
            <p
              className={`text-sm sm:text-base font-bold font-mono tracking-tight ${getPnLTextColor(
                monthlyPnl
              )}`}
            >
              {formatPnL(monthlyPnl)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
