import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { Calendar } from 'lucide-react'

export default function LoginScreen({ onLoginSuccess }) {
  const [error, setError] = useState(null)

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      if (credentialResponse.credential) {
        const decoded = jwtDecode(credentialResponse.credential)
        const rawEmail = decoded.email || ''
        const email = rawEmail ? rawEmail.trim().toLowerCase() : ''
        const userProfile = {
          name: decoded.name || 'Trader',
          email,
          uid: decoded.sub || email,
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
        setError('No credentials received from Google. Please try again.')
      }
    } catch (err) {
      console.error('Error decoding Google JWT credential:', err)
      setError('Failed to authenticate with Google. Please check your credentials.')
    }
  }

  const handleLoginSuccess = handleGoogleSuccess

  const handleGoogleError = () => {
    setError('Google Sign-In failed or was closed. Please try again.')
  }

  const handleDemoLogin = () => {
    const demoProfile = {
      name: 'Pro Trader',
      email: 'trader@demo.local',
      uid: 'demo-user',
      picture: '',
      given_name: 'Pro',
      loginMethod: 'demo',
      loggedAt: new Date().toISOString(),
    }
    localStorage.setItem('tradejournal-user', JSON.stringify(demoProfile))
    onLoginSuccess(demoProfile)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col justify-center items-center p-4 font-sans selection:bg-emerald-500/30">
      {/* Sleek Minimalist Login Card */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-10 shadow-2xl max-w-sm w-full mx-auto text-center animate-in">
        {/* Centered Small Green Calendar Icon */}
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        {/* Header & Typography */}
        <h1 className="text-2xl font-bold text-white tracking-tight mt-4">
          Trade Journal
        </h1>
        <p className="text-sm text-slate-400 mt-2 mb-8">
          Welcome back. Log in to track your edge.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 text-left">
            {error}
          </div>
        )}

        <div className="flex justify-center w-full my-6 bg-transparent border-none">
          <GoogleLogin
            onSuccess={handleLoginSuccess} /* Make sure to use the correct existing handler name */
            onError={() => console.log('Login Failed')}
            theme="filled_black"
            shape="pill"
            size="large"
            text="signin_with"
          />
        </div>

        {/* Subtle Divider */}
        <div className="w-full border-t border-slate-800/80 my-6" />

        {/* Subtle Unboxed Demo Link */}
        <button
          onClick={handleDemoLogin}
          type="button"
          className="text-sm text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          Continue as Guest (Demo)
        </button>
      </div>
    </div>
  )
}
