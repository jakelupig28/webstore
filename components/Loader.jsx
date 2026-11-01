'use client';

import React from 'react';
import { useStore } from '../context/StoreContext';

export const Loader = () => {
  const { webLoader } = useStore();

  return (
    <div
      className={`loaderWrapper ${webLoader ? 'hide' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        transition: 'opacity 0.4s ease-out'
      }}
    >
      <img
        className={`loaderImage ${webLoader ? 'hide' : ''}`}
        src="/brand/3dgiflogo.gif"
        alt="LARO SPORTS Loading..."
        style={{
          width: '340px',
          height: '340px',
          maxWidth: '85vw',
          maxHeight: '85vw',
          objectFit: 'contain',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          margin: 0,
          padding: 0
        }}
      />
    </div>
  );
};
