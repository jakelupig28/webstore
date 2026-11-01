'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { FacebookIcon, InstagramIcon, TikTokIcon, MenuIcon } from './Icons';

export const Navbar = () => {
  const { navCalls } = useStore();
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

  return (
    <nav style={{ paddingTop: isMobile ? '12px' : '18px' }}>
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
              <Link href="/Thrdwrldprblmz">
                <button
                  onClick={() => navCalls.handlePageClick('Studio')}
                  className={pathname.toLowerCase().includes('studio') || pathname.toLowerCase().includes('thrdwrldprblmz') ? 'active thrdwrldprblmz' : ''}
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
            marginTop: isMobile ? '8px' : '15px'
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
                  fontSize: isMobile ? '20px' : '26px',
                  letterSpacing: '2.5px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  margin: 0
                }}
              >
                LARO SPORTS™
              </h5>
            </Link>
          </div>

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
