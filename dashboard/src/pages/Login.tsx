import { useState, useRef, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ZapturaLogo } from '../components/ZapturaLogo';
import './Login.css';

interface LoginProps {
  onLogin: (apiKey: string, role?: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const { t } = useTranslation();
  useDocumentTitle('Sign In — Zaptura WA');
  const containerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
    el.style.setProperty('--mouse-tilt-x', `${normX * 24}px`);
    el.style.setProperty('--mouse-tilt-y', `${normY * 18}px`);
    el.style.setProperty('--mouse-opacity', '1');
  };

  const handleMouseLeave = () => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--mouse-opacity', '0');
    el.style.setProperty('--mouse-tilt-x', '0px');
    el.style.setProperty('--mouse-tilt-y', '0px');
  };
  const finishWithToken = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': token,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as { message?: string }).message || t('login.invalidAccount'));
    }
    const data: { role?: string } = await response.json().catch(() => ({}));
    onLogin(token, data.role || 'user');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!email.trim() || !password) {
        setError(t('login.accountRequired'));
        return;
      }
      const response = await fetch(`${API_BASE_URL}/account/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await response.json().catch(() => ({}))) as { token?: string; message?: string };
      if (!response.ok || !data.token) {
        throw new Error(data.message || t('login.invalidAccount'));
      }
      await finishWithToken(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {/* Ambient background glow elements */}
      <div className="login-ambient" aria-hidden="true" />
      <div className="login-interactive-glow" aria-hidden="true" />
      <div className="login-grid-bg" aria-hidden="true" />

      <div className="login-top-bar">
        <Link to="/" className="login-back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <span className="register-trial-badge">
          <Sparkles size={14} /> 99.9% Uptime
        </span>
      </div>

      <div className="login-card">
        <div className="login-logo">
          <ZapturaLogo size={42} showText={true} subtitle="Cloud Gateway Portal" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">{t('login.email')}</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="dev@zapturawa.com"
                className={error ? 'error' : ''}
                autoComplete="email"
                aria-label={t('login.email')}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">{t('login.password')}</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={error ? 'error' : ''}
                autoComplete="current-password"
                aria-label={t('login.password')}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('common.hideApiKey') : t('common.showApiKey')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <span className="error-message">{error}</span>}

          <button type="submit" className="connect-btn" disabled={isLoading}>
            {isLoading ? <span>{t('login.connecting')}</span> : <span>Sign In to Dashboard</span>}
          </button>
        </form>

        <div className="login-security-tag">
          <ShieldCheck size={14} className="login-text-emerald" />
          <span>Encrypted Session Isolation · Zero Data Retention</span>
        </div>

        <p className="login-help">
          {t('login.noAccount')} <Link to="/register">{t('login.createAccount')}</Link>
        </p>
      </div>

      <footer className="login-footer">
        <span>© {new Date().getFullYear()} Zaptura WA Cloud Gateway</span>
      </footer>
    </div>
  );
}
