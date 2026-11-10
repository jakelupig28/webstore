'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { VideoBackground } from '../../components/VideoBackground';
import { Loader } from '../../components/Loader';

export default function LoginPage() {
  const router = useRouter();
  const { authCalls } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
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

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@larosports.com');
      setPassword('admin123');
    } else {
      setEmail('customer@larosports.com');
      setPassword('customer123');
    }
    setError('');
  };

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
        padding: '78px 20px 84px',
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
          background: 'rgba(10, 10, 12, 0.82)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '12px',
          padding: '28px 30px',
          color: '#ffffff',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              display: 'block',
              marginBottom: '4px'
            }}
          >
            WE ONLY COME OUT AT NIGHT
          </span>
          <h2
            style={{
              fontSize: '23px',
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: 0
            }}
          >
            SIGN IN
          </h2>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.16)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#fca5a5',
              padding: '9px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '14px',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '1.4px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.72)',
                marginBottom: '6px'
              }}
            >
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '1.4px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.72)',
                marginBottom: '6px'
              }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '11px 14px',
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
            disabled={loading}
            style={{
              marginTop: '4px',
              width: '100%',
              padding: '12px',
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'SIGNING IN...' : 'LOGIN'}
          </button>
        </form>

        {/* Quick Role Fill for Testing Customer vs Admin */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.12)'
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '9px',
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              marginBottom: '8px'
            }}
          >
            QUICK DEMO CREDENTIALS (MYSQL SEEDED)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fillDemo('customer')}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Customer Role
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Admin Role
            </button>
          </div>
        </div>

        <p
          style={{
            marginTop: '16px',
            marginBottom: 0,
            textAlign: 'center',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.65)'
          }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/Register"
            style={{
              color: '#ffffff',
              fontWeight: 700,
              textDecoration: 'underline'
            }}
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
