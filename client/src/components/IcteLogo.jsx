/**
 * IcteLogo — The official ICTE Hub brand logo mark.
 *
 * Design concept:
 *   - A hexagonal hub shape (6-sided = "hub" / network / connectivity)
 *   - Inside: a stylised mortar board / academic cap
 *   - Left diagonal stroke = brim, top dot = board
 *   - Gradient: indigo → purple (tech + knowledge)
 *   - Works at any size: 24px favicon up to 96px hero
 *
 * Usage:
 *   <IcteLogo size={32} />           → icon only
 *   <IcteLogo size={32} withText />  → icon + "ICTE Hub" wordmark
 */

import React from 'react';

export default function IcteLogo({ size = 32, withText = false, className = '' }) {
  const id = `icte-grad-${size}`;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* ── Icon mark ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ICTE Hub logo"
        role="img"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>

        {/* Hexagon background */}
        <path
          d="M20 2 L36 11 L36 29 L20 38 L4 29 L4 11 Z"
          fill={`url(#${id})`}
        />

        {/* Mortar board brim (horizontal line) */}
        <line x1="11" y1="21" x2="29" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

        {/* Cap top (square board as diamond rotated 45°) */}
        <rect
          x="16.5" y="11"
          width="7" height="7"
          rx="1"
          transform="rotate(45 20 14.5)"
          fill="white"
        />

        {/* Tassel cord from center top */}
        <line x1="20" y1="17.5" x2="20" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />

        {/* Tassel drop (left side) */}
        <line x1="14" y1="21" x2="12" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="28" r="1.5" fill="white" />

        {/* Left column - represents one side of the hub */}
        <line x1="26" y1="21" x2="26" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="26" cy="28.5" r="1.5" fill="white" opacity="0.6" />
      </svg>

      {/* ── Wordmark ── */}
      {withText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-extrabold tracking-tight text-slate-900"
            style={{ fontSize: size * 0.45, lineHeight: 1.1 }}
          >
            ICTE
          </span>
          <span
            className="font-semibold tracking-widest text-indigo-600 uppercase"
            style={{ fontSize: size * 0.25, letterSpacing: '0.15em', lineHeight: 1.2 }}
          >
            Hub
          </span>
        </div>
      )}
    </div>
  );
}
