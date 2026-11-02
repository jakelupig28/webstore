'use client';

import React, { useState } from 'react';
import { Loader } from '../../components/Loader';

export default function GalleryStudioPage() {
  const [activeTab, setActiveTab] = useState('film');

  return (
    <div className="mainContainer thrdwrldprbmlz">
      <Loader />
      <div className="mainContainerThrdwrldprbmlz">
        <section className="thrdwrldPage thrdwrld">
          <div className="thrdwrldpgtContainer">
            {/* Background Image / Ambient View */}
            <div className="thrdwrldpgtcVidBG">
              <img src="/brand/background stash.jpg" alt="LARO SPORTS Gallery Studio" />
            </div>

            <div className="thrdwrldpgtcContent">
              {/* Left Column: Brand Lore & Navigation */}
              <div className="thrdwrldpgtccCollectives">
                <div
                  className="thrdwrldpgtcccYoutube"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '1.2vw'
                  }}
                >
                  <img
                    src="/brand/3dgiflogo.gif"
                    alt="LARO SPORTS Phantom"
                    style={{
                      width: '74px',
                      height: '74px',
                      minWidth: '74px',
                      minHeight: '74px',
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
                        marginTop: '4px',
                        fontWeight: 500
                      }}
                    >
                      EST. 2023
                    </span>
                  </div>
                </div>

                <h6>LARO SPORTS™ STUDIO</h6>
                <p>
                  Welcome to LARO SPORTS, where passion meets street-fashion.
                  Founded by teenage friends, LARO SPORTS represents the relentless night hustle.
                  Our Logo, Phantom, symbolises the night owl as we pull the nights out to design clothes
                  that connect on streets.
                </p>

                <div className="thrdwrldpgtcccNavigation">
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

                {/* Left Side Caption (Active when viewing Brand Film) */}
                {activeTab === 'film' && (
                  <div
                    style={{
                      marginTop: '24px',
                      background: 'rgba(0,0,0,0.85)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '16px'
                    }}
                  >
                    <h6 style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.5px' }}>
                      PAIN STAIN 2025 — Official Campaign Video
                    </h6>
                    <p style={{ color: '#aaa', fontSize: '11px', letterSpacing: '0.8px', lineHeight: 1.5, margin: 0 }}>
                      Directed & produced for LARO SPORTS street culture. WE ONLY COME OUT AT NIGHT.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Content View */}
              <div className="thrdwrldpgtccGallery">
                <div className="thrdwrldpgtccgCategory">
                  {activeTab === 'film' && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px'
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
                          maxHeight: 'calc(100vh - 140px)',
                          aspectRatio: '16/9',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          display: 'block',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
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
