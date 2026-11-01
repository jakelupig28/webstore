'use client';

import React from 'react';

const DEFAULT_VIDEOS = [
  'JPwX8ihL97A',
  'L9iiwC0nFvI',
  'F4eIW1JOsoo',
  'Vv3WGcd29g0',
  'EfuWNNXkkuM',
  '6y64Dc8yeuQ',
  'EDFzeg_07wo'
];

export const YouTubeGallery = ({ videoIds = DEFAULT_VIDEOS }) => {
  return (
    <div className="thrdwrldpgtccgCategory">
      {videoIds.map((id) => (
        <div key={id} className="youtube-embed" style={{ marginBottom: '2vw' }}>
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title="ThrdWrldPrblmz Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: '4px', border: 'none', width: '100%', aspectRatio: '16/9', height: 'auto' }}
          />
        </div>
      ))}
    </div>
  );
};
