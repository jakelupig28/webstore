'use client';

import React, { useState } from 'react';

export const HoverImage = ({ primary, secondary, alt }) => {
  const [hovered, setHovered] = useState(false);
  const src = hovered && secondary && secondary !== primary ? secondary : primary;

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
};
