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
  const [birthdate, setBirthdate] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBirthdateChange = (e) => {
    const val = e.target.value;
    setBirthdate(val);
    if (val) {
      const dob = new Date(val);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge >= 0 && calculatedAge <= 130) {
          setAge(String(calculatedAge));
        }
      }
    }
  };

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
      await authCalls.register({
        name,
        email,
        password,
        birthdate,
        age,
        gender,
        address,
        role: 'customer'
      });
      router.push('/Collections');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1.3px',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    height: '42px',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '13px',
    boxSizing: 'border-box'
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
        padding: '68px 2.5vw 76px',
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

      {/* Wide Edge-to-Edge Customer Registration Card with Center Partition */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '95vw',
          maxWidth: '1360px',
          background: 'rgba(10, 10, 12, 0.84)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '12px',
          padding: '26px 34px',
          color: '#ffffff',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)'
        }}
      >
        {/* Card Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(255,255,255,0.14)'
          }}
        >
          <div>
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                display: 'block',
                marginBottom: '3px'
              }}
            >
              JOIN LARO SPORTS™ • CUSTOMER MEMBERSHIP
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
              CREATE CUSTOMER ACCOUNT
            </h2>
          </div>

          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Already registered?{' '}
            <Link
              href="/Login"
              style={{
                color: '#ffffff',
                fontWeight: 700,
                textDecoration: 'underline',
                marginLeft: '4px'
              }}
            >
              Sign In →
            </Link>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.16)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#fca5a5',
              padding: '9px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        {/* Two-Column Form Divided by a Center Partition */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1px 1fr',
            gap: '32px',
            alignItems: 'stretch'
          }}
        >
          {/* LEFT SIDE OF PARTITION: Personal Profile & Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1.8px',
                color: 'rgba(255,255,255,0.9)',
                textTransform: 'uppercase',
                marginBottom: '2px'
              }}
            >
              1. PERSONAL INFORMATION & ADDRESS
            </div>

            <div>
              <label style={labelStyle}>FULL NAME *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Dela Cruz"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.25fr 0.75fr 1.1fr',
                gap: '12px'
              }}
            >
              <div>
                <label style={labelStyle}>BIRTHDATE *</label>
                <input
                  type="date"
                  required
                  value={birthdate}
                  onChange={handleBirthdateChange}
                  style={{
                    ...inputStyle,
                    colorScheme: 'dark'
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>AGE *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="130"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Auto / Manual"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>GENDER *</label>
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    ...inputStyle,
                    background: '#121215',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>COMPLETE ADDRESS *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Unit No., Street, Barangay, City/Municipality, Province, Postal Code"
                style={inputStyle}
              />
            </div>
          </div>

          {/* CENTER VERTICAL PARTITION */}
          <div
            style={{
              width: '1px',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.05) 100%)',
              alignSelf: 'stretch'
            }}
          />

          {/* RIGHT SIDE OF PARTITION: Account Credentials & Submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '1.8px',
                  color: 'rgba(255,255,255,0.9)',
                  textTransform: 'uppercase',
                  marginBottom: '2px'
                }}
              >
                2. ACCOUNT CREDENTIALS
              </div>

              <div>
                <label style={labelStyle}>EMAIL ADDRESS *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}
              >
                <div>
                  <label style={labelStyle}>PASSWORD *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>CONFIRM PASSWORD *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                Age is auto-calculated from your birthdate, or you can enter it manually.
              </span>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '42px',
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
                {loading ? 'CREATING ACCOUNT...' : 'COMPLETE REGISTRATION'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
