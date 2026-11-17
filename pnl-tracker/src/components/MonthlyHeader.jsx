import { format } from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  LogOut,
} from 'lucide-react'
import { formatPnL, getPnLTextColor } from '../utils/formatters'

export default function MonthlyHeader({
  currentMonth,
  onPrev,
  onNext,
  onToday,
  stats,
  user,
  onLogout,
}) {
  const { totalPnl, tradingDays, totalTrades, winRate } = stats
  const isLoss = totalPnl < 0
  const isProfit = totalPnl > 0

  return (
    <header className="border-b border-gray-800/60 bg-[#0e1219]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="mx-auto max-w-[1440px] px-3 py-3 sm:px-6 sm:py-4 lg:px-8 space-y-3 sm:space-y-4">
        {/* Row 1: Brand, Month Navigation & User Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400 border border-emerald-500/20">
              <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white">
              Trade<span className="text-emerald-400">Journal</span>
            </span>
          </div>

          {/* Controls: Month Nav, Today & User Avatar/Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
            {/* Month Navigator */}
            <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg border border-gray-800 bg-[#0a0d13] p-0.5 sm:p-1">
              <button
                onClick={onPrev}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer active:scale-95"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[110px] sm:min-w-[150px] text-center text-xs sm:text-sm font-semibold text-gray-100 select-none">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={onNext}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer active:scale-95"
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Today Button */}
            <button
              onClick={onToday}
              className="rounded-lg border border-gray-700 bg-transparent px-2.5 py-1.5 text-xs font-semibold text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-pointer active:scale-95"
            >
              Today
            </button>

            {/* User Profile & Logout */}
            {user && (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-gray-800">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-full border border-emerald-500/30 object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                <span
                  className="hidden md:inline text-xs font-medium text-gray-300 max-w-[110px] truncate"
                  title={user.email || user.name}
                >
                  {user.name}
                </span>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 rounded-lg border border-gray-700/80 bg-[#0a0d13] px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-gray-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer active:scale-95"
                  title="Sign out of your account"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Top Stat Cards (Responsive 2x2 Grid on Mobile, Flex on Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Monthly Net PnL Card */}
          <div
            className={`flex items-center gap-2 rounded-xl border p-2.5 sm:px-3.5 sm:py-2 transition-colors ${
              isLoss
                ? 'border-red-500/30 bg-red-500/[0.08]'
                : isProfit
                ? 'border-emerald-500/30 bg-emerald-500/[0.08]'
                : 'border-gray-800/80 bg-[#0a0d13]'
            }`}
          >
            <div className="rounded-lg p-1.5 shrink-0">
              {isLoss ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 truncate">
                Monthly PnL
              </p>
              <p
                className={`text-sm sm:text-base font-bold font-mono tracking-tight truncate ${getPnLTextColor(
                  totalPnl
                )}`}
              >
                {formatPnL(totalPnl)}
              </p>
            </div>
          </div>

          {/* Win Rate Card */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-800/80 bg-[#0a0d13] p-2.5 sm:px-3.5 sm:py-2">
            <div className="rounded-lg p-1.5 shrink-0 text-amber-400">
              <Target className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 truncate">
                Win Rate
              </p>
              <p className="text-sm sm:text-base font-bold tracking-tight text-amber-400 truncate">
                {winRate}%
              </p>
            </div>
          </div>

          {/* Trades Count Card */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-800/80 bg-[#0a0d13] p-2.5 sm:px-3.5 sm:py-2">
            <div className="rounded-lg p-1.5 shrink-0 text-blue-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 truncate">
                Trades
              </p>
              <p className="text-sm sm:text-base font-bold tracking-tight text-gray-100 truncate">
                {totalTrades}
              </p>
            </div>
          </div>

          {/* Active Days Card */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-800/80 bg-[#0a0d13] p-2.5 sm:px-3.5 sm:py-2">
            <div className="rounded-lg p-1.5 shrink-0 text-violet-400">
              <Activity className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 truncate">
                Active Days
              </p>
              <p className="text-sm sm:text-base font-bold tracking-tight text-gray-100 truncate">
                {tradingDays} day{tradingDays !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
