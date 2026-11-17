import { useState, useEffect, useMemo, useCallback } from 'react'
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google'
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
import { db } from './firebase'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'
import CalendarGrid from './components/CalendarGrid'
import WeeklySummary from './components/WeeklySummary'
import TradeModal from './components/TradeModal'
import WeeklyModal from './components/WeeklyModal'
import MonthlyHeader from './components/MonthlyHeader'
import LoginScreen from './components/LoginScreen'

// Google OAuth Client ID
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '184032797083-uucbkrab0lad52mlmp6gk0calca2lvcc.apps.googleusercontent.com'

const USER_STORAGE_KEY = 'tradejournal-user'

function loadUser() {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export default function App() {
  // ── Auth State Management ──────────────────────────────────────
  const [user, setUser] = useState(loadUser)

  // ── Trading Journal States (Synced with Firestore) ─────────────
  const [trades, setTrades] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [modalDate, setModalDate] = useState(null)
  const [selectedWeekNum, setSelectedWeekNum] = useState(null)
  const [editTrade, setEditTrade] = useState(null)

  // ── Sync Trades with Firebase Firestore ────────────────────────
  useEffect(() => {
    // Only fetch trades AFTER Google Login succeeds and user.email is available
    if (!user || !user.email) {
      setTrades([])
      return
    }

    const tradesCollectionRef = collection(db, 'users', user.email, 'trades')

    // One-time legacy LocalStorage migration to Firestore if exists
    try {
      const legacyTradesRaw = localStorage.getItem('calendar-journal-trades')
      if (legacyTradesRaw) {
        const legacyTrades = JSON.parse(legacyTradesRaw)
        if (Array.isArray(legacyTrades) && legacyTrades.length > 0) {
          legacyTrades.forEach((legacyTrade) => {
            const id = legacyTrade.id || crypto.randomUUID()
            setDoc(
              doc(db, 'users', user.email, 'trades', id),
              { ...legacyTrade, id },
              { merge: true }
            ).catch(() => {})
          })
        }
        localStorage.removeItem('calendar-journal-trades')
      }
    } catch (err) {
      console.warn('Legacy migration notice:', err)
    }

    // Subscribe to real-time changes in Firestore
    const unsubscribe = onSnapshot(
      tradesCollectionRef,
      (snapshot) => {
        const remoteTrades = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        setTrades(remoteTrades)
      },
      (error) => {
        console.error('Firestore onSnapshot error:', error)
      }
    )

    return () => unsubscribe()
  }, [user?.email])

  // ── Auth Handlers ──────────────────────────────────────────────
  const handleLoginSuccess = useCallback((profile) => {
    setUser(profile)
  }, [])

  const handleLogout = useCallback(() => {
    try {
      googleLogout()
    } catch (e) {
      // ignore
    }
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
    setTrades([]) // Clear trades state so data doesn't bleed over
  }, [])

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

  // ── Trade CRUD Operations via Firebase Firestore ──────────────
  const handleSaveTrade = useCallback(
    async (trade) => {
      if (!user || !user.email) return

      const tradeId = trade.id || crypto.randomUUID()
      const tradeData = {
        ...trade,
        id: tradeId,
        updatedAt: new Date().toISOString(),
      }

      // Optimistic UI update for immediate feedback
      setTrades((prev) => {
        const exists = prev.some((t) => t.id === tradeId)
        if (exists) {
          return prev.map((t) => (t.id === tradeId ? tradeData : t))
        }
        return [...prev, tradeData]
      })
      setEditTrade(null)

      try {
        const tradeDocRef = doc(db, 'users', user.email, 'trades', tradeId)
        await setDoc(tradeDocRef, tradeData, { merge: true })
      } catch (error) {
        console.error('Error saving trade to Firestore:', error)
      }
    },
    [user?.email]
  )

  const handleDeleteTrade = useCallback(
    async (id) => {
      if (!user || !user.email || !id) return

      // Optimistic UI update
      setTrades((prev) => prev.filter((t) => t.id !== id))
      if (editTrade && editTrade.id === id) {
        setEditTrade(null)
      }

      try {
        const tradeDocRef = doc(db, 'users', user.email, 'trades', id)
        await deleteDoc(tradeDocRef)
      } catch (error) {
        console.error('Error deleting trade from Firestore:', error)
      }
    },
    [user?.email, editTrade]
  )

  // ── Trades for the active Day Details Modal ───────────────────
  const tradesForModalDate = useMemo(() => {
    if (!modalDate) return []
    return trades
      .filter((t) => isSameDay(new Date(t.date + 'T00:00:00'), modalDate))
      .sort((a, b) => b.pnl - a.pnl)
  }, [trades, modalDate])

  // ── Render Login Screen if user is not authenticated ──────────
  if (!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          isConfigured={true}
        />
      </GoogleOAuthProvider>
    )
  }

  // ── Render Protected Dashboard when logged in ──────────────────
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-[#0a0d13] text-gray-100 flex flex-col font-sans selection:bg-emerald-500/30">
        {/* ── Top Header with Monthly Stats & User Profile ─────── */}
        <MonthlyHeader
          currentMonth={currentMonth}
          onPrev={goPrev}
          onNext={goNext}
          onToday={goToday}
          stats={monthlyStats}
          user={user}
          onLogout={handleLogout}
        />

        {/* ── Main App Container: Responsive Grid ───────────────── */}
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
          TradeJournal &middot; Authenticated as {user.email || user.name} &middot; Synced with Firebase Cloud Firestore
        </footer>
      </div>
    </GoogleOAuthProvider>
  )
}
