import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import {
  ShieldCheck,
  Calendar,
  Lock,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react'

export default function LoginScreen({ onLoginSuccess, isConfigured }) {
  const [error, setError] = useState(null)

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      if (credentialResponse.credential) {
        const decoded = jwtDecode(credentialResponse.credential)
        const userProfile = {
          name: decoded.name || 'Trader',
          email: decoded.email || '',
          picture: decoded.picture || '',
          given_name: decoded.given_name || '',
          family_name: decoded.family_name || '',
          sub: decoded.sub,
          loginMethod: 'google',
          loggedAt: new Date().toISOString(),
        }
        localStorage.setItem('tradejournal-user', JSON.stringify(userProfile))
        onLoginSuccess(userProfile)
      } else {
        setError('No credential received from Google. Please try again.')
      }
    } catch (err) {
      console.error('Error decoding Google JWT credential:', err)
      setError('Failed to authenticate with Google. Please check your credentials.')
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-In failed or was closed. Please try again.')
  }

  const handleDemoLogin = () => {
    const demoProfile = {
      name: 'Pro Trader',
      email: 'trader@demo.local',
      picture: '',
      given_name: 'Pro',
      loginMethod: 'demo',
      loggedAt: new Date().toISOString(),
    }
    localStorage.setItem('tradejournal-user', JSON.stringify(demoProfile))
    onLoginSuccess(demoProfile)
  }

  return (
    <div className="min-h-screen bg-[#0a0d13] text-gray-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Background radial gradient ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl border border-gray-800/80 bg-[#0e1219]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/80 animate-in">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 mb-4">
            <Calendar className="h-8 w-8 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0e1219]"></span>
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Trade<span className="text-emerald-400">Journal</span>
          </h1>
          <p className="mt-1 text-xs text-gray-400 max-w-xs">
            Personal Trading Performance & TradeZella-style Calendar View
          </p>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-800/80" />

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-left text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Authentication Error</p>
              <p className="mt-0.5 text-red-400/90">{error}</p>
            </div>
          </div>
        )}

        {/* Google OAuth Section */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Sign In to Continue
            </span>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Access your private trading logs & analytics
            </p>
          </div>

          {/* Google Sign In Button Container */}
          <div className="flex justify-center items-center min-h-[44px]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              size="large"
              text="signin_with"
              width="320"
            />
          </div>

          {/* Client ID Placeholder Notification if not yet customized */}
          {!isConfigured && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-left">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-gray-300 space-y-1">
                  <p className="font-semibold text-amber-300">
                    Google Client ID Setup
                  </p>
                  <p className="text-gray-400 leading-relaxed">
                    Replace <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200 font-mono text-[10px]">PASTE_YOUR_CLIENT_ID_HERE</code> in <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200 font-mono text-[10px]">src/App.jsx</code> with your Google Cloud OAuth Client ID.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Demo Access (Handy for offline test or before Google Console setup) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-700/80 bg-[#0a0d13] px-4 py-2.5 text-xs font-semibold text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/[0.04] transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>Continue with Demo Account</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Feature Badges Footer */}
        <div className="mt-8 pt-5 border-t border-gray-800/60 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Private LocalStorage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            <span>Real-time PnL</span>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="mt-6 text-center text-xs text-gray-600">
        Protected Trading Dashboard &middot; TradeJournal v1.0
      </footer>
    </div>
  )
}

