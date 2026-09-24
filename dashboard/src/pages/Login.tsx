import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Languages, ArrowLeft, KeyRound, User, ShieldCheck } from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';
import { languageOptions, resolveSupportedLanguage, type SupportedLanguage } from '../i18n';
import { API_BASE_URL } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ZapturaLogo } from '../components/ZapturaLogo';
import './Login.css';

interface LoginProps {
  onLogin: (apiKey: string, role?: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const { t, i18n } = useTranslation();
  useDocumentTitle('Sign In — Zaptura WA');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'account' | 'key'>('account');
  const currentLang = resolveSupportedLanguage(i18n.resolvedLanguage || i18n.language);

  const changeLanguage = (language: SupportedLanguage) => {
    void i18n.changeLanguage(language);
  };

  const finishWithKey = async (key: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as { message?: string }).message || t('login.invalidKey'));
    }
    const data: { role?: string } = await response.json().catch(() => ({}));
    onLogin(key, data.role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'key') {
        if (!apiKey.trim()) {
          setError(t('login.apiKeyRequired'));
          return;
        }
        await finishWithKey(apiKey.trim());
        return;
      }
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
      await finishWithKey(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Ambient background glow elements */}
      <div className="login-ambient" aria-hidden="true" />
      <div className="login-grid-bg" aria-hidden="true" />

      {/* Top bar back link & language */}
      <div className="login-top-bar">
        <Link to="/" className="login-back-link">
          <ArrowLeft size={16} />
          <span>Back to Zaptura</span>
        </Link>

        <div className="login-language">
          <Languages size={16} />
          <CustomSelect
            value={currentLang}
            onChange={value => changeLanguage(value as SupportedLanguage)}
            options={languageOptions.map(opt => ({ value: opt.value, label: opt.label }))}
            ariaLabel={t('common.language')}
          />
        </div>
      </div>

      <div className="login-card">
        <div className="login-logo">
          <ZapturaLogo size={42} showText={true} subtitle="Cloud Gateway Portal" />
          <span className="version-info">
            {t('login.version', {
              version: __APP_VERSION__,
              date: new Date(__BUILD_TIME__).toISOString().slice(0, 10).replace(/-/g, ''),
            })}
          </span>
        </div>

        {/* Mode Selector Pill Tabs */}
        <div className="login-mode">
          <button
            type="button"
            className={mode === 'account' ? 'active' : ''}
            onClick={() => {
              setMode('account');
              setError('');
            }}
          >
            <User size={14} />
            <span>{t('login.accountTab')}</span>
          </button>
          <button
            type="button"
            className={mode === 'key' ? 'active' : ''}
            onClick={() => {
              setMode('key');
              setError('');
            }}
          >
            <KeyRound size={14} />
            <span>{t('login.apiKeyTab')}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'account' ? (
            <>
              <div className="input-group">
                <label htmlFor="email">{t('login.email')}</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="dev@zaptura.io"
                    className={error ? 'error' : ''}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="password">{t('login.password')}</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showKey ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={error ? 'error' : ''}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowKey(!showKey)}
                    aria-label={showKey ? t('common.hideApiKey') : t('common.showApiKey')}
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="input-group">
              <label htmlFor="apiKey">{t('login.apiKey')}</label>
              <div className="input-wrapper">
                <input
                  id="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="zap_live_..."
                  className={error ? 'error' : ''}
                  required
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowKey(!showKey)}
                  aria-label={showKey ? t('common.hideApiKey') : t('common.showApiKey')}
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {error && <span className="error-message">{error}</span>}

          <button type="submit" className="connect-btn" disabled={isLoading}>
            {isLoading ? (
              <span>{t('login.connecting')}</span>
            ) : (
              <span>{mode === 'account' ? 'Sign In to Dashboard' : t('login.connect')}</span>
            )}
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
