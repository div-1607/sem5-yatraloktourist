import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, Loader2, CheckCircle2, Compass } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        toast.success('Password reset OTP sent to your email inbox.');
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please fill in OTP and new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        otp: otp.trim(),
        newPassword,
      });

      if (res.data.success) {
        toast.success('Password reset successfully! You can now sign in.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-glow-amber">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <span className="text-2xl font-extrabold tracking-wider text-white">
              YATRA LOK
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">Reset Account Password</h2>
          <p className="text-xs text-slate-400">
            {step === 1
              ? 'Enter your registered email to receive a recovery OTP code'
              : 'Enter the 6-digit OTP code and choose your new password'}
          </p>
        </div>

        <div className="glass-card p-8 space-y-6">
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="glass-button-primary w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send Reset OTP</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center text-xs">
                <span className="text-slate-300 block text-[11px]">OTP sent to:</span>
                <span className="text-amber-400 font-semibold">{email}</span>
                <p className="text-slate-500 text-[10px] mt-1">Check your inbox and spam folder</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="glass-input w-full text-center text-lg font-mono font-bold tracking-widest py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="glass-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input w-full text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glass-button-primary w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 mt-2"
              >
                Change email address
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-white/10 text-xs">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
