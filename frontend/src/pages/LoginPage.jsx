import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Compass, Eye, EyeOff, Loader2, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result?.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else if (result?.requiresVerification) {
      // Pass email to verify OTP — OTP will arrive in user's inbox
      navigate('/signup', { state: { emailToVerify: result.email } });
    }
  };

  const handleAutofill = (type) => {
    if (type === 'admin') {
      setEmail('admin@yatralok.com');
      setPassword('Admin@123');
    } else {
      setEmail('tourist@yatralok.com');
      setPassword('Tourist@123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-glow-amber">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" />
              </div>
            </div>
            <span className="text-2xl font-extrabold tracking-wider text-white">
              YATRA LOK
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">Sign In to Your Account</h2>
          <p className="text-xs text-slate-400">
            Access your personalized travel dashboard & crowd alerts
          </p>
        </div>

        {/* Demo Quick-Fill Bar */}
        <div className="p-3 rounded-xl bg-navy-900/60 border border-amber-500/20 text-xs flex items-center justify-between">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Demo Autofill:</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleAutofill('tourist')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 font-semibold transition-colors"
            >
              Tourist
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('admin')}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Glass Form Card */}
        <div className="glass-card p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10 text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="glass-button-primary w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-white/10 text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="text-amber-400 hover:text-amber-300 font-bold ml-1"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
