import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Compass,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const location = useLocation();
  const isAdminLogin = location.pathname === '/admin/login';
  const activePortal = isAdminLogin ? 'admin' : 'tourist';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/dashboard';

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
        const destinationId = location.state?.planDestinationId;
        navigate(
          destinationId ? `/dashboard?tab=journey&destination=${encodeURIComponent(destinationId)}` : from,
          { replace: true }
        );
      }
    } else if (result?.requiresVerification) {
      navigate('/signup', { state: { emailToVerify: result.email } });
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-50">
      <Link to={isAdminLogin ? '/login' : '/admin/login'} className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
        {isAdminLogin ? 'Tourist login' : 'Admin access'}
      </Link>
      {/* Centered light login card */}
      <div className="relative z-10 w-full max-w-md mx-4 my-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl bg-white/95 backdrop-blur-3xl border border-white shadow-2xl p-8 sm:p-10 overflow-hidden"
        >
          {/* Subtle top edge shimmer */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-75" />

          {/* Floating Brand Header */}
          <div className="text-center space-y-3 mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 90, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-royal to-blue-electric p-0.5 shadow-glow-electric"
              >
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <Compass className="w-6 h-6 text-blue-700" />
                </div>
              </motion.div>
              <div className="text-left">
                <span className="text-xl font-black tracking-widest text-slate-900 block">
                  YATRA<span className="text-blue-electric">LOK</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-600 font-bold block">
                  Smart Tourism Platform
                </span>
              </div>
            </Link>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 pt-2">
              {isAdminLogin ? 'Administrator Sign In' : 'Welcome to YatraLok'}
            </h2>
            <p className="text-sm text-slate-600">
              {isAdminLogin ? 'Secure access to platform operations' : 'Discover India and manage your journeys'}
            </p>
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800">
            {isAdminLogin ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            {isAdminLogin ? 'Administrator access' : 'Tourist Login'}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                <span>Registered Email</span>
                <span className="text-xs text-blue-700 font-mono">Encrypted</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activePortal === 'admin'
                      ? 'div160706@gmail.com'
                      : 'tourist@example.com'
                  }
                  required
                  className="w-full glass-input pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-700 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full glass-input pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
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
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {activePortal === 'admin' ? 'Command Center' : 'YatraLok'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="text-center mt-6">
            {!isAdminLogin && <p className="text-sm text-slate-600">
              New to YatraLok?{' '}
              <Link
                to="/signup"
                className="text-blue-700 font-bold hover:underline ml-1"
              >
                Tourist Signup
              </Link>
            </p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
