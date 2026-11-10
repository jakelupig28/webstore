'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { VideoBackground } from '../../components/VideoBackground';
import { Loader } from '../../components/Loader';

export default function RegisterPage() {
  const router = useRouter();
  const { authCalls } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await authCalls.register({ name, email, password, role });
      if (newUser.role === 'admin') {
        router.push('/Admin');
      } else {
        router.push('/Collections');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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

      {/* Centered Register Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(10, 10, 12, 0.82)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '12px',
          padding: '26px 28px',
          color: '#ffffff',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
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
            JOIN LARO SPORTS™
          </span>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: 0
            }}
          >
            CREATE ACCOUNT
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.72)',
                  marginBottom: '5px'
                }}
              >
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Dela Cruz"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
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
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.72)',
                  marginBottom: '5px'
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
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Account Role Selection: Customer vs Admin */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.72)',
                marginBottom: '5px'
              }}
            >
              ACCOUNT ROLE
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('customer')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: role === 'customer' ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                  background: role === 'customer' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  color: role === 'customer' ? '#000000' : '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: role === 'admin' ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                  background: role === 'admin' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  color: role === 'admin' ? '#000000' : '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                Admin
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.72)',
                  marginBottom: '5px'
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 chars"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
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
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.72)',
                  marginBottom: '5px'
                }}
              >
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
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
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER ACCOUNT'}
          </button>
        </form>

        <p
          style={{
            marginTop: '14px',
            marginBottom: 0,
            textAlign: 'center',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.65)'
          }}
        >
          Already have an account?{' '}
          <Link
            href="/Login"
            style={{
              color: '#ffffff',
              fontWeight: 700,
              textDecoration: 'underline'
            }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
