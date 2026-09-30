import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  Compass,
  KeyRound,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const { register, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    mobile: '',
    city: '',
    address: '',
    chosenDestination: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [activeEmail, setActiveEmail] = useState('');

  // Auto-trigger OTP modal if navigated with unverified state
  useEffect(() => {
    if (location.state?.emailToVerify) {
      setActiveEmail(location.state.emailToVerify);
      setShowOtpModal(true);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.age ||
      !formData.mobile ||
      !formData.city ||
      !formData.address
    ) {
      toast.error('Please fill in all registration fields.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const result = await register(formData);
    setSubmitting(false);

    if (result.success) {
      setActiveEmail(formData.email);
      setShowOtpModal(true);
      toast.success(result.message || 'OTP verification code generated!');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP code.');
      return;
    }

    setVerifyingOtp(true);
    const result = await verifyOTP(activeEmail, otpCode);
    setVerifyingOtp(false);

    if (result.success) {
      toast.success('Identity verified! Digital Tourist ID issued.');
      navigate('/dashboard');
    }
  };

  const handleResend = async () => {
    const res = await resendOTP(activeEmail);
    if (res.success) {
      toast.success(res.message || 'New OTP generated and displayed on screen.');
    }
  };

  return (
    <div className="light-theme-page relative min-h-screen w-full flex items-center justify-center overflow-hidden py-12 px-4">
      {/* Background with Ambient Glow */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2000&q=85)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-white/65 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-royal to-blue-electric p-0.5 shadow-glow-electric">
              <div className="w-full h-full bg-black-deep rounded-[14px] flex items-center justify-center">
                <Compass className="w-6 h-6 text-blue-neon group-hover:rotate-45 transition-transform" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-wider text-white">
              YATRA<span className="text-blue-electric">LOK</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Create Digital Tourist Account</h2>
          <p className="text-xs text-slate-300 font-medium">
            Join thousands of smart travelers with live GPS geofencing & crowd safety
          </p>
        </div>

        {/* Glass Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-black-midnight/70 backdrop-blur-3xl border border-blue-electric/30 p-8 shadow-glass-panel"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    className="glass-input w-full pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Age *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="120"
                    required
                    placeholder="25"
                    value={formData.age}
                    onChange={handleChange}
                    className="glass-input w-full pl-10 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Gender & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="glass-input w-full text-xs"
                >
                  <option value="Male" className="bg-black-midnight text-white">Male</option>
                  <option value="Female" className="bg-black-midnight text-white">Female</option>
                  <option value="Other" className="bg-black-midnight text-white">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Emergency Mobile *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="mobile"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="glass-input w-full pl-10 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="aarav@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="glass-input w-full pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Secret Key / Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
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
            </div>

            {/* City & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Home City *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={formData.city}
                    onChange={handleChange}
                    className="glass-input w-full pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Permanent Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Street / Locality"
                  value={formData.address}
                  onChange={handleChange}
                  className="glass-input w-full text-xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-royal via-blue-electric to-blue-royal hover:from-blue-600 hover:to-blue-electric transition-all shadow-glow-electric flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Digital Identity...</span>
                </>
              ) : (
                <>
                  <span>Create Digital Tourist Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-white/10">
            Already registered?{' '}
            <Link to="/login" className="text-blue-neon font-bold hover:underline">
              Access Your Portal
            </Link>
          </div>
        </motion.div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
          <div className="w-full max-w-sm rounded-3xl bg-black-midnight/90 border border-blue-electric/40 p-6 sm:p-8 space-y-5 text-center shadow-glass-panel">
            <div className="w-12 h-12 rounded-2xl bg-blue-royal/50 border border-blue-electric/40 flex items-center justify-center text-blue-neon mx-auto shadow-glow-electric">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Enter Verification OTP</h3>
              <p className="text-xs text-slate-300 mt-1">
                Enter the 6-digit code sent to <span className="font-bold text-white">{activeEmail}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength="6"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center text-2xl font-mono tracking-widest glass-input py-3 font-bold text-white"
                required
                autoFocus
              />

              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full glass-button-primary py-3 text-xs uppercase font-bold tracking-wider"
              >
                {verifyingOtp ? 'Verifying Code...' : 'Verify & Launch Dashboard'}
              </button>
            </form>

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResend}
                className="text-blue-neon hover:underline flex items-center gap-1 mx-auto font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Resend Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
