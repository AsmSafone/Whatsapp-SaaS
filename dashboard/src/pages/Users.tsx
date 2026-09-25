import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users as UsersIcon,
  Search,
  KeyRound,
  Trash2,
  Loader2,
  Check,
  AlertTriangle,
  Smartphone,
  Eye,
  EyeOff,
  Pencil,
  ShieldCheck,
  Shield,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import {
  useAdminUsersQuery,
  useAdminUpdatePlanMutation,
  useAdminResetPasswordMutation,
  useAdminDeleteUserMutation,
  useAccountMeQuery,
} from '../hooks/queries';
import type { AdminUser } from '../services/api';
import './Users.css';

const ALL_PLANS: Array<'starter' | 'pro' | 'plus' | 'business'> = ['starter', 'pro', 'plus', 'business'];

export function Users() {
  const { t } = useTranslation();
  useDocumentTitle(t('users.title'));
  const toast = useToast();

  const { data: users = [], isLoading, isError, refetch } = useAdminUsersQuery();
  const { data: me } = useAccountMeQuery();

  const updatePlanMutation = useAdminUpdatePlanMutation();
  const resetPasswordMutation = useAdminResetPasswordMutation();
  const deleteUserMutation = useAdminDeleteUserMutation();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Modals state
  const [planModalUser, setPlanModalUser] = useState<AdminUser | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'plus' | 'business'>('starter');

  const [passwordModalUser, setPasswordModalUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [deleteModalUser, setDeleteModalUser] = useState<AdminUser | null>(null);

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === 'all' || user.plan === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [users, searchQuery, planFilter]);

  // KPI Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const totalSessions = users.reduce((acc, u) => acc + (u.sessionCount || 0), 0);
    const starter = users.filter(u => u.plan === 'starter').length;
    const pro = users.filter(u => u.plan === 'pro').length;
    const plus = users.filter(u => u.plan === 'plus').length;
    const business = users.filter(u => u.plan === 'business').length;
    return { total, totalSessions, starter, pro, plus, business };
  }, [users]);

  // Handlers
  const handleOpenPlanModal = (user: AdminUser) => {
    setPlanModalUser(user);
    setSelectedPlan(user.plan);
  };

  const handleUpdatePlan = async () => {
    if (!planModalUser) return;
    try {
      await updatePlanMutation.mutateAsync({ id: planModalUser.id, plan: selectedPlan });
      toast.success(t('users.changePlanModal.success'));
      setPlanModalUser(null);
    } catch (err) {
      toast.error(t('common.errorGeneric'), (err as Error).message);
    }
  };

  const handleOpenPasswordModal = (user: AdminUser) => {
    setPasswordModalUser(user);
    setNewPassword('');
    setShowPassword(false);
  };

  const handleResetPassword = async () => {
    if (!passwordModalUser) return;
    if (newPassword.trim().length < 8) {
      toast.error(t('users.resetPasswordModal.lengthError'));
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({ id: passwordModalUser.id, newPassword: newPassword.trim() });
      toast.success(t('users.resetPasswordModal.success'));
      setPasswordModalUser(null);
      setNewPassword('');
    } catch (err) {
      toast.error(t('common.errorGeneric'), (err as Error).message);
    }
  };

  const handleOpenDeleteModal = (user: AdminUser) => {
    if (user.role === 'admin' && user.id === me?.id) {
      toast.error(t('users.deleteModal.cannotDeleteOwner'));
      return;
    }
    setDeleteModalUser(user);
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    try {
      await deleteUserMutation.mutateAsync(deleteModalUser.id);
      toast.success(t('users.deleteModal.success'));
      setDeleteModalUser(null);
    } catch (err) {
      toast.error(t('common.errorGeneric'), (err as Error).message);
    }
  };

  return (
    <div className="users-page">
      <PageHeader title={t('users.title')} subtitle={t('users.subtitle')} />

      <div className="users-content">
        {/* KPI Summary Cards */}
        <div className="users-stats-grid">
          <div className="user-stat-card">
            <div className="user-stat-icon purple">
              <UsersIcon size={22} />
            </div>
            <div className="user-stat-info">
              <span className="user-stat-value">{stats.total}</span>
              <span className="user-stat-label">{t('users.totalUsers')}</span>
            </div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon">
              <Smartphone size={22} />
            </div>
            <div className="user-stat-info">
              <span className="user-stat-value">{stats.totalSessions}</span>
              <span className="user-stat-label">{t('users.activeSessions')}</span>
            </div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon blue">
              <ShieldCheck size={22} />
            </div>
            <div className="user-stat-info">
              <span className="user-stat-value">{stats.pro + stats.plus + stats.business}</span>
              <span className="user-stat-label">Paid Plans (Pro/Plus/Biz)</span>
            </div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon amber">
              <Shield size={22} />
            </div>
            <div className="user-stat-info">
              <span className="user-stat-value">{stats.starter}</span>
              <span className="user-stat-label">{t('users.starterUsers')}</span>
            </div>
          </div>
        </div>

        {/* Controls: Search and Filter */}
        <div className="users-controls">
          <div className="users-search-box">
            <Search size={18} className="text-secondary" />
            <input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="users-filters">
            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
              <option value="all">{t('users.filterPlan')}</option>
              {ALL_PLANS.map(p => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)} Plan
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : isError ? (
            <div className="users-empty">
              <p>{t('common.errorGeneric')}</p>
              <button className="btn-secondary" onClick={() => refetch()} style={{ marginTop: '0.75rem' }}>
                {t('common.refresh')}
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="users-empty">
              <p>{searchQuery ? t('users.noUsersMatch') : t('users.noUsersFound')}</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>{t('users.columns.user')}</th>
                  <th>{t('users.columns.role')}</th>
                  <th>{t('users.columns.plan')}</th>
                  <th>{t('users.columns.sessions')}</th>
                  <th>{t('users.columns.joined')}</th>
                  <th style={{ textAlign: 'right' }}>{t('users.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const isCurrentUser = user.id === me?.id;
                  const isOwner = user.role === 'admin';
                  const initials = user.name
                    ? user.name
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'U';

                  const usageRatio = user.sessionLimit ? Math.min(1, user.sessionCount / user.sessionLimit) : 0;

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="user-identity">
                          <div className="user-avatar">{initials}</div>
                          <div className="user-meta">
                            <span className="user-name">
                              {user.name} {isCurrentUser && <span className="text-secondary">(You)</span>}
                            </span>
                            <span className="user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isOwner ? (
                          <span className="badge-role-admin">
                            <ShieldCheck size={14} />
                            {t('users.ownerBadge')}
                          </span>
                        ) : (
                          <span className="badge-role-user">
                            <Shield size={14} />
                            User
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`plan-badge ${user.plan}`}>{user.plan}</span>
                      </td>
                      <td>
                        <div className="sessions-quota">
                          <span className="sessions-quota-text">
                            {t('users.sessionsUsage', { count: user.sessionCount, limit: user.sessionLimit })}
                          </span>
                          <div className="sessions-progress-track">
                            <div
                              className={`sessions-progress-fill ${usageRatio >= 1 ? 'full' : ''}`}
                              style={{ width: `${Math.round(usageRatio * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-secondary" style={{ fontSize: '0.8125rem' }}>
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="user-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn-action-icon"
                            onClick={() => handleOpenPlanModal(user)}
                            title={t('users.actions.changePlan')}
                            aria-label={t('users.actions.changePlan')}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="btn-action-icon"
                            onClick={() => handleOpenPasswordModal(user)}
                            title={t('users.actions.resetPassword')}
                            aria-label={t('users.actions.resetPassword')}
                          >
                            <KeyRound size={15} />
                          </button>
                          <button
                            className="btn-action-icon danger"
                            onClick={() => handleOpenDeleteModal(user)}
                            disabled={isOwner || isCurrentUser}
                            title={
                              isOwner || isCurrentUser
                                ? t('users.deleteModal.cannotDeleteOwner')
                                : t('users.actions.deleteUser')
                            }
                            aria-label={t('users.actions.deleteUser')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Change Plan Modal */}
      {planModalUser && (
        <Modal
          open={!!planModalUser}
          onClose={() => setPlanModalUser(null)}
          title={t('users.changePlanModal.title')}
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPlanModalUser(null)}
                disabled={updatePlanMutation.isPending}
              >
                {t('users.changePlanModal.cancel')}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleUpdatePlan}
                disabled={updatePlanMutation.isPending}
              >
                {updatePlanMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('users.changePlanModal.updating')}</span>
                  </>
                ) : (
                  t('users.changePlanModal.confirm')
                )}
              </button>
            </div>
          }
        >
          <div>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              {t('users.changePlanModal.subtitle', { name: planModalUser.name, email: planModalUser.email })}
            </p>

            <div className="plan-options-grid">
              {ALL_PLANS.map(plan => {
                const isSelected = selectedPlan === plan;
                return (
                  <div
                    key={plan}
                    className={`plan-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === ' ' || e.key === 'Enter') setSelectedPlan(plan);
                    }}
                  >
                    <div className="plan-option-title">
                      <span>{plan}</span>
                      {isSelected && <Check size={18} className="text-primary" />}
                    </div>
                    <span className="plan-option-limit">{t(`users.changePlanModal.${plan}Desc`)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {passwordModalUser && (
        <Modal
          open={!!passwordModalUser}
          onClose={() => setPasswordModalUser(null)}
          title={t('users.resetPasswordModal.title')}
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPasswordModalUser(null)}
                disabled={resetPasswordMutation.isPending}
              >
                {t('users.resetPasswordModal.cancel')}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleResetPassword}
                disabled={resetPasswordMutation.isPending || newPassword.trim().length < 8}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('users.resetPasswordModal.resetting')}</span>
                  </>
                ) : (
                  t('users.resetPasswordModal.confirm')
                )}
              </button>
            </div>
          }
        >
          <div>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
              {t('users.resetPasswordModal.subtitle', { name: passwordModalUser.name, email: passwordModalUser.email })}
            </p>

            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('users.resetPasswordModal.placeholder')}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteModalUser && (
        <Modal
          open={!!deleteModalUser}
          onClose={() => setDeleteModalUser(null)}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
              <AlertTriangle size={20} />
              <span>{t('users.deleteModal.title')}</span>
            </div>
          }
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteModalUser(null)}
                disabled={deleteUserMutation.isPending}
              >
                {t('users.deleteModal.cancel')}
              </button>
              <button
                type="button"
                className="btn-danger"
                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem' }}
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('users.deleteModal.deleting')}</span>
                  </>
                ) : (
                  t('users.deleteModal.confirm')
                )}
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p
              dangerouslySetInnerHTML={{
                __html: t('users.deleteModal.confirmMessage', {
                  name: deleteModalUser.name,
                  email: deleteModalUser.email,
                }),
              }}
            />
            <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>
              {t('users.deleteModal.warning')}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
