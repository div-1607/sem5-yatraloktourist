import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Compass,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ShieldCheck,
  UserCheck,
  MapPin,
  ArrowRight,
  ShieldAlert,
  Globe2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Curated 8 cinematic destination carousel backgrounds
const DESTINATIONS = [
  {
    category: 'Sacred Temples',
    title: 'Kedarnath Temple',
    location: 'Garhwal Himalayas, Uttarakhand',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=85',
    elevation: '3,583 m',
  },
  {
    category: 'Historical Monuments',
    title: 'Taj Mahal Monument',
    location: 'Agra, Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2000&q=85',
    elevation: 'UNESCO World Heritage',
  },
  {
    category: 'Pristine Beaches',
    title: 'Radhanagar Coastal Bay',
    location: 'Havelock, Andaman Islands',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2000&q=85',
    elevation: 'Bay of Bengal',
  },
  {
    category: 'Majestic Mountains',
    title: 'Kanchenjunga Range',
    location: 'Sikkim Himalayas, India',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',
    elevation: '8,586 m',
  },
  {
    category: 'Dense Forests',
    title: 'Western Ghats Rainforest',
    location: 'Kerala Bio-Reserve, India',
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2000&q=85',
    elevation: 'Bio-Hotspot',
  },
  {
    category: 'Smart Tourism Cities',
    title: 'Marina Bay Skyline',
    location: 'Singapore Global Hub',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=2000&q=85',
    elevation: 'Metropolitan',
  },
  {
    category: 'Desert Heritage',
    title: 'Golden Fortress',
    location: 'Jaisalmer, Thar Desert',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=2000&q=85',
    elevation: 'Living Fort',
  },
  {
    category: 'International Wonders',
    title: 'Mount Fuji & Chureito',
    location: 'Yamanashi, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000&q=85',
    elevation: '3,776 m',
  },
];

const LoginPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activePortal, setActivePortal] = useState('tourist'); // 'tourist' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Automatically cycle destination background every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DESTINATIONS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const switchPortal = (portal) => {
    setActivePortal(portal);
    if (portal === 'admin') {
      setEmail('admin@yatralok.com');
      setPassword('Admin@123');
    } else {
      setEmail('rahul.verma@example.com');
      setPassword('Tourist@123');
    }
  };

  const handleQuickDemo = (type) => {
    switchPortal(type);
    toast.success(`Demo credentials loaded for ${type.toUpperCase()}`);
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black-deep">
      {/* 1. FULL-SCREEN ANIMATED DESTINATION CAROUSEL */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${DESTINATIONS[currentSlide].image})`,
            }}
          />
        </AnimatePresence>

        {/* 2. CINEMATIC LUXURY DARK GLASS OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-t from-black-deep via-black-deep/80 to-navy-950/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-royal/20 via-black-deep/60 to-black-deep/95" />

        {/* Subtle animated ambient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-electric/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-navy-800/40 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* 3. FLOATING DESTINATION INFO BADGE (Bottom Left) */}
      <motion.div
        key={`badge-${currentSlide}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="hidden lg:flex absolute bottom-8 left-8 z-10 items-center gap-4 px-5 py-3 rounded-2xl bg-black-midnight/70 backdrop-blur-2xl border border-blue-electric/25 shadow-glass"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-royal/40 border border-blue-electric/40 flex items-center justify-center text-blue-neon">
          <MapPin className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-electric">
              {DESTINATIONS[currentSlide].category}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {DESTINATIONS[currentSlide].elevation}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide">
            {DESTINATIONS[currentSlide].title}
          </h4>
          <p className="text-xs text-slate-300">
            {DESTINATIONS[currentSlide].location}
          </p>
        </div>
        <div className="flex gap-1 ml-4 pl-4 border-l border-white/10">
          {DESTINATIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-6 bg-blue-electric shadow-glow-electric'
                  : 'w-1.5 bg-white/20 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* 4. MAIN FROSTED GLASS LOGIN CONTAINER */}
      <div className="relative z-10 w-full max-w-md mx-4 my-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl bg-black-midnight/65 backdrop-blur-3xl border border-blue-electric/30 shadow-glass-panel p-8 sm:p-10 overflow-hidden"
        >
          {/* Subtle top edge shimmer */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-electric to-transparent opacity-75" />

          {/* Floating Brand Header */}
          <div className="text-center space-y-3 mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 90, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-royal to-blue-electric p-0.5 shadow-glow-electric"
              >
                <div className="w-full h-full bg-black-deep/90 rounded-[14px] flex items-center justify-center">
                  <Compass className="w-6 h-6 text-blue-neon" />
                </div>
              </motion.div>
              <div className="text-left">
                <span className="text-xl font-black tracking-widest text-white block">
                  YATRA<span className="text-blue-electric">LOK</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                  Smart Tourism Platform
                </span>
              </div>
            </Link>

            <h2 className="text-2xl font-bold tracking-tight text-white pt-2">
              Welcome to the Future
            </h2>
            <p className="text-xs text-slate-300">
              Biometric & Geo-Spatial Luxury Tourism System
            </p>
          </div>

          {/* Portal Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-navy-950/60 border border-blue-electric/25 mb-6 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => switchPortal('tourist')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                activePortal === 'tourist'
                  ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white shadow-glow-electric'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tourist Portal</span>
            </button>
            <button
              type="button"
              onClick={() => switchPortal('admin')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                activePortal === 'admin'
                  ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white shadow-glow-electric'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Registered Email</span>
                <span className="text-[10px] text-blue-neon font-mono">Encrypted</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activePortal === 'admin'
                      ? 'admin@yatralok.com'
                      : 'tourist@example.com'
                  }
                  required
                  className="w-full glass-input pl-10 pr-4 text-sm bg-navy-950/50 border-blue-electric/30 text-white placeholder-slate-500 focus:border-blue-electric"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-neon hover:text-blue-electric transition-colors"
                >
                  Forgot Key?
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
                  className="w-full glass-input pl-10 pr-10 text-sm bg-navy-950/50 border-blue-electric/30 text-white placeholder-slate-500 focus:border-blue-electric"
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
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-royal via-blue-electric to-blue-royal hover:from-blue-600 hover:to-blue-electric transition-all duration-300 shadow-glow-electric flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 mt-2"
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

          {/* Quick Demo Credentials Bar for Judges */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-warning" />
                Hackathon Judge 1-Click Fill
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('tourist')}
                className="py-1.5 px-2.5 rounded-lg bg-navy-900/60 border border-blue-electric/30 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-blue-royal/30 transition-all flex items-center justify-center gap-1"
              >
                <span>Tourist Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-1.5 px-2.5 rounded-lg bg-navy-900/60 border border-blue-electric/30 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-blue-royal/30 transition-all flex items-center justify-center gap-1"
              >
                <span>Admin Demo</span>
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-400">
              New to YatraLok?{' '}
              <Link
                to="/signup"
                className="text-blue-neon font-bold hover:underline ml-1"
              >
                Generate Digital Tourist ID
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
