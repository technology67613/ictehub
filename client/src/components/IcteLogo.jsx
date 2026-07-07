import React from 'react';

export default function IcteLogo({ size = 32, withText = false, className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/main-logo.jpeg"
        alt="Buddha College of Nursing Logo"
        style={{ height: `${size}px`, width: 'auto' }}
        className="object-contain"
      />
    </div>
  );
}
