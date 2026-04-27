'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/* ─────────────────────────────────────────────────────────
   KEYFRAMES & GLOBAL STYLES
───────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap');

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes gridPan {
    0%   { transform: translate(0, 0); }
    100% { transform: translate(60px, 60px); }
  }
  @keyframes floatA {
    0%,100% { transform: translateY(0) rotate(0deg); }
    50%     { transform: translateY(-18px) rotate(4deg); }
  }
  @keyframes floatB {
    0%,100% { transform: translateY(0) rotate(0deg); }
    50%     { transform: translateY(14px) rotate(-3deg); }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulseRing {
    0%  { transform: scale(0.9); opacity: 0.5; }
    70% { transform: scale(1.15); opacity: 0; }
    100%{ transform: scale(0.9); opacity: 0; }
  }
  @keyframes stepSlide {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes stepSlideBack {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
  @keyframes progressFill {
    from { width: 0%; }
    to   { width: 100%; }
  }
  @keyframes otpPop {
    0%  { transform: scale(0.92); opacity: 0; }
    60% { transform: scale(1.04); }
    100%{ transform: scale(1);    opacity: 1; }
  }

  .login-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f4f6fb;
    font-family: 'Barlow Condensed', sans-serif;
    padding: 24px 16px;
  }

  /* ── FORM CARD ── */
  .lp-right {
    width: 100%;
    max-width: 460px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8ecf4;
    box-shadow: 0 8px 40px rgba(15,25,35,0.1), 0 2px 8px rgba(15,25,35,0.05);
    padding: 48px 44px;
  }
  .lp-form-wrap {
    width: 100%;
    animation: fadeUp 0.55s ease both;
  }

  .lp-form-header { margin-bottom: 36px; }
  .lp-form-step-label {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.72rem; font-weight: 700; color: #1A37AA;
    letter-spacing: 0.1em; text-transform: uppercase;
    background: rgba(26,55,170,0.07); border-radius: 100px;
    padding: 4px 12px; margin-bottom: 14px;
  }
  .lp-form-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    font-weight: 700; color: #0f1923;
    letter-spacing: 0.02em; line-height: 1.1;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  .lp-form-subtitle {
    font-size: 1rem; color: #8898aa; font-weight: 400; line-height: 1.5;
    font-family: 'Barlow Condensed', sans-serif;
  }

  /* Progress bar */
  .lp-progress {
    display: flex; gap: 6px; margin-bottom: 32px;
  }
  .lp-progress-bar {
    height: 3px; flex: 1; border-radius: 100px;
    background: #e8ecf4; overflow: hidden;
  }
  .lp-progress-fill {
    height: 100%; background: linear-gradient(90deg, #1A37AA, #52ba4f);
    border-radius: 100px;
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
  }

  /* Error */
  .lp-error {
    display: flex; align-items: flex-start; gap: 10px;
    background: #fff5f5; border: 1px solid #fecaca;
    border-left: 3px solid #dc2626;
    border-radius: 8px; padding: 12px 14px;
    margin-bottom: 24px;
    animation: shake 0.35s ease;
  }
  .lp-error-text { font-size: 0.85rem; color: #dc2626; font-weight: 500; line-height: 1.4; }

  /* Field */
  .lp-field { margin-bottom: 20px; }
  .lp-label {
    display: block; font-size: 0.9rem; font-weight: 600;
    color: #374151; margin-bottom: 7px; letter-spacing: 0.02em;
    font-family: 'Barlow Condensed', sans-serif;
    text-transform: uppercase;
  }
  .lp-input-wrap { position: relative; }
  .lp-input {
    width: 100%;
    padding: 13px 42px 13px 44px;
    font-size: 1rem; font-family: 'Barlow Condensed', sans-serif;
    color: #0f1923; background: #f8f9fc;
    border: 1.5px solid #e8ecf4; border-radius: 10px;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .lp-input:focus {
    border-color: #1A37AA; background: #fff;
    box-shadow: 0 0 0 3px rgba(26,55,170,0.08);
  }
  .lp-input.error {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220,38,38,0.08);
  }
  .lp-input-prefix {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 0.875rem; font-weight: 700; color: #1A37AA;
    pointer-events: none; z-index: 1;
  }
  .lp-input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    pointer-events: none; z-index: 1; color: #8898aa;
    display: flex; align-items: center;
  }
  .lp-input-icon-right {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: #8898aa; display: flex; align-items: center;
  }
  .lp-eye-btn {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #8898aa;
    display: flex; align-items: center; padding: 4px;
    border-radius: 4px; transition: color 0.2s;
  }
  .lp-eye-btn:hover { color: #1A37AA; }

  /* Role dropdown styles */
  .lp-role-select {
    width: 100%;
    padding: 13px 44px 13px 44px;
    font-size: 1rem; font-family: 'Barlow Condensed', sans-serif;
    color: #0f1923; background: #f8f9fc;
    border: 1.5px solid #e8ecf4; border-radius: 10px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }
  .lp-role-select:focus {
    border-color: #1A37AA; background: #fff;
    box-shadow: 0 0 0 3px rgba(26,55,170,0.08);
  }
  .lp-role-select option {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    padding: 10px;
  }
  .lp-dropdown-arrow {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: #8898aa;
    display: flex; align-items: center;
  }

  /* OTP input */
  .lp-otp-info {
    background: linear-gradient(135deg, rgba(26,55,170,0.05), rgba(82,186,79,0.04));
    border: 1px solid rgba(26,55,170,0.12);
    border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;
    animation: otpPop 0.4s ease both;
  }
  .lp-otp-phone-label { font-size: 0.9rem; color: #8898aa; margin-bottom: 4px; font-family: 'Barlow Condensed', sans-serif; }
  .lp-otp-phone {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.15rem; font-weight: 700; color: #1A37AA; letter-spacing: 0.04em;
  }
  .lp-otp-input {
    width: 100%;
    padding: 16px 12px;
    font-size: 2rem;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.5em;
    color: #0f1923; background: #f8f9fc;
    border: 1.5px solid #e8ecf4; border-radius: 10px;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .lp-otp-input:focus {
    border-color: #1A37AA; background: #fff;
    box-shadow: 0 0 0 3px rgba(26,55,170,0.08);
  }
  .lp-otp-hint { font-size: 0.85rem; color: #8898aa; text-align: center; margin-top: 8px; font-family: 'Barlow Condensed', sans-serif; }

  /* Submit button */
  .lp-btn {
    width: 100%; padding: 14px 24px;
    background: linear-gradient(135deg, #1A37AA 0%, #2a4fc4 100%);
    color: #fff; border: none; border-radius: 10px;
    font-size: 1rem; font-weight: 600; font-family: 'Barlow Condensed', sans-serif;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 16px rgba(26,55,170,0.32);
    transition: transform 0.18s, box-shadow 0.22s, background 0.22s;
    margin-top: 8px; letter-spacing: 0.03em;
    position: relative; overflow: hidden;
    text-transform: uppercase;
  }
  .lp-btn::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
    opacity: 0; transition: opacity 0.2s;
  }
  .lp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,55,170,0.42); }
  .lp-btn:hover:not(:disabled)::after { opacity: 1; }
  .lp-btn:active:not(:disabled) { transform: translateY(0); }
  .lp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .lp-spinner {
    width: 17px; height: 17px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block; flex-shrink: 0;
  }

  /* OTP actions */
  .lp-otp-actions {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 20px; padding-top: 18px;
    border-top: 1px solid #e8ecf4;
  }
  .lp-back-btn {
    display: flex; align-items: center; gap: 5px;
    background: none; border: none;
    font-size: 0.9rem; font-weight: 500; color: #8898aa;
    cursor: pointer; font-family: 'Barlow Condensed', sans-serif;
    padding: 7px 10px; border-radius: 7px;
    transition: color 0.2s, background 0.2s;
  }
  .lp-back-btn:hover { color: #0f1923; background: #f4f6fb; }
  .lp-resend-btn {
    background: none; border: none;
    font-size: 0.9rem; font-weight: 600; color: #1A37AA;
    cursor: pointer; font-family: 'Barlow Condensed', sans-serif;
    padding: 7px 10px; border-radius: 7px;
    transition: background 0.2s;
  }
  .lp-resend-btn:hover:not(:disabled) { background: rgba(26,55,170,0.07); }
  .lp-resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .lp-countdown { font-size: 0.9rem; color: #8898aa; font-weight: 500; font-family: 'Barlow Condensed', sans-serif; }

  /* Footer links */
  .lp-form-footer {
    text-align: center; margin-top: 28px;
    padding-top: 22px; border-top: 1px solid #f0f2f8;
  }
  .lp-form-footer-text { font-size: 0.85rem; color: #8898aa; font-family: 'Barlow Condensed', sans-serif; }
  .lp-form-footer-text a { color: #1A37AA; font-weight: 600; text-decoration: none; }
  .lp-form-footer-text a:hover { text-decoration: underline; }
  .lp-copyright { font-size: 0.8rem; color: #c5cdd8; margin-top: 6px; font-family: 'Barlow Condensed', sans-serif; }

  /* Responsive */
  @media (max-width: 520px) {
    .lp-right { padding: 32px 24px; border-radius: 12px; }
    .lp-form-title { font-size: 1.5rem; }
    .lp-otp-input { font-size: 1.6rem; letter-spacing: 0.4em; }
  }
`;

/* ── ICONS ── */
const IcLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IcEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IcArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcBack = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const IcShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IcAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IcUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Auth state
  const [step, setStep]         = useState(1);
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [countdown, setCountdown] = useState(0);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [stepDir, setStepDir]           = useState('forward');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);
  const [roleFocused,  setRoleFocused]  = useState(false);
  const [otpFocused,   setOtpFocused]   = useState(false);
  const otpRef = useRef(null);

  // Inject CSS
  useEffect(() => {
    const id = '__login_styles__';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = CSS;
    document.head.appendChild(s);
  }, []);

  // Auto-focus OTP input when step changes
  useEffect(() => {
    if (step === 2 && otpRef.current) {
      setTimeout(() => otpRef.current?.focus(), 350);
    }
  }, [step]);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  /* ── STEP 1: Verify credentials and send OTP ── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!phone || !password || !selectedRole) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, role: selectedRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setStepDir('forward');
        setStep(2);
        startCountdown();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 2: Verify OTP → login ── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token && data.user) {
          // Store auth data via useAuth hook
          login(data.token, data.user);
        }
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid code. Please try again.');
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, role: selectedRole }),
      });
      if (res.ok) {
        startCountdown();
        setOtp('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to resend code. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStepDir('back');
    setStep(1);
    setOtp('');
    setError('');
  };

  /* ── Focus border helpers ── */
  const inputStyle = (focused) => ({
    borderColor: focused ? '#1A37AA' : '#e8ecf4',
    background:  focused ? '#fff' : '#f8f9fc',
    boxShadow:   focused ? '0 0 0 3px rgba(26,55,170,0.08)' : 'none',
  });

  /* ═══ RENDER ═══ */
  return (
    <div className="login-root">
      <div className="lp-right">
        <div className="lp-form-wrap" key={step} style={{
          animation: step === 1
            ? (stepDir === 'back' ? 'stepSlideBack 0.35s ease both' : 'fadeUp 0.45s ease both')
            : 'stepSlide 0.35s ease both',
        }}>

          {/* Step label + title */}
          <div className="lp-form-header">
            <h1 className="lp-form-title">
              {step === 1 ? 'Welcome back' : 'Verify your identity'}
            </h1>
            <p className="lp-form-subtitle">
              {step === 1
                ? 'Enter your registered phone number, password, and role to continue.'
                : `A 6-digit code was sent to your phone. Enter it below.`}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="lp-error">
              <IcAlert />
              <span className="lp-error-text">{error}</span>
            </div>
          )}

          {/* ── STEP 1: Phone + Password + Role ── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              {/* Phone */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="phone">Phone Number</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-prefix">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    placeholder="9876543210"
                    className="lp-input"
                    style={{ paddingLeft: '52px', ...inputStyle(phoneFocused) }}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="password">Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><IcLock /></span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    placeholder="Enter your password"
                    className="lp-input"
                    style={{ paddingRight: '44px', ...inputStyle(passFocused) }}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="lp-eye-btn"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <IcEyeOff /> : <IcEye />}
                  </button>
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="role">Role</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><IcUser /></span>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    onFocus={() => setRoleFocused(true)}
                    onBlur={() => setRoleFocused(false)}
                    className="lp-role-select"
                    style={{ ...inputStyle(roleFocused) }}
                    required
                  >
                    <option value="" disabled>Select your role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                  </select>
                  <span className="lp-dropdown-arrow"><IcChevronDown /></span>
                </div>
              </div>

              <button type="submit" className="lp-btn" disabled={loading}>
                {loading
                  ? <><span className="lp-spinner" /> Verifying credentials…</>
                  : <>Continue <IcArrow /></>}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              {/* Phone display */}
              <div className="lp-otp-info">
                <div className="lp-otp-phone-label">Code sent to</div>
                <div className="lp-otp-phone">+91 {phone}</div>
              </div>

              {/* OTP field */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="otp">6-Digit Verification Code</label>
                <input
                  ref={otpRef}
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={() => setOtpFocused(true)}
                  onBlur={() => setOtpFocused(false)}
                  placeholder="000000"
                  maxLength={6}
                  className="lp-otp-input"
                  style={inputStyle(otpFocused)}
                  autoComplete="one-time-code"
                  required
                />
                <p className="lp-otp-hint">
                  {otp.length}/6 digits entered
                  {otp.length === 6 && <span style={{ color: '#52ba4f', marginLeft: 6 }}>✓</span>}
                </p>
              </div>

              <button type="submit" className="lp-btn" disabled={loading}>
                {loading
                  ? <><span className="lp-spinner" /> Verifying code…</>
                  : <>Verify &amp; Sign In <IcArrow /></>}
              </button>

              {/* Back / Resend */}
              <div className="lp-otp-actions">
                <button type="button" className="lp-back-btn" onClick={handleBack}>
                  <IcBack /> Change details
                </button>
                {countdown > 0
                  ? <span className="lp-countdown">Resend in {countdown}s</span>
                  : (
                    <button
                      type="button"
                      className="lp-resend-btn"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      Resend code
                    </button>
                  )}
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="lp-form-footer">
            <p className="lp-copyright">
              © {new Date().getFullYear()} Unique Sorter And Equipment Pvt. Ltd. · All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
