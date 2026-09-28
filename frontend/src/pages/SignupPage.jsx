import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
    const res = await register(formData);
    setSubmitting(false);

    if (res?.success) {
      setActiveEmail(res.email);
      setShowOtpModal(true);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }

    setVerifyingOtp(true);
    const res = await verifyOTP(activeEmail, otpCode.trim());
    setVerifyingOtp(false);

    if (res?.success) {
      setShowOtpModal(false);
      navigate('/dashboard');
    }
  };

  const handleResend = async () => {
    await resendOTP(activeEmail);
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
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
          <h2 className="text-xl font-bold text-white">Create Tourist Account</h2>
          <p className="text-xs text-slate-400">
            Join thousands of smart travelers exploring India with crowd safety
          </p>
        </div>

        {/* Glass Form Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="glass-input w-full text-xs"
                >
                  <option value="Male" className="bg-navy-950 text-white">Male</option>
                  <option value="Female" className="bg-navy-950 text-white">Female</option>
                  <option value="Other" className="bg-navy-950 text-white">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Number *
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="glass-input w-full pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="glass-input w-full pl-10 pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* City & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Home City *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. New Delhi"
                    value={formData.city}
                    onChange={handleChange}
                    className="glass-input w-full pl-10 text-xs"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="e.g. 14 Connaught Place, Block B"
                  value={formData.address}
                  onChange={handleChange}
                  className="glass-input w-full text-xs"
                />
              </div>
            </div>

            {/* Destination of Choice / Travel Plan */}
            <div className="p-3.5 rounded-xl bg-navy-900/60 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-300">
                  Target Destination / Place You Wish to Visit *
                </label>
                <span className="text-[10px] text-slate-400">Recorded in Tourist Digital Passport</span>
              </div>
              <div className="relative">
                <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  name="chosenDestination"
                  required
                  placeholder="e.g. Red Fort (Delhi), Taj Mahal (Agra), Amer Fort (Jaipur)..."
                  value={formData.chosenDestination}
                  onChange={handleChange}
                  className="glass-input w-full pl-10 text-xs text-white"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Red Fort, Delhi',
                  'Taj Mahal, Agra',
                  'Amer Fort, Jaipur',
                  'India Gate, Delhi',
                  'Rajwada Palace, Indore',
                  'Kashi Vishwanath, Varanasi',
                  'Marine Drive, Mumbai',
                ].map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => setFormData({ ...formData, chosenDestination: dest })}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                      formData.chosenDestination === dest
                        ? 'bg-amber-400 text-navy-950 font-bold border-amber-400'
                        : 'bg-white/5 text-slate-300 hover:text-white border-white/10 hover:border-amber-400/40'
                    }`}
                  >
                    + {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="glass-button-primary w-full py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initiating Registration...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Register & Verify Email OTP</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-white/10 text-xs text-slate-400 mt-4">
            Already registered on Yatra Lok?{' '}
            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-300 font-bold ml-1"
            >
              Sign In Here
            </Link>
          </div>
        </div>
      </div>

      {/* EMAIL OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-navy-900 border border-white/20 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Verify Your Email</h3>
              <p className="text-xs text-slate-300">
                We've sent a 6-digit OTP to{' '}
                <span className="text-amber-400 font-semibold">{activeEmail}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Check your inbox (and spam/junk folder if not found)
              </p>
            </div>


            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  autoFocus
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl font-mono tracking-[0.5em] font-extrabold glass-input py-3"
                />
              </div>

              <button
                type="submit"
                disabled={verifyingOtp || otpCode.length !== 6}
                className="glass-button-primary w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <span>Verify & Unlock Dashboard</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
