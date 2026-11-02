'use client';

import React, { useState } from 'react';
import { Loader } from '../../components/Loader';

export default function GalleryStudioPage() {
  const [activeTab, setActiveTab] = useState('film');

  return (
    <div className="mainContainer thrdwrldprbmlz" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
      <Loader />
      <div className="mainContainerThrdwrldprbmlz" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
        <section className="thrdwrldPage thrdwrld" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
          <div className="thrdwrldpgtContainer" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
            {/* Background Image / Ambient View */}
            <div className="thrdwrldpgtcVidBG">
              <img src="/brand/background stash.jpg" alt="LARO SPORTS Gallery Studio" />
            </div>

            <div
              className="thrdwrldpgtcContent"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '100vh',
                maxHeight: '100vh',
                padding: '70px 4vw 60px',
                boxSizing: 'border-box',
                overflow: 'hidden',
                gap: '32px'
              }}
            >
              {/* Left Column: Brand Lore & Navigation */}
              <div
                className="thrdwrldpgtccCollectives"
                style={{
                  width: '290px',
                  minWidth: '270px',
                  maxWidth: '310px',
                  height: 'auto',
                  paddingTop: 0
                }}
              >
                <div
                  className="thrdwrldpgtcccYoutube"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '14px'
                  }}
                >
                  <img
                    src="/brand/3dgiflogo.gif"
                    alt="LARO SPORTS Phantom"
                    style={{
                      width: '64px',
                      height: '64px',
                      minWidth: '64px',
                      minHeight: '64px',
                      borderRadius: '50%',
                      objectFit: 'contain',
                      background: 'transparent',
                      padding: 0,
                      border: 'none',
                      margin: 0
                    }}
                  />
                  <div>
                    <h6 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '0.5px' }}>
                      @LAROSPORTS
                    </h6>
                    <span
                      style={{
                        display: 'block',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '11px',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        marginTop: '3px',
                        fontWeight: 500
                      }}
                    >
                      EST. 2023
                    </span>
                  </div>
                </div>

                <h6 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '8px' }}>
                  LARO SPORTS™ STUDIO
                </h6>
                <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#ccc', marginBottom: '12px', paddingRight: 0 }}>
                  Welcome to LARO SPORTS, where passion meets street-fashion.
                  Founded by teenage friends, LARO SPORTS represents the relentless night hustle.
                  Our Logo, Phantom, symbolises the night owl as we pull the nights out to design clothes
                  that connect on streets.
                </p>

                {/* Campaign Video Caption - Plain Text In Between without Black Container */}
                {activeTab === 'film' && (
                  <div style={{ margin: '12px 0 16px 0' }}>
                    <h6 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.5px' }}>
                      PAIN STAIN 2025 — Official Campaign Video
                    </h6>
                    <p style={{ color: '#aaa', fontSize: '11px', letterSpacing: '0.8px', lineHeight: 1.4, margin: 0 }}>
                      Directed & produced for LARO SPORTS street culture. WE ONLY COME OUT AT NIGHT.
                    </p>
                  </div>
                )}

                <div className="thrdwrldpgtcccNavigation" style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('film')}
                    className={activeTab === 'film' ? 'active' : ''}
                  >
                    Brand Film
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('about')}
                    className={activeTab === 'about' ? 'active' : ''}
                  >
                    About Us
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dev')}
                    className={activeTab === 'dev' ? 'active' : ''}
                  >
                    Developer
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Content View */}
              <div
                className="thrdwrldpgtccGallery"
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  padding: 0
                }}
              >
                <div
                  className="thrdwrldpgtccgCategory"
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {activeTab === 'film' && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <video
                        controls
                        autoPlay
                        loop
                        playsInline
                        src="/brand/video brand2.mp4"
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: 'calc(100vh - 130px)',
                          maxWidth: 'calc((100vh - 130px) * (16 / 9))',
                          aspectRatio: '16/9',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          display: 'block',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.85)'
                        }}
                      />
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.85)',
                        border: '1px solid #222',
                        borderRadius: '8px',
                        padding: '24px',
                        color: '#fff',
                        lineHeight: 1.7
                      }}
                    >
                      <h4 style={{ marginBottom: '16px', letterSpacing: '1px' }}>
                        THE STORY OF LARO SPORTS
                      </h4>
                      <p style={{ color: '#ccc', marginBottom: '14px', fontSize: '13px' }}>
                        Welcome to LARO SPORTS, where passion meets street-fashion.
                        We are a dedicated team of five ambitious individuals who started from humble
                        beginnings, driven by the dream of making a mark in the clothing line industry.
                      </p>
                      <p style={{ color: '#ccc', marginBottom: '14px', fontSize: '13px' }}>
                        Our mission is to provide high-quality, stylish and on-trend clothing that caters to the
                        needs and preferences of young street hustlers.
                      </p>
                      <p style={{ color: '#ccc', marginBottom: '14px', fontSize: '13px' }}>
                        Founded by a group of teenage friends, LARO SPORTS was born out of a shared vision to
                        create a difference not only for our families but also to elevate the street clothing game
                        in the Philippines.
                      </p>
                      <div style={{ borderTop: '1px solid #333', paddingTop: '14px', marginTop: '14px' }}>
                        <p style={{ color: '#fff', fontWeight: 700, letterSpacing: '2px', fontSize: '12px' }}>
                          "WE ONLY COME OUT AT NIGHT."
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'dev' && (
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.85)',
                        border: '1px solid #222',
                        borderRadius: '8px',
                        padding: '24px',
                        color: '#fff',
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center'
                      }}
                    >
                      <img
                        src="/brand/jake1.jpg"
                        alt="Jake G. Lupig"
                        style={{
                          width: '120px',
                          height: '140px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #444'
                        }}
                      />
                      <div>
                        <h4 style={{ fontSize: '18px', marginBottom: '4px' }}>Jake G. Lupig</h4>
                        <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
                          Web Developer & Technical Architect
                        </p>
                        <p style={{ color: '#ccc', fontSize: '12px', lineHeight: 1.6 }}>
                          Engineered the modern Next.js high-performance webstore for LARO SPORTS with custom
                          video backgrounds, dynamic streetwear collections, and streamlined checkout.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
