import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';
import type { ReactNode } from 'react';
import { ZapturaLogo } from '../components/ZapturaLogo';
import './Marketing.css';

interface MarketingShellProps {
  children: ReactNode;
}

export function MarketingShell({ children }: MarketingShellProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="zp-shell">
      {/* Glow gradient backdrop */}
      <div className="zp-shell-ambient" aria-hidden="true" />

      {/* Navigation Header */}
      <header className={`zp-nav-wrap ${scrolled || open ? 'zp-nav-scrolled' : ''}`}>
        <nav className="zp-nav">
          <Link to="/" className="zp-brand" aria-label="Zaptura Home" onClick={close}>
            <ZapturaLogo size={32} showText={true} />
          </Link>

          <div className="zp-nav-links">
            <a href="/#features">Features</a>
            <a href="/#demo">Live Demo</a>
            <a href="/#how-it-works">How It Works</a>
            <NavLink to="/pricing">Pricing</NavLink>
            <NavLink to="/docs">Documentation</NavLink>
          </div>

          <div className="zp-nav-cta">
            <Link to="/login" className="zp-btn zp-btn-ghost zp-btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="zp-btn zp-btn-glow zp-btn-sm">
              Get Started
              <ArrowRight size={14} className="zp-btn-arrow" />
            </Link>
            <button
              type="button"
              className="zp-menu-btn"
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle navigation menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="zp-mobile-links">
            <a href="/#features" onClick={close}>
              Features
            </a>
            <a href="/#demo" onClick={close}>
              Live Demo
            </a>
            <a href="/#how-it-works" onClick={close}>
              How It Works
            </a>
            <NavLink to="/pricing" onClick={close}>
              Pricing
            </NavLink>
            <NavLink to="/docs" onClick={close}>
              Documentation
            </NavLink>
            <div className="zp-mobile-actions">
              <Link to="/login" className="zp-btn zp-btn-ghost" onClick={close}>
                Sign In
              </Link>
              <Link to="/register" className="zp-btn zp-btn-glow" onClick={close}>
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="zp-main-content">{children}</main>

      {/* Modern High-Tech Footer */}
      <footer className="zp-site-footer">
        <div className="zp-footer-grid">
          <div className="zp-footer-brand-col">
            <Link to="/" className="zp-brand">
              <ZapturaLogo size={34} showText={true} subtitle="The Autonomous WhatsApp Cloud Engine" />
            </Link>
            <p className="zp-footer-desc">
              High-throughput, unofficial WhatsApp API platform built for modern development teams, agencies, and SaaS
              founders. Zero per-message fees. Real-time webhooks. Isolated multi-tenant security.
            </p>
            <div className="zp-status-badge">
              <span className="zp-status-pulse" />
              <span>Gateway Status: All Systems Operational (99.99%)</span>
            </div>
          </div>

          <div className="zp-footer-col">
            <h4>Platform</h4>
            <a href="/#features">Features</a>
            <a href="/#demo">Live Demo</a>
            <a href="/#how-it-works">Architecture</a>
            <Link to="/#pricing">Pricing Plans</Link>
          </div>

          <div className="zp-footer-col">
            <h4>Developers</h4>
            <Link to="/docs">Quickstart Guide</Link>
            <a href="/#code">Supported SDKs</a>
            <a href="/#faq">Technical FAQ</a>
            <a href="/api/docs" target="_blank" rel="noreferrer">
              Swagger UI
            </a>
          </div>

          <div className="zp-footer-col">
            <h4>Security & Trust</h4>
            <div className="zp-security-item">
              <ShieldCheck size={16} className="zp-text-emerald" />
              <span>AES-256 Session Encrypted</span>
            </div>
            <div className="zp-security-item">
              <Terminal size={16} className="zp-text-cyan" />
              <span>SSRF-Protected Sandboxing</span>
            </div>
            <p className="zp-mock-note">Instant activation with 3-day full access. No card required.</p>
          </div>
        </div>

        <div className="zp-footer-bar">
          <div className="zp-footer-copy">© {new Date().getFullYear()} Zaptura Cloud Systems. All rights reserved.</div>
          <div className="zp-footer-disclaimer">
            Zaptura is an independent developer gateway. WhatsApp is a registered trademark of Meta Platforms, Inc.
            Zaptura is not affiliated with, sponsored by, or endorsed by Meta.
          </div>
        </div>
      </footer>
    </div>
  );
}
