'use client';

import React, { useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const VideoBackground = ({
  src,
  poster,
  className = '',
  style
}) => {
  const { videoBG } = useStore();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, videoBG.volume / 100));
      videoRef.current.muted = videoBG.volume === 0;
    }
  }, [videoBG.volume]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      muted={videoBG.volume === 0}
      loop
      playsInline
      controls={false}
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      style={{ pointerEvents: 'none', objectFit: 'cover', width: '100%', height: '100%', ...style }}
    />
  );
};
