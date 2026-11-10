'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';
import { Loader } from '../../components/Loader';
import { VideoBackground } from '../../components/VideoBackground';
import { LOOKBOOK_DATA } from '../../data/lookbook';

const TABS = [
  { id: 'gallery1', label: 'GALLERY 01' },
  { id: 'gallery2', label: 'GALLERY 02' },
  { id: 'gallery3', label: 'GALLERY 03' }
];

export default function LookbookPage() {
  const { cartCalls } = useStore();
  const [activeTab, setActiveTab] = useState('gallery1');
  const [isMobile, setIsMobile] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 500);
    setIsMobile(window.innerWidth <= 500);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalQty = cartCalls.cart?.totalQuantity || 0;
  const currentItems = LOOKBOOK_DATA[activeTab] || [];

  return (
    <div className="mainContainer lookbook">
      <Loader />
      <div className="mainContainerLookbook">
        <section className="lookbookPage lookbookCollection">
          <div className="lkbkpglkbkcContainer">
            {/* Dynamic Collection Video Background */}
            <div className="lkbkpglkbkccVidBG">
              <VideoBackground
                src="/brand/video brand2.mp4"
                poster="/brand/background stash.jpg"
              />
            </div>

            <div className="lkbkpglkbkccContents">
              {/* Left Column: Collection Selector */}
              <div className="lkbkpglkbkcccCollections">
                <h6>LOOKBOOK</h6>
                <p>
                  You have {totalQty || '0'} item{totalQty === 1 ? '' : 's'} in your Cart
                </p>

                {!isMobile ? (
                  <div className="lkbkpglkbkcccNavigations">
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={activeTab === tab.id ? 'active' : ''}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="lkbkpglkbkcccNavigations">
                    <select
                      value={activeTab}
                      onChange={e => setActiveTab(e.target.value)}
                      className="collectionSelect"
                      style={{
                        backgroundColor: '#121215',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.25)',
                        padding: '8px 36px 8px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        width: '100%',
                        marginTop: '10px'
                      }}
                    >
                      {TABS.map(tab => (
                        <option key={tab.id} value={tab.id}>
                          {tab.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Editorial Lookbook Photography Gallery */}
              <div className="lkbkpglkbkcccGallery">
                <div className="lkbkpglkbkcccgCategory">
                  {currentItems.map((item, idx) => {
                    const content = (
                      <img
                        src={item.image}
                        alt={`Lookbook ${activeTab} ${idx + 1}`}
                        loading="lazy"
                        onClick={() => !item.productId && setLightboxImg(item.image)}
                        style={{ cursor: item.productId ? 'pointer' : 'zoom-in' }}
                      />
                    );

                    return item.productId ? (
                      <Link
                        key={idx}
                        className="lkbkpglkbkcccgc"
                        href={item.productId}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={idx} className="lkbkpglkbkcccgc">
                        {content}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Lightbox Modal for fullscreen image preview */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            padding: '20px'
          }}
        >
          <img
            src={lightboxImg}
            alt="Lookbook full view"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
}
