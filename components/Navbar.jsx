'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { FacebookIcon, InstagramIcon, TikTokIcon, MenuIcon } from './Icons';

export const Navbar = () => {
  const { navCalls, authCalls } = useStore();
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isMobile = windowWidth <= 500;
  const user = authCalls?.user;
  const isCheckout = pathname?.toLowerCase().includes('checkout');
  const isHomePage = pathname === '/';

  return (
    <nav style={{ paddingTop: isMobile ? '12px' : '16px' }}>
      <div className="mainNavContainer">
        {/* Mobile slide-in shadow overlay */}
        {isMobile && navCalls.viewMobileNav && (
          <div className="mnnvcntnerShadow" onClick={() => navCalls.setViewMobileNav(false)} />
        )}

        {/* Mobile menu drawer */}
        {isMobile && (
          <div className={`mnnvcntnerMobile ${navCalls.viewMobileNav ? 'active' : ''}`}>
            <div className="mnnvcntnermHeader" />
            <div className="mnnvcntnermContent">
              <Link href="/">
                <button
                  onClick={() => navCalls.handlePageClick('Home')}
                  className={pathname === '/' ? 'active home' : ''}
                >
                  Home
                </button>
              </Link>
              <Link href="/Collections">
                <button
                  onClick={() => navCalls.handlePageClick('Collections')}
                  className={pathname.toLowerCase().includes('collections') ? 'active collections' : ''}
                >
                  Collections
                </button>
              </Link>
              <Link href="/Lookbook">
                <button
                  onClick={() => navCalls.handlePageClick('Lookbook')}
                  className={pathname.toLowerCase().includes('lookbook') ? 'active lookbook' : ''}
                >
                  Lookbook
                </button>
              </Link>
              <Link href="/Studio">
                <button
                  onClick={() => navCalls.handlePageClick('Studio')}
                  className={pathname.toLowerCase().includes('studio') || pathname.toLowerCase().includes('thrdwrldprblmz') ? 'active studio' : ''}
                >
                  Gallery Studio
                </button>
              </Link>
              <Link href="/Cart">
                <button
                  onClick={() => navCalls.handlePageClick('Cart')}
                  className={pathname.toLowerCase().includes('cart') ? 'active cart' : ''}
                >
                  Cart
                </button>
              </Link>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link href="/Admin">
                      <button
                        onClick={() => navCalls.handlePageClick('Admin')}
                        className={pathname.toLowerCase().includes('admin') ? 'active admin' : ''}
                      >
                        Admin Panel
                      </button>
                    </Link>
                  )}
                  <Link href="/Orders">
                    <button
                      onClick={() => navCalls.handlePageClick('Orders')}
                      className={pathname.toLowerCase().includes('orders') ? 'active orders' : ''}
                    >
                      My Orders
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      navCalls.setViewMobileNav(false);
                      authCalls.logout();
                    }}
                  >
                    Logout ({user.name})
                  </button>
                </>
              ) : (
                <Link href="/Login">
                  <button
                    onClick={() => navCalls.handlePageClick('Login')}
                    className={pathname.toLowerCase().includes('login') ? 'active login' : ''}
                  >
                    Login
                  </button>
                </Link>
              )}
            </div>

            <div className="mnnvcntnermSocials">
              <h5>LARO SPORTS Socials:</h5>
              <div className="mnnvcntnerms">
                <a
                  href="https://www.facebook.com/share/1KCwrEWbat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnvhbSocials"
                >
                  <button type="button">
                    <FacebookIcon />
                  </button>
                </a>
                <a
                  href="https://www.instagram.com/larosportsclub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnvhbSocials"
                >
                  <button type="button">
                    <InstagramIcon />
                  </button>
                </a>
                <a
                  href="https://www.tiktok.com/@larosports"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnvhbSocials"
                >
                  <button type="button">
                    <TikTokIcon />
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Desktop & Mobile Main Nav bar with Centered Brand Title */}
        <div
          className="navContainer website"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginTop: isMobile ? '6px' : '10px'
          }}
        >
          <div
            className="navContent center"
            style={{
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Link href="/" onClick={() => navCalls.handlePageClick('Home')}>
              <h5
                style={{
                  color: '#ffffff',
                  fontFamily: "'Poppins', 'Arial Black', sans-serif",
                  fontSize: isMobile ? '22px' : '28px',
                  letterSpacing: '3px',
                  fontWeight: 900,
                  WebkitTextStroke: '0.8px #ffffff',
                  textTransform: 'uppercase',
                  margin: 0,
                  textShadow: '0 2px 14px rgba(0,0,0,0.85)'
                }}
              >
                LARO SPORTS™
              </h5>
            </Link>
          </div>

          {!isMobile && (
            <div
              style={{
                position: 'absolute',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                zIndex: 50
              }}
            >
              {user && !isCheckout ? (
                <>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.8)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(8px)',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.14)'
                    }}
                  >
                    {user.role === 'admin' ? 'ADMIN:' : ''} {user.name}
                  </span>
                  {user.role === 'admin' ? (
                    <Link
                      href="/Admin"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '4px',
                        background: pathname?.toLowerCase().includes('admin') ? '#ffffff' : 'rgba(10,10,10,0.75)',
                        backdropFilter: 'blur(8px)',
                        color: pathname?.toLowerCase().includes('admin') ? '#000000' : '#ffffff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '1.2px',
                        textTransform: 'uppercase',
                        textDecoration: 'none'
                      }}
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <Link
                      href="/Orders"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '4px',
                        background: pathname?.toLowerCase().includes('orders') ? '#ffffff' : 'rgba(10,10,10,0.75)',
                        backdropFilter: 'blur(8px)',
                        color: pathname?.toLowerCase().includes('orders') ? '#000000' : '#ffffff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '1.2px',
                        textTransform: 'uppercase',
                        textDecoration: 'none'
                      }}
                    >
                      My Orders
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => authCalls.logout()}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      background: 'rgba(10,10,10,0.75)',
                      backdropFilter: 'blur(8px)',
                      color: 'rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : !user && isHomePage ? (
                <>
                  <Link
                    href="/Login"
                    style={{
                      padding: '6px 15px',
                      borderRadius: '4px',
                      background: 'rgba(10,10,10,0.72)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.32)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1.2px',
                      textTransform: 'uppercase',
                      textDecoration: 'none'
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/Register"
                    style={{
                      padding: '6px 15px',
                      borderRadius: '4px',
                      background: '#ffffff',
                      color: '#000000',
                      border: '1px solid #ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1.2px',
                      textTransform: 'uppercase',
                      textDecoration: 'none'
                    }}
                  >
                    Register
                  </Link>
                </>
              ) : null}
            </div>
          )}

          {isMobile && (
            <div
              className="navContent right"
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <div className="navPageContainer mobile">
                <button
                  type="button"
                  onClick={() => navCalls.setViewMobileNav(true)}
                  aria-label="Open navigation menu"
                >
                  <MenuIcon className="icons" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
