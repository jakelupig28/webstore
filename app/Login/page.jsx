'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../../context/StoreContext';

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
        minHeight: 'calc(100vh - 150px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(10, 10, 10, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '10px',
          padding: '36px 32px',
          color: '#ffffff',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
              display: 'block',
              marginBottom: '6px'
            }}
          >
            LARO SPORTS™ ACCOUNT
          </span>
          <h2
            style={{
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '1.5px',
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
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '18px',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.75)',
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
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.75)',
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
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              width: '100%',
              padding: '13px',
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
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.12)'
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              marginBottom: '10px'
            }}
          >
            QUICK DEMO CREDENTIALS (MYSQL SEEDED)
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => fillDemo('customer')}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.07)',
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
                background: 'rgba(255,255,255,0.07)',
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
            marginTop: '20px',
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

