import { useState, useEffect } from 'react'
import { format, eachDayOfInterval } from 'date-fns'
import {
  X,
  Plus,
  Trash2,
  Pencil,
  Save,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Layers,
  CalendarX,
} from 'lucide-react'
import { formatPnL, getPnLTextColor } from '../utils/formatters'

const COMMON_PAIRS = [
  'XAUUSD',
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'GBPJPY',
  'AUDUSD',
  'USDCAD',
  'NZDUSD',
  'USDCHF',
  'EURJPY',
  'EURGBP',
  'BTCUSD',
  'ETHUSD',
  'US30',
  'NAS100',
]

export default function WeeklyModal({
  weekInfo,
  onSaveTrade,
  onDeleteTrade,
  onClose,
}) {
  const { weekNum, startDate, endDate, trades = [], stat = { pnl: 0, days: 0, trades: 0, winRate: '0.0' } } = weekInfo

  const dateRangeStr = `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`

  // Days in this week for date selection
  const daysInWeek = eachDayOfInterval({ start: startDate, end: endDate })

  // Form states
  const [showForm, setShowForm] = useState(trades.length === 0)
  const [editTrade, setEditTrade] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(startDate, 'yyyy-MM-dd'))
  const [asset, setAsset] = useState('')
  const [pnl, setPnl] = useState('')
  const [status, setStatus] = useState('Win')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (editTrade) {
      setSelectedDate(editTrade.date)
      setAsset(editTrade.asset)
      setPnl(String(editTrade.pnl))
      setStatus(editTrade.status || (editTrade.pnl >= 0 ? 'Win' : 'Loss'))
      setNotes(editTrade.notes || '')
      setShowForm(true)
    }
  }, [editTrade])

  const resetForm = () => {
    setEditTrade(null)
    setAsset('')
    setPnl('')
    setStatus('Win')
    setNotes('')
    setShowForm(false)
  }

  const handlePnlChange = (val) => {
    setPnl(val)
    const num = parseFloat(val)
    if (!isNaN(num)) {
      if (num < 0) {
        setStatus('Loss')
      }
    }
  }

  const handleStatusToggle = (newStatus) => {
    setStatus(newStatus)
    const num = parseFloat(pnl)
    if (!isNaN(num) && num !== 0) {
      if (newStatus === 'Loss' && num > 0) {
        setPnl(String(-num))
      } else if (newStatus === 'Win' && num < 0) {
        setPnl(String(Math.abs(num)))
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!asset.trim() || pnl === '' || !selectedDate) return

    let parsedPnl = parseFloat(pnl)
    if (isNaN(parsedPnl)) return

    if (status === 'Loss' && parsedPnl > 0) {
      parsedPnl = -parsedPnl
    } else if (status === 'Win' && parsedPnl < 0) {
      parsedPnl = Math.abs(parsedPnl)
    }

    const trade = {
      ...(editTrade ? { id: editTrade.id } : {}),
      date: selectedDate,
      asset: asset.trim().toUpperCase(),
      pnl: parsedPnl,
      status,
      notes: notes.trim(),
    }

    onSaveTrade(trade)
    resetForm()
  }

  const inputBase =
    'w-full rounded-xl border border-gray-700 bg-[#0a0d13] px-3.5 py-3 text-base sm:text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
      {/* Dark blur backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-[92%] sm:w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-gray-800 bg-[#0e1219] shadow-2xl shadow-black/80 animate-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800/80 px-4 py-3.5 sm:px-6 sm:py-4 bg-[#0a0d13]/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="rounded-lg bg-emerald-500/10 p-1.5 sm:p-2 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-100 truncate">
                  Week {weekNum} Summary
                </h2>
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] sm:text-xs text-gray-400 truncate">
                  {dateRangeStr}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] sm:text-xs text-gray-400 truncate">
                Weekly trading performance breakdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-800/70 bg-[#0a0d13]/50 p-2.5 sm:p-4 gap-2 sm:gap-3 shrink-0">
          <div className="rounded-xl border border-gray-800/80 bg-[#0e1219] p-2.5 sm:p-3">
            <p className="text-[10px] font-medium uppercase text-gray-500">Weekly PnL</p>
            <p className={`mt-0.5 text-sm sm:text-base font-bold font-mono truncate ${getPnLTextColor(stat.pnl)}`}>
              {formatPnL(stat.pnl)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800/80 bg-[#0e1219] p-2.5 sm:p-3">
            <p className="text-[10px] font-medium uppercase text-gray-500">Trades</p>
            <p className="mt-0.5 text-sm sm:text-base font-bold text-gray-200">
              {stat.trades}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800/80 bg-[#0e1219] p-2.5 sm:p-3">
            <p className="text-[10px] font-medium uppercase text-gray-500">Win Rate</p>
            <p className="mt-0.5 text-sm sm:text-base font-bold text-amber-400">
              {stat.winRate || '0.0'}%
            </p>
          </div>

          <div className="rounded-xl border border-gray-800/80 bg-[#0e1219] p-2.5 sm:p-3">
            <p className="text-[10px] font-medium uppercase text-gray-500">Active Days</p>
            <p className="mt-0.5 text-sm sm:text-base font-bold text-violet-400">
              {stat.days}d
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 sm:px-6 sm:py-4 space-y-3.5 sm:space-y-4">
          {/* Trades List */}
          {trades.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-gray-500" />
                  Trades This Week ({trades.length})
                </h3>
                {!showForm && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer py-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Trade
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {trades.map((t) => (
                  <div
                    key={t.id}
                    className={`rounded-xl border p-3 sm:p-4 transition-all shadow-sm ${
                      t.pnl < 0
                        ? 'border-red-500/25 bg-red-500/[0.04]'
                        : 'border-emerald-500/25 bg-emerald-500/[0.04]'
                    }`}
                  >
                    {/* Top Row: Date, Asset, PnL, Status, Actions */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Date badge */}
                        <span className="rounded bg-gray-800 px-2 py-0.5 text-[11px] text-gray-300 font-medium">
                          {format(new Date(t.date + 'T00:00:00'), 'EEE, MMM d')}
                        </span>

                        {/* Asset Badge */}
                        <span className="rounded-md bg-gray-800/90 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-gray-100 border border-gray-700/60 font-mono">
                          {t.asset}
                        </span>

                        {/* PnL Amount (Red "-$XX.XX" or Green "+$XX.XX") */}
                        <span
                          className={`text-sm sm:text-base font-bold font-mono tracking-tight ${getPnLTextColor(
                            t.pnl
                          )}`}
                        >
                          {formatPnL(t.pnl)}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold border ${
                            t.status === 'Win'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/15 text-red-500 border-red-500/30'
                          }`}
                        >
                          {t.status === 'Win' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {t.status}
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditTrade(t)}
                          className="rounded-lg p-2 sm:p-1.5 text-gray-400 hover:bg-blue-500/15 hover:text-blue-400 transition-colors cursor-pointer"
                          title="Edit Trade"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTrade(t.id)}
                          className="rounded-lg p-2 sm:p-1.5 text-gray-400 hover:bg-red-500/15 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Trade"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Trade Notes & Setup */}
                    <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-gray-800/80 bg-[#0a0d13]/80 p-2.5 text-xs leading-relaxed">
                      <FileText className="h-3.5 w-3.5 text-emerald-400/90 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-300">Note: </span>
                        <span className="text-gray-300 break-words">
                          {t.notes && t.notes.trim() ? (
                            t.notes
                          ) : (
                            <span className="text-gray-500 italic">No setup notes provided.</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-800/80 bg-[#0a0d13]/50 p-6 sm:p-8 text-center">
              <CalendarX className="mx-auto h-9 w-9 text-gray-600 mb-2" />
              <h4 className="text-sm sm:text-base font-semibold text-gray-200">
                No trades for this week
              </h4>
              <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
                No trading activity recorded for Week {weekNum} ({dateRangeStr}).
              </p>
              {!showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer min-h-[44px]"
                >
                  <Plus className="h-4 w-4" />
                  Add Trade for Week {weekNum}
                </button>
              )}
            </div>
          )}

          {/* Form inside WeeklyModal */}
          {showForm && (
            <div className="rounded-xl border border-gray-800/90 bg-[#0a0d13]/80 p-3.5 sm:p-5">
              <div className="mb-3.5 flex items-center justify-between border-b border-gray-800/60 pb-2.5">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-200 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  {editTrade ? 'Edit Trade Details' : `Add Trade for Week ${weekNum}`}
                </h3>
                {trades.length > 0 && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer py-1"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Date Selection within Week */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Trade Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`${inputBase} cursor-pointer`}
                    required
                  >
                    {daysInWeek.map((d) => {
                      const str = format(d, 'yyyy-MM-dd')
                      return (
                        <option key={str} value={str}>
                          {format(d, 'EEEE, MMM d, yyyy')}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Asset Selection */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Asset / Pair
                  </label>
                  <select
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                    className={`${inputBase} cursor-pointer`}
                    required
                  >
                    <option value="">Select asset (e.g. XAUUSD, EURUSD)...</option>
                    {COMMON_PAIRS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PnL Amount & Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400">
                      PnL Amount (USD)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={pnl}
                        onChange={(e) => handlePnlChange(e.target.value)}
                        placeholder="e.g. 100 or -50"
                        className={`${inputBase} pl-9 font-mono`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400">
                      Trade Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle('Win')}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                          status === 'Win'
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-sm'
                            : 'border-gray-700/80 bg-[#0a0d13] text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Win
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusToggle('Loss')}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                          status === 'Loss'
                            ? 'border-red-500 bg-red-500/20 text-red-500 shadow-sm'
                            : 'border-gray-700/80 bg-[#0a0d13] text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <XCircle className="h-4 w-4" />
                        Loss
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Textarea */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-emerald-400" />
                    Trade Notes & Strategy Setup
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter setup confluences (e.g., SMC, Order Block, FVG entry, Liquidity Sweep)..."
                    className={`${inputBase} resize-none leading-relaxed`}
                  />
                </div>

                {/* Action Buttons: Touch Friendly (min-h-[44px]) */}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 active:scale-[0.98] transition-all cursor-pointer min-h-[44px]"
                  >
                    <Save className="h-4 w-4" />
                    {editTrade ? 'Update Trade' : 'Save Trade'}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-gray-700 px-4 py-3 text-sm font-medium text-gray-400 hover:border-gray-600 hover:text-gray-200 transition-colors cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
