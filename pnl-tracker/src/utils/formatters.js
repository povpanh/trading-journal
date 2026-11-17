/**
 * Formats a PnL number to always show:
 * - Negative PnL: Red color requirement, format: "-$50.00"
 * - Positive PnL: Green color requirement, format: "+$100.00"
 * - Zero PnL: "$0.00"
 */
export function formatPnL(amount, options = { minimumFractionDigits: 2, maximumFractionDigits: 2 }) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0
  const absFormatted = Math.abs(num).toLocaleString('en-US', options)
  if (num < 0) {
    return `-$${absFormatted}`
  } else if (num > 0) {
    return `+$${absFormatted}`
  } else {
    return `$${absFormatted}`
  }
}

/**
 * Returns Tailwind text color class for PnL:
 * - Negative: text-red-500
 * - Positive: text-emerald-400
 * - Zero: text-gray-400
 */
export function getPnLTextColor(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0
  if (num < 0) return 'text-red-500'
  if (num > 0) return 'text-emerald-400'
  return 'text-gray-400'
}

/**
 * Returns Tailwind background and border styling for PnL cards / badges
 */
export function getPnLCardStyle(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0
  if (num < 0) {
    return 'border-red-500/25 bg-red-500/[0.08]'
  } else if (num > 0) {
    return 'border-emerald-500/25 bg-emerald-500/[0.08]'
  }
  return 'border-gray-800/40 bg-[#0a0d13]'
}

