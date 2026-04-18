'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: credentials, 2: otp
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send credentials to backend → Firebase verification → OTP sent
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate phone number (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Flow: Frontend → Backend → Firebase (verify credentials) → OTP generated → stored in Firebase
      const response = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // OTP field appears after successful verification
        setStep(2);
        startCountdown();
      } else {
        setError(data.message || 'Failed to verify credentials. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP → Backend → Firebase (verify OTP) → Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      // Flow: Frontend → Backend → Firebase (verify OTP) → Login
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth token
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // Redirect to inquiry form
        router.push('/inquiry');
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      if (response.ok) {
        startCountdown();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp('');
    setError('');
  };

  return (
    <div style={styles.container}>
      {/* Background decoration */}
      <div style={styles.bgDecoration}></div>
      <div style={styles.bgDecoration2}></div>
      
      <div style={styles.card}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={styles.title}>Unique Sorter</h1>
          <p style={styles.subtitle}>
            {step === 1 ? 'Welcome back! Please sign in to continue.' : 'Verify your identity'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Step 1: Phone & Password */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={styles.form}>
            {/* Phone Number */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.inputWrapper}>
                <span style={styles.countryCode}>+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  style={{...styles.input, ...styles.phoneInput}}
                  required
                />
                <div style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8898aa" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span>Password</span>
              </label>
              <div style={styles.inputWrapper}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={styles.input}
                  required
                />
                <div style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8898aa" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}>
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  Verifying...
                </>
              ) : (
                <>
                  Continue
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '8px'}}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            {/* OTP Info */}
            <div style={styles.otpInfo}>
              <div style={styles.otpIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A37AA" strokeWidth="1.5">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
              </div>
              <p style={styles.otpText}>Enter the 6-digit code sent to</p>
              <p style={styles.otpPhone}>+91 {phone}</p>
            </div>

            {/* OTP Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={styles.otpInput}
                maxLength={6}
                required
              />
            </div>

            {/* Verify Button */}
            <button type="submit" disabled={loading} style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}>
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </button>

            {/* Actions */}
            <div style={styles.actions}>
              <button type="button" onClick={handleBack} style={styles.backButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}>
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              
              {countdown > 0 ? (
                <span style={styles.countdown}>Resend in {countdown}s</span>
              ) : (
                <button type="button" onClick={handleResendOtp} disabled={loading} style={styles.resendButton}>
                  Resend Code
                </button>
              )}
            </div>
          </form>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            © {new Date().getFullYear()} Unique Sorter And Equipment Pvt. Ltd.
          </p>
          <p style={styles.footerSubtext}>All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecoration: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    top: '-200px',
    right: '-200px',
    filter: 'blur(60px)',
  },
  bgDecoration2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    bottom: '-100px',
    left: '-100px',
    filter: 'blur(40px)',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1)',
    padding: '48px 40px',
    position: 'relative',
    zIndex: 1,
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoIcon: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #1A37AA 0%, #2a4fc4 100%)',
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    boxShadow: '0 10px 25px rgba(26,55,170,0.3)',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '28px',
    fontWeight: 700,
    color: '#0f1923',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#8898aa',
    margin: 0,
    fontWeight: 400,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  errorText: {
    fontSize: '13px',
    color: '#dc2626',
    fontWeight: 500,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  countryCode: {
    position: 'absolute',
    left: '16px',
    fontWeight: 600,
    color: '#1A37AA',
    fontSize: '15px',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    fontSize: '15px',
    color: '#0f1923',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    fontFamily: "inherit",
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  phoneInput: {
    paddingLeft: '60px',
    letterSpacing: '0.5px',
  },
  inputIcon: {
    position: 'absolute',
    right: '14px',
    pointerEvents: 'none',
  },
  otpInput: {
    width: '100%',
    padding: '16px',
    fontSize: '28px',
    textAlign: 'center',
    letterSpacing: '12px',
    color: '#0f1923',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #1A37AA 0%, #2a4fc4 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(26,55,170,0.35)',
    transition: 'all 0.2s ease',
    marginTop: '8px',
    fontFamily: "inherit",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  otpInfo: {
    textAlign: 'center',
    padding: '24px 0',
    background: 'linear-gradient(135deg, rgba(26,55,170,0.05) 0%, rgba(42,79,196,0.05) 100%)',
    borderRadius: '12px',
    marginBottom: '8px',
  },
  otpIcon: {
    width: '56px',
    height: '56px',
    background: '#ffffff',
    borderRadius: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(26,55,170,0.15)',
  },
  otpText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 6px 0',
  },
  otpPhone: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1A37AA',
    margin: 0,
    letterSpacing: '0.5px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontFamily: "inherit",
  },
  resendButton: {
    background: 'none',
    border: 'none',
    color: '#1A37AA',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontFamily: "inherit",
  },
  countdown: {
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: 500,
  },
  footer: {
    textAlign: 'center',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  },
  footerText: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0 0 4px 0',
  },
  footerSubtext: {
    fontSize: '11px',
    color: '#d1d5db',
    margin: 0,
  },
};
