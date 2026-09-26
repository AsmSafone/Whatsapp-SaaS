import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  Mail,
  Lock,
  CreditCard,
  Check,
  Loader2,
  Shield,
  Zap,
  CheckCircle2,
  Eye,
  EyeOff,
  Smartphone,
  Crown,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import {
  useAccountMeQuery,
  useUpdateProfileMutation,
  useChangePlanMutation,
  useChangePasswordMutation,
} from '../hooks/queries';
import { PageHeader } from '../components/PageHeader';
import './Profile.css';

interface PlanOption {
  id: 'starter' | 'pro' | 'plus' | 'business';
  name: string;
  price: number;
  sessions: number;
  popular?: boolean;
  blurb: string;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 6,
    sessions: 1,
    blurb: 'Dedicated single WhatsApp instance for individual builders.',
    features: [
      '1 Active WhatsApp Session',
      'Unlimited Outbound Messages',
      'Webhooks & HMAC Security',
      'OpenAPI & REST Access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Automation',
    price: 15,
    sessions: 3,
    popular: true,
    blurb: 'Multi-inbox automation with bi-directional bot routing.',
    features: [
      '3 Active WhatsApp Sessions',
      'Priority Queue Processing',
      'Bi-directional Webhooks',
      'Full Media & Polls Support',
    ],
  },
  {
    id: 'plus',
    name: 'Scale Plus',
    price: 30,
    sessions: 6,
    blurb: 'High-throughput engine for multi-agent support teams.',
    features: [
      '6 Active WhatsApp Sessions',
      'Session-Scoped API Keys',
      'Auto-Healing Watchdog',
      'High-Frequency Broadcasts',
    ],
  },
  {
    id: 'business',
    name: 'Enterprise Cloud',
    price: 45,
    sessions: 10,
    blurb: 'Maximum density for SaaS platforms, agencies, and large fleets.',
    features: [
      '10 Active WhatsApp Sessions',
      'Dedicated Worker Isolation',
      'Audit Logs & Team Access',
      'Full Platform Capabilities',
    ],
  },
];

export function Profile() {
  useDocumentTitle('Profile & Account Settings — Zaptura WA');
  const { t } = useTranslation();
  const toast = useToast();

  const { data: account, isLoading: isAccountLoading } = useAccountMeQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePlanMutation = useChangePlanMutation();
  const changePasswordMutation = useChangePasswordMutation();

  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sync profile data when account is loaded
  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setEmail(account.email || '');
    }
  }, [account]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('profile.personalInfo.nameRequired'));
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        email: email.trim() || undefined,
      });
      toast.success(t('profile.personalInfo.successMsg'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.errorGeneric');
      toast.error(message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error(t('profile.security.currentRequired'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t('profile.security.minLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('profile.security.mismatch'));
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast.success(t('profile.security.successMsg'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.errorGeneric');
      toast.error(message);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (account?.plan === planId) return;
    try {
      await changePlanMutation.mutateAsync(planId);
      const chosen = PLANS.find(p => p.id === planId)?.name ?? planId;
      toast.success(t('profile.plans.successMsg', { plan: chosen }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('profile.plans.failedMsg');
      toast.error(message);
    }
  };

  if (isAccountLoading) {
    return (
      <div className="profile-page loading">
        <div className="profile-loader">
          <Loader2 className="animate-spin" size={32} />
          <p>{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  const currentPlan = account?.plan?.toLowerCase() || 'starter';
  const sessionCount = account?.sessionCount ?? 0;
  const sessionLimit = account?.sessionLimit ?? 1;
  const usagePercentage = Math.min(100, Math.round((sessionCount / Math.max(1, sessionLimit)) * 100));

  return (
    <div className="profile-page">
      <PageHeader
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
      />

      {/* Account Overview Header Card */}
      <section className="profile-overview-card" aria-label="Account Overview">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            <UserIcon size={32} />
          </div>
          <div className="profile-identity">
            <div className="profile-name-row">
              <h2 className="profile-display-name">{account?.name || 'Administrator'}</h2>
              {account?.role && (
                <span className="profile-role-badge">
                  <Shield size={13} />
                  {account.role}
                </span>
              )}
              <span className="profile-plan-badge">
                <Crown size={13} />
                {currentPlan.toUpperCase()}
              </span>
            </div>
            <p className="profile-email-meta">
              <Mail size={14} />
              {account?.email || 'No email associated'}
            </p>
          </div>
        </div>

        <div className="profile-quota-summary">
          <div className="quota-summary-header">
            <span className="quota-label">
              <Smartphone size={14} />
              {t('profile.overview.sessionLabel')}
            </span>
            <span className="quota-numbers">
              <strong>{sessionCount}</strong> / {sessionLimit} {t('common.active').toLowerCase()}
            </span>
          </div>
          <div
            className="quota-progress-track"
            role="progressbar"
            aria-valuenow={sessionCount}
            aria-valuemin={0}
            aria-valuemax={sessionLimit}
            aria-label="Session Quota Usage"
          >
            <div className="quota-progress-fill" style={{ width: `${usagePercentage}%` }} />
          </div>
        </div>
      </section>

      <div className="profile-grid">
        {/* Personal Details Form */}
        <section className="profile-card" aria-labelledby="personal-info-heading">
          <div className="profile-card-header">
            <div className="profile-card-icon">
              <UserIcon size={20} />
            </div>
            <div>
              <h3 id="personal-info-heading">{t('profile.personalInfo.heading')}</h3>
              <p className="profile-card-desc">{t('profile.personalInfo.desc')}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label htmlFor="profile-name-input">{t('profile.personalInfo.nameLabel')}</label>
              <div className="input-with-icon">
                <UserIcon size={16} className="input-icon" />
                <input
                  id="profile-name-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('profile.personalInfo.namePlaceholder')}
                  aria-label={t('profile.personalInfo.nameLabel')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profile-email-input">{t('profile.personalInfo.emailLabel')}</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="profile-email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('profile.personalInfo.emailPlaceholder')}
                  aria-label={t('profile.personalInfo.emailLabel')}
                />
              </div>
              <span className="field-hint">{t('profile.personalInfo.emailHint')}</span>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={updateProfileMutation.isPending}
                aria-label={t('profile.personalInfo.saveBtn')}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t('profile.personalInfo.saving')}
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {t('profile.personalInfo.saveBtn')}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Change Password Form */}
        <section className="profile-card" aria-labelledby="security-heading">
          <div className="profile-card-header">
            <div className="profile-card-icon">
              <Lock size={20} />
            </div>
            <div>
              <h3 id="security-heading">{t('profile.security.heading')}</h3>
              <p className="profile-card-desc">{t('profile.security.desc')}</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group">
              <label htmlFor="profile-current-password">{t('profile.security.currentPassword')}</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="profile-current-password"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder={t('profile.security.currentPasswordPlaceholder')}
                  aria-label={t('profile.security.currentPassword')}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('profile.security.hidePassword') : t('profile.security.showPassword')}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profile-new-password">{t('profile.security.newPassword')}</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="profile-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={t('profile.security.newPasswordPlaceholder')}
                  aria-label={t('profile.security.newPassword')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profile-confirm-password">{t('profile.security.confirmPassword')}</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="profile-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder={t('profile.security.confirmPasswordPlaceholder')}
                  aria-label={t('profile.security.confirmPassword')}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={changePasswordMutation.isPending}
                aria-label={t('profile.security.updateBtn')}
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t('profile.security.updating')}
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    {t('profile.security.updateBtn')}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Subscription Plans Section */}
      <section className="profile-plans-section" aria-labelledby="plan-section-heading">
        <div className="profile-plans-header">
          <div className="plans-title-group">
            <div className="profile-card-icon">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 id="plan-section-heading">{t('profile.plans.heading')}</h3>
              <p className="profile-card-desc">{t('profile.plans.desc')}</p>
            </div>
          </div>
          <div className="current-plan-indicator">
            <span className="indicator-eyebrow">{t('profile.plans.activeTier')}</span>
            <strong className="indicator-name">{currentPlan.toUpperCase()}</strong>
          </div>
        </div>

        <div className="plans-grid">
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const isSwitching = changePlanMutation.isPending && changePlanMutation.variables === plan.id;

            return (
              <div key={plan.id} className={`plan-card ${isCurrent ? 'active' : ''} ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && (
                  <div className="plan-badge-popular">
                    <Zap size={12} />
                    <span>{t('profile.plans.mostPopular')}</span>
                  </div>
                )}

                <div className="plan-card-body">
                  <div className="plan-card-meta">
                    <h4 className="plan-title">{plan.name}</h4>
                    <p className="plan-blurb">{plan.blurb}</p>
                  </div>

                  <div className="plan-pricing">
                    <span className="price-currency">$</span>
                    <span className="price-amount">{plan.price}</span>
                    <span className="price-period">{t('profile.plans.perMonth')}</span>
                  </div>

                  <div className="plan-sessions-pill">
                    <Smartphone size={14} />
                    <span>
                      {t('profile.plans.upTo')} <strong>{plan.sessions}</strong> WhatsApp{' '}
                      {plan.sessions === 1 ? t('profile.plans.session') : t('profile.plans.sessions')}
                    </span>
                  </div>

                  <ul className="plan-features-list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="plan-feature-item">
                        <CheckCircle2 size={15} className="feature-check" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="plan-card-footer">
                  {isCurrent ? (
                    <button
                      type="button"
                      className="btn-plan current"
                      disabled
                      aria-label={`${t('profile.plans.currentPlan')}: ${plan.name}`}
                    >
                      <Check size={16} />
                      {t('profile.plans.currentPlan')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-plan upgrade"
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={changePlanMutation.isPending}
                      aria-label={t('profile.plans.switchTo', { name: plan.name })}
                    >
                      {isSwitching ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {t('profile.plans.switching')}
                        </>
                      ) : (
                        <>{t('profile.plans.switchTo', { name: plan.name })}</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
