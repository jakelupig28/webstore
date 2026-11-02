'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { FacebookIcon, InstagramIcon, TikTokIcon, CartIcon, SpeakerIcon, SpeakerMuteIcon } from './Icons';

export const BottomNav = () => {
  const { navCalls, cartCalls, videoBG } = useStore();
  const pathname = usePathname();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 500);
    if (typeof window !== 'undefined') {
      setIsDesktop(window.innerWidth > 500);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const totalQty = cartCalls.cart?.totalQuantity || 0;
  const isStudio = pathname?.toLowerCase().includes('studio') || pathname?.toLowerCase().includes('thrdwrldprblmz');

  if (!isDesktop) return null;

  return (
    <nav className="botNavigation">
      <div className="botNavHeader">
        <div className="btnvhBtns">
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
              Studio
            </button>
          </Link>

          <Link href="/Cart">
            <button
              onClick={() => navCalls.handlePageClick('Cart')}
              className={pathname.toLowerCase().includes('cart') ? 'active cart' : ''}
            >
              <CartIcon className="icons" />
              {totalQty > 0 && <sup>{totalQty}</sup>}
            </button>
          </Link>

          <a
            href="https://www.facebook.com/share/1KCwrEWbat/"
            target="_blank"
            rel="noopener noreferrer"
            className="btnvhbSocials"
            title="LARO SPORTS on Facebook"
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
            title="LARO SPORTS on Instagram"
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
            title="LARO SPORTS on TikTok"
          >
            <button type="button">
              <TikTokIcon />
            </button>
          </a>

          {/* Custom Minimalist Volume Control (Hidden on Studio page) */}
          {!isStudio && (
            <div
              className="btnvhbVolume customVolumeWrapper"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                type="button"
                onClick={() => videoBG.setVolume(videoBG.volume === 0 ? 50 : 0)}
                title={videoBG.volume === 0 ? 'Unmute' : `Volume: ${videoBG.volume}%`}
                className="volumeBtn"
              >
                {videoBG.volume === 0 ? <SpeakerMuteIcon /> : <SpeakerIcon />}
              </button>

              {showVolumeSlider && (
                <div className="customVolumePopup">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={videoBG.volume}
                    onChange={e => videoBG.setVolume(Number(e.target.value))}
                    className="sleekVolumeSlider"
                    style={{
                      background: `linear-gradient(to right, #ffffff ${videoBG.volume}%, rgba(255,255,255,0.2) ${videoBG.volume}%)`
                    }}
                  />
                  <span className="volumePercent">
                    {videoBG.volume}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
