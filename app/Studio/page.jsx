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
                <div className="thrdwrldpgtcccYoutube">
                  <img
                    src="/brand/3dgiflogo.gif"
                    alt="LARO SPORTS Phantom"
                    style={{ background: 'transparent', padding: 0, border: 'none' }}
                  />
                  <div>
                    <h6>@LAROSPORTS</h6>
                    <span
                      style={{
                        display: 'block',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '11px',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        marginTop: '4px'
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
              </div>

              {/* Right Column: Interactive Content View */}
              <div className="thrdwrldpgtccGallery">
                <div className="thrdwrldpgtccgCategory">
                  {activeTab === 'film' && (
                    <div style={{ width: '100%', marginBottom: '20px' }}>
                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: 'transparent',
                          border: 'none',
                          padding: 0
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
                            maxHeight: 'calc(100vh - 170px)',
                            aspectRatio: '16/9',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            display: 'block',
                            background: '#000'
                          }}
                        />
                        <div style={{ padding: '10px 2px' }}>
                          <h6 style={{ color: '#fff', fontSize: '15px', marginBottom: '4px' }}>
                            PAIN STAIN 2025 — Official Campaign Video
                          </h6>
                          <p style={{ color: '#888', fontSize: '12px' }}>
                            Directed & produced for LARO SPORTS street culture. WE ONLY COME OUT AT NIGHT.
                          </p>
                        </div>
                      </div>
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
