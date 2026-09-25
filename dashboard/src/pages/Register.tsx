import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ZapturaLogo } from '../components/ZapturaLogo';
import './Login.css';

interface RegisterProps {
  onLogin: (apiKey: string, role?: string) => void;
}

const VALID_PLANS = ['starter', 'pro', 'plus', 'business'];

export function Register({ onLogin }: RegisterProps) {
  const { t } = useTranslation();
  useDocumentTitle('Create Zaptura Account — Zaptura WA');
  const [searchParams] = useSearchParams();
  const planQuery = searchParams.get('plan')?.toLowerCase();
  const selectedPlan = (VALID_PLANS.includes(planQuery || '') ? planQuery : 'starter') as string;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || !email.trim() || password.length < 8) {
      setError(t('login.registerInvalid'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/account/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, plan: selectedPlan }),
      });
      const data = (await response.json().catch(() => ({}))) as { token?: string; message?: string };
      if (!response.ok || !data.token) {
        throw new Error(data.message || t('login.registerFailed'));
      }
      const validate = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': data.token },
      });
      const validated: { role?: string } = await validate.json().catch(() => ({}));
      onLogin(data.token, validated.role || 'user');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-ambient" aria-hidden="true" />
      <div className="login-grid-bg" aria-hidden="true" />

      <div className="login-top-bar">
        <Link to="/" className="login-back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <span className="register-trial-badge">
          <Sparkles size={14} /> 3-Day Free Trial
        </span>
      </div>

      <div className="login-card register-card">
        <div className="login-logo">
          <ZapturaLogo size={40} showText={true} subtitle="Create Developer Account" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="name">{t('login.name')}</label>
            <div className="input-wrapper">
              <input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                placeholder="Ada Lovelace"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">{t('login.email')}</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="dev@zaptura.io"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">{t('login.password')}</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                required
              />
            </div>
            {password.length > 0 && password.length < 8 && (
              <span className="register-hint">Password must be at least 8 characters</span>
            )}
          </div>

          {error && <span className="error-message">{error}</span>}

          <button type="submit" className="connect-btn" disabled={isLoading}>
            {isLoading ? t('login.registering') : 'Start 3-Day Free Trial'}
          </button>
        </form>

        <p className="login-help">
          {t('login.hasAccount')} <Link to="/login">Sign in</Link>
        </p>
      </div>

      <footer className="login-footer">
        <span>© {new Date().getFullYear()} Zaptura WA Cloud Gateway</span>
      </footer>
    </div>
  );
}
