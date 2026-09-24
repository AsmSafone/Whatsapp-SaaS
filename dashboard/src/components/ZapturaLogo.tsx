import React from 'react';

interface ZapturaLogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export function ZapturaLogo({ size = 36, showText = true, subtitle, className = '' }: ZapturaLogoProps) {
  return (
    <div
      className={`zaptura-logo-container ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
    >
      <div
        className="zaptura-logo-mark"
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="zapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle cx="50" cy="50" r="42" stroke="url(#zapGrad)" strokeWidth="3" strokeDasharray="6 4" opacity="0.4" />
          <path d="M32 26 L68 26 L42 50 L64 50 L28 78 L38 56 L24 56 Z" fill="url(#zapGrad)" filter="url(#logoGlow)" />
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                fontWeight: 800,
                fontSize: `${Math.max(16, Math.round(size * 0.58))}px`,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Zaptura
            </span>
            <span
              style={{
                fontSize: `${Math.max(10, Math.round(size * 0.28))}px`,
                fontWeight: 700,
                padding: '0.12rem 0.4rem',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#10b981',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              WA
            </span>
          </div>
          {subtitle && (
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
