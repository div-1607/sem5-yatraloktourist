import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Compass,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ShieldAlert,
  Users,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  // Tabs: 'tourist' or 'admin'
  const [activePortal, setActivePortal] = useState('tourist');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const switchPortal = (portal) => {
    setActivePortal(portal);
    if (portal === 'admin') {
      setEmail('admin@yatralok.com');
      setPassword('Admin@123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both your registered email and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password, activePortal);
    setSubmitting(false);

    if (result?.success) {
      if (result.user.role === 'admin') {
        toast.success('Verified Master Administrator access verified.');
        navigate('/admin');
      } else {
        toast.success(`Welcome back, ${result.user.name}!`);
        navigate(from, { replace: true });
      }
    } else if (result?.requiresVerification) {
      navigate('/signup', { state: { emailToVerify: result.email } });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-glow-amber">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-wider text-white">
              YATRA LOK
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white">Secure Portal Access</h2>
          <p className="text-xs text-slate-400">
            Select your portal to proceed to your authorized command dashboard
          </p>
        </div>

        {/* TWO LOGIN OPTIONS: TOURIST vs ADMIN */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-navy-900/90 border border-white/10 shadow-glass">
          <button
            type="button"
            onClick={() => switchPortal('tourist')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
              activePortal === 'tourist'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <span className="block font-black tracking-wide">Tourist Login</span>
              <span className="block text-[10px] font-normal opacity-85">Travelers & Pilgrims</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => switchPortal('admin')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
              activePortal === 'admin'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-glow-red scale-[1.02] border border-rose-400/50'
                : 'text-slate-300 hover:text-rose-300 hover:bg-rose-950/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-rose-300" />
            <div className="text-left">
              <span className="block font-black tracking-wide">Admin Portal</span>
              <span className="block text-[10px] font-normal opacity-85">1 Verified Master Admin</span>
            </div>
          </button>
        </div>

        {/* Glass Form Card */}
        <div
          className={`glass-card p-8 space-y-6 border-2 transition-all ${
            activePortal === 'admin'
              ? 'border-rose-500/60 shadow-glow-red bg-navy-900/95'
              : 'border-amber-500/30 shadow-glass'
          }`}
        >
          {/* Portal Context Header */}
          <div className="pb-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    activePortal === 'admin'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {activePortal === 'admin' ? '🛡 Verified Authority Portal' : '🧳 Tourist Identity Login'}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                {activePortal === 'admin'
                  ? 'Central Operations Admin Authentication'
                  : 'Tourist Account Sign In'}
              </h3>
              <p className="text-xs text-slate-400">
                {activePortal === 'admin'
                  ? 'Access restricted exclusively to the 1 registered system administrator.'
                  : 'Sign in to access your digital ID card, emergency beacon, and saved places.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {activePortal === 'admin' ? 'Master Admin Email *' : 'Registered Email Address *'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={activePortal === 'admin' ? 'admin@yatralok.com' : 'tourist@yatralok.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10 text-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password *
                </label>
                {activePortal === 'tourist' && (
                  <Link
                    to="/forgot-password"
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Pre-Fill Toggle */}
            {activePortal === 'admin' ? (
              <div className="p-3 rounded-xl bg-navy-950/80 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Master Admin Account:</span>
                </span>
                <button
                  type="button"
                  onClick={() => switchPortal('admin')}
                  className="text-rose-400 hover:text-white font-mono font-semibold underline text-[11px]"
                >
                  admin@yatralok.com
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-navy-950/80 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>New to Yatra Lok?</span>
                </span>
                <Link
                  to="/signup"
                  className="text-amber-300 hover:text-white font-bold underline text-[11px]"
                >
                  Register & Get Digital ID &rarr;
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-xl font-black tracking-wider text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md ${
                activePortal === 'admin'
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white shadow-glow-red border border-rose-400/50'
                  : 'glass-button-primary'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AUTHENTICATING IDENTITY...</span>
                </>
              ) : activePortal === 'admin' ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>VERIFY MASTER ADMIN & ENTER COMMAND CENTER</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>SIGN IN TO TOURIST DASHBOARD</span>
                </>
              )}
            </button>
          </form>

          {/* Signup link for tourists */}
          {activePortal === 'tourist' ? (
            <p className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
              Don't have a Tourist Account yet?{' '}
              <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-bold underline">
                Sign Up & Generate Digital ID &rarr;
              </Link>
            </p>
          ) : (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-[11px] text-rose-300 space-y-1">
              <span className="font-bold block">🔒 Administrative Security Seal</span>
              <p className="text-slate-400">
                Only 1 Verified Master Administrator account is authorized for Central Operations. All login telemetry is cryptographically logged.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
