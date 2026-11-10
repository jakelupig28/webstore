'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { VideoBackground } from '../../components/VideoBackground';
import { Loader } from '../../components/Loader';

export default function LoginPage() {
  const router = useRouter();
  const { authCalls } = useStore();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('laro_remember_email');
      const savedRole = localStorage.getItem('laro_remember_role');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
      if (savedRole === 'admin' || savedRole === 'customer') {
        setSelectedRole(savedRole);
      }
    }
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'admin') {
      if (!email || email === 'customer@larosports.com') {
        setEmail('admin@larosports.com');
        setPassword('admin123');
      }
    } else {
      if (!email || email === 'admin@larosports.com') {
        setEmail('customer@larosports.com');
        setPassword('customer123');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('laro_remember_email', email);
          localStorage.setItem('laro_remember_role', selectedRole);
        } else {
          localStorage.removeItem('laro_remember_email');
          localStorage.removeItem('laro_remember_role');
        }
      }
      const loggedInUser = await authCalls.login(email, password);
      if (loggedInUser.role === 'admin') {
        router.push('/Admin');
      } else {
        router.push('/Collections');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetMessage(`Password recovery instructions have been sent to ${resetEmail.trim()}.`);
  };

  const labelStyle = {
    display: 'block',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1.4px',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.72)',
    marginBottom: '6px',
    lineHeight: 1.2
  };

  const fieldHeight = '40px';
  const roleButtonHeight = '32px';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '70px 20px 76px',
        boxSizing: 'border-box'
      }}
    >
      <Loader />

      {/* Full-Screen Ambient Video Background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <VideoBackground
          src="/brand/video brand2.mp4"
          poster="/brand/background stash.jpg"
          style={{ opacity: 0.48 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.85) 100%)'
          }}
        />
      </div>

      {/* Centered Login Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(10, 10, 12, 0.86)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '12px',
          padding: '22px 28px',
          color: '#ffffff',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
          boxSizing: 'border-box'
        }}
      >
        {/* Symmetrical & Optically Centered Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            paddingBottom: '14px',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '2.2px',
              paddingLeft: '2.2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.52)',
              lineHeight: 1.2,
              marginBottom: '5px',
              display: 'block'
            }}
          >
            WE ONLY COME OUT AT NIGHT
          </span>
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '2px',
              paddingLeft: '2px',
              textTransform: 'uppercase',
              lineHeight: 1.15,
              margin: 0,
              color: '#ffffff'
            }}
          >
            {forgotMode ? 'RESET PASSWORD' : 'SIGN IN'}
          </h2>
        </div>

        {error && !forgotMode && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.16)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#fca5a5',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '14px',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        {forgotMode ? (
          <form
            onSubmit={handleForgotSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.5,
                margin: 0,
                textAlign: 'center'
              }}
            >
              Enter your registered email address and we&apos;ll send you a password reset link.
            </p>

            {resetMessage && (
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.16)',
                  border: '1px solid rgba(34, 197, 94, 0.45)',
                  color: '#86efac',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}
              >
                {resetMessage}
              </div>
            )}

            <div>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  height: fieldHeight,
                  padding: '0 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                height: fieldHeight,
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '1.8px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              SEND RESET LINK
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setResetMessage('');
              }}
              style={{
                width: '100%',
                height: roleButtonHeight,
                background: 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}
          >
            {/* 1. Select Role (Slim height, clean Customer / Admin labels) */}
            <div>
              <label style={labelStyle}>SELECT ROLE</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleSelectRole('customer')}
                  style={{
                    height: roleButtonHeight,
                    padding: '0 12px',
                    background:
                      selectedRole === 'customer' ? '#ffffff' : 'rgba(255,255,255,0.06)',
                    border:
                      selectedRole === 'customer'
                        ? '1px solid #ffffff'
                        : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: selectedRole === 'customer' ? '#000000' : '#ffffff',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11.5px',
                    fontWeight: 700,
                    letterSpacing: '0.4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  style={{
                    height: roleButtonHeight,
                    padding: '0 12px',
                    background:
                      selectedRole === 'admin' ? '#ffffff' : 'rgba(255,255,255,0.06)',
                    border:
                      selectedRole === 'admin'
                        ? '1px solid #ffffff'
                        : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: selectedRole === 'admin' ? '#000000' : '#ffffff',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11.5px',
                    fontWeight: 700,
                    letterSpacing: '0.4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* 2. Email Address */}
            <div>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  height: fieldHeight,
                  padding: '0 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 3. Password with Eye Icon & Remember Me / Forgot Password Row */}
            <div>
              <label style={labelStyle}>PASSWORD</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    height: fieldHeight,
                    padding: '0 40px 0 14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: showPassword ? '#ffffff' : 'rgba(255,255,255,0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row below Password input */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '8px'
                }}
              >
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    fontSize: '11.5px',
                    color: 'rgba(255,255,255,0.75)',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '13px',
                      height: '13px',
                      accentColor: '#ffffff',
                      cursor: 'pointer',
                      margin: 0
                    }}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setResetEmail(email || '');
                    setResetMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.78)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* 4. Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '2px',
                width: '100%',
                height: fieldHeight,
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '2px',
                paddingLeft: '2px',
                textTransform: 'uppercase',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'SIGNING IN...' : 'LOGIN'}
            </button>
          </form>
        )}

        <p
          style={{
            marginTop: '16px',
            marginBottom: 0,
            textAlign: 'center',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '12px',
            letterSpacing: '0.3px',
            color: 'rgba(255,255,255,0.65)'
          }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/Register"
            style={{
              color: '#ffffff',
              fontWeight: 700,
              textDecoration: 'underline',
              textUnderlineOffset: '2px'
            }}
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
