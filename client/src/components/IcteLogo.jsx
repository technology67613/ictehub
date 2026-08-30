import React from 'react';

export default function IcteLogo({ size = 40, className = '' }) {
  return (
    <img
      src="/logo.png"
      alt="Buddha College of Nursing"
      style={{ height: `${size}px`, width: 'auto' }}
      className={`object-contain ${className}`}
    />
  );
}
