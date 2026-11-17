import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isSameWeek,
} from 'date-fns'
import CalendarGrid from './components/CalendarGrid'
import WeeklySummary from './components/WeeklySummary'
import TradeModal from './components/TradeModal'
import WeeklyModal from './components/WeeklyModal'
import MonthlyHeader from './components/MonthlyHeader'

const STORAGE_KEY = 'calendar-journal-trades'

function loadTrades() {
  try {
    const d = localStorage.getItem(STORAGE_KEY)
    return d ? JSON.parse(d) : []
  } catch {
    return []
  }
}

export default function App() {
  const [trades, setTrades] = useState(loadTrades)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [modalDate, setModalDate] = useState(null)
  const [selectedWeekNum, setSelectedWeekNum] = useState(null)
  const [editTrade, setEditTrade] = useState(null)

  // Persist trades to LocalStorage whenever trades state updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades))
  }, [trades])

  // ── Month Navigation ───────────────────────────────────────────
  const goNext = () => setCurrentMonth((m) => addMonths(m, 1))
  const goPrev = () => setCurrentMonth((m) => subMonths(m, 1))
  const goToday = () => setCurrentMonth(new Date())

  // ── 7-Column Calendar Grid Days (Sun to Sat covering the month) ──
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [currentMonth])

  // ── Trades belonging to the active month ────────────────────────
  const monthTrades = useMemo(() => {
    return trades.filter((t) => {
      const d = new Date(t.date + 'T00:00:00')
      return isSameMonth(d, currentMonth)
    })
  }, [trades, currentMonth])

  // ── Per-day Aggregated Stats for the Calendar Grid ──────────────
  const dayStats = useMemo(() => {
    const map = {}
    monthTrades.forEach((t) => {
      const key = t.date
      if (!map[key]) {
        map[key] = { pnl: 0, count: 0, wins: 0 }
      }
      map[key].pnl += t.pnl
      map[key].count += 1
      if (t.status === 'Win') {
        map[key].wins += 1
      }
    })

    Object.values(map).forEach((s) => {
      s.winRate = s.count > 0 ? ((s.wins / s.count) * 100).toFixed(1) : '0.0'
    })
    return map
  }, [monthTrades])

  // ── Monthly Summary Stats (Header & Footer) ─────────────────────
  const monthlyStats = useMemo(() => {
    const totalPnl = monthTrades.reduce((s, t) => s + t.pnl, 0)
    const tradingDays = new Set(monthTrades.map((t) => t.date)).size
    const totalTrades = monthTrades.length
    const wins = monthTrades.filter((t) => t.status === 'Win').length
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0'
    return { totalPnl, tradingDays, totalTrades, winRate }
  }, [monthTrades])

  // ── Weeks List (Week 1 through Week 5/6) for Weekly Summary ──────
  const weeksList = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const weekIntervalStarts = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 0 }
    )

    return weekIntervalStarts.map((weekStartPoint, idx) => {
      const weekNum = idx + 1
      const startDate = startOfWeek(weekStartPoint, { weekStartsOn: 0 })
      const endDate = endOfWeek(weekStartPoint, { weekStartsOn: 0 })

      // Find trades that fall inside this week
      const weeklyTrades = trades.filter((t) => {
        const d = new Date(t.date + 'T00:00:00')
        return isSameWeek(d, startDate, { weekStartsOn: 0 })
      }).sort((a, b) => new Date(b.date) - new Date(a.date))

      const pnl = weeklyTrades.reduce((s, t) => s + t.pnl, 0)
      const daysCount = new Set(weeklyTrades.map((t) => t.date)).size
      const tradeCount = weeklyTrades.length
      const winsCount = weeklyTrades.filter((t) => t.status === 'Win').length
      const winRate = tradeCount > 0 ? ((winsCount / tradeCount) * 100).toFixed(1) : '0.0'

      const dateRangeLabel = `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`

      return {
        weekNum,
        startDate,
        endDate,
        dateRangeLabel,
        trades: weeklyTrades,
        stat: {
          pnl,
          days: daysCount,
          trades: tradeCount,
          winRate,
        },
      }
    })
  }, [trades, currentMonth])

  // Currently selected week data for WeeklyModal
  const selectedWeekInfo = useMemo(() => {
    if (selectedWeekNum === null) return null
    return weeksList.find((w) => w.weekNum === selectedWeekNum) || null
  }, [weeksList, selectedWeekNum])

  // ── Trade CRUD Operations ──────────────────────────────────────
  const handleSaveTrade = useCallback((trade) => {
    if (trade.id) {
      setTrades((prev) => prev.map((t) => (t.id === trade.id ? trade : t)))
      setEditTrade(null)
    } else {
      setTrades((prev) => [...prev, { ...trade, id: crypto.randomUUID() }])
    }
  }, [])

  const handleDeleteTrade = useCallback((id) => {
    setTrades((prev) => prev.filter((t) => t.id !== id))
    if (editTrade && editTrade.id === id) {
      setEditTrade(null)
    }
  }, [editTrade])

  // ── Trades for the active Day Details Modal ───────────────────
  const tradesForModalDate = useMemo(() => {
    if (!modalDate) return []
    return trades
      .filter((t) => isSameDay(new Date(t.date + 'T00:00:00'), modalDate))
      .sort((a, b) => b.pnl - a.pnl)
  }, [trades, modalDate])

  return (
    <div className="min-h-screen bg-[#0a0d13] text-gray-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* ── Top Header with Monthly Stats ─────────────────────── */}
      <MonthlyHeader
        currentMonth={currentMonth}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        stats={monthlyStats}
      />

      {/* ── Main App Container: Responsive Grid ───────────────── */}
      {/* On desktop (md: and above): side-by-side (Calendar left, Weekly right) */}
      {/* On mobile (<md:): stacked vertically (Header -> Calendar -> Weekly) */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-2.5 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_270px] lg:grid-cols-[1fr_310px] gap-3.5 sm:gap-5 items-start">
          {/* Main 7-Column Calendar Grid */}
          <section aria-label="Trading Calendar" className="w-full min-w-0">
            <CalendarGrid
              days={calendarDays}
              currentMonth={currentMonth}
              dayStats={dayStats}
              onDayClick={(date) => {
                setEditTrade(null)
                setModalDate(date)
              }}
            />
          </section>

          {/* Weekly Summary: Sidebar on Desktop, Bottom Section on Mobile */}
          <aside aria-label="Weekly Performance Summary" className="w-full min-w-0">
            <WeeklySummary
              weeksList={weeksList}
              onSelectWeek={(weekItem) => setSelectedWeekNum(weekItem.weekNum)}
              monthlyPnl={monthlyStats.totalPnl}
              monthlyTradingDays={monthlyStats.tradingDays}
            />
          </aside>
        </div>
      </main>

      {/* ── Day Details Modal (Trade Notes, Setups, Add/Edit) ──── */}
      {modalDate && (
        <TradeModal
          date={modalDate}
          trades={tradesForModalDate}
          editTrade={editTrade}
          onSave={handleSaveTrade}
          onDelete={handleDeleteTrade}
          onEdit={setEditTrade}
          onClose={() => {
            setModalDate(null)
            setEditTrade(null)
          }}
        />
      )}

      {/* ── Weekly Details Modal (Clicking ANY week in sidebar) ── */}
      {selectedWeekInfo && (
        <WeeklyModal
          weekInfo={selectedWeekInfo}
          onSaveTrade={handleSaveTrade}
          onDeleteTrade={handleDeleteTrade}
          onClose={() => setSelectedWeekNum(null)}
        />
      )}

      {/* ── App Footer ───────────────────────────────────────── */}
      <footer className="border-t border-gray-800/60 py-3 text-center text-[11px] sm:text-xs text-gray-500 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        TradeJournal &middot; Calendar PnL Journal &middot; iOS PWA Ready
      </footer>
    </div>
  )
}
