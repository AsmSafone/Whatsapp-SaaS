import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  PauseCircle,
  MessageSquare,
  Filter,
  Loader2,
  Smartphone,
} from 'lucide-react';
import {
  type AutomationRule,
  type CreateAutomationRulePayload,
  type UpdateAutomationRulePayload,
  type WebhookFilters,
  type WebhookFilterCondition,
} from '../services/api';
import {
  useSessionsQuery,
  useSessionChatsQuery,
  useAutomationRulesQuery,
  useCreateAutomationRuleMutation,
  useUpdateAutomationRuleMutation,
  useDeleteAutomationRuleMutation,
} from '../hooks/queries';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FilterBuilder } from '../components/FilterBuilder';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import './Automation.css';

interface FormState {
  name: string;
  replyText: string;
  conditions: WebhookFilters | null;
  cooldownSeconds: number;
  enabled: boolean;
}

const defaultForm: FormState = {
  name: '',
  replyText: '',
  conditions: null,
  cooldownSeconds: 60,
  enabled: true,
};

export function Automation() {
  const { t } = useTranslation();
  useDocumentTitle(t('automation.title', 'Automation'));
  const { canWrite } = useRole();
  const toast = useToast();

  const { data: sessions = [], isLoading: loadingSessions } = useSessionsQuery();
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  // Default to first session if available
  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [selectedSessionId, sessions]);

  const {
    data: rules = [],
    isLoading: loadingRules,
    error: rulesError,
  } = useAutomationRulesQuery(selectedSessionId, { enabled: !!selectedSessionId });

  const { data: chats = [] } = useSessionChatsQuery(selectedSessionId, !!selectedSessionId);

  const createMutation = useCreateAutomationRuleMutation();
  const updateMutation = useUpdateAutomationRuleMutation();
  const deleteMutation = useDeleteAutomationRuleMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<AutomationRule | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filteredRules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rules;
    return rules.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        r.replyText.toLowerCase().includes(q) ||
        (r.conditions?.conditions || []).some(c => String(c.value).toLowerCase().includes(q)),
    );
  }, [rules, searchQuery]);

  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter(r => r.enabled).length;
    const paused = total - active;
    return { total, active, paused };
  }, [rules]);

  const openCreateModal = () => {
    setEditingRule(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (rule: AutomationRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      replyText: rule.replyText,
      conditions: rule.conditions || null,
      cooldownSeconds: rule.cooldownSeconds ?? 60,
      enabled: rule.enabled,
    });
    setShowModal(true);
  };

  const handleToggleRule = async (rule: AutomationRule) => {
    if (!canWrite) return;
    try {
      await updateMutation.mutateAsync({
        sessionId: selectedSessionId,
        id: rule.id,
        data: { enabled: !rule.enabled },
      });
      toast.success(
        !rule.enabled
          ? t('automation.toasts.activated', 'Rule activated')
          : t('automation.toasts.paused', 'Rule paused'),
      );
    } catch (err) {
      toast.error(
        t('automation.toasts.updateFailed', 'Failed to toggle rule'),
        err instanceof Error ? err.message : t('common.unknownError'),
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || isSaving) return;

    const trimmedName = form.name.trim();
    const trimmedReply = form.replyText.trim();

    if (!trimmedName) {
      toast.warning(t('automation.toasts.nameRequired', 'Rule name is required'));
      return;
    }
    if (!trimmedReply) {
      toast.warning(t('automation.toasts.replyRequired', 'Reply text is required'));
      return;
    }

    try {
      if (editingRule) {
        const payload: UpdateAutomationRulePayload = {
          name: trimmedName,
          replyText: trimmedReply,
          conditions: form.conditions && form.conditions.conditions.length > 0 ? form.conditions : null,
          cooldownSeconds: Math.max(0, form.cooldownSeconds),
          enabled: form.enabled,
        };
        await updateMutation.mutateAsync({
          sessionId: selectedSessionId,
          id: editingRule.id,
          data: payload,
        });
        toast.success(t('automation.toasts.updated', 'Rule updated successfully'));
      } else {
        const payload: CreateAutomationRulePayload = {
          name: trimmedName,
          replyText: trimmedReply,
          conditions: form.conditions && form.conditions.conditions.length > 0 ? form.conditions : null,
          cooldownSeconds: Math.max(0, form.cooldownSeconds),
          enabled: form.enabled,
        };
        await createMutation.mutateAsync({
          sessionId: selectedSessionId,
          data: payload,
        });
        toast.success(t('automation.toasts.created', 'Rule created successfully'));
      }
      setShowModal(false);
    } catch (err) {
      toast.error(
        t('automation.toasts.saveFailed', 'Failed to save rule'),
        err instanceof Error ? err.message : t('common.unknownError'),
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !selectedSessionId) return;
    try {
      await deleteMutation.mutateAsync({
        sessionId: selectedSessionId,
        id: deleteTarget.id,
      });
      toast.success(t('automation.toasts.deleted', 'Rule deleted successfully'));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        t('automation.toasts.deleteFailed', 'Failed to delete rule'),
        err instanceof Error ? err.message : t('common.unknownError'),
      );
    }
  };

  const formatCondition = (c: WebhookFilterCondition) => {
    const field = t(`webhooks.filters.fields.${c.field}`, { defaultValue: c.field });
    const operator = t(`webhooks.filters.operators.${c.operator}`, { defaultValue: c.operator });
    let valueStr: string;
    if (typeof c.value === 'boolean') {
      valueStr = c.value
        ? t('webhooks.filters.yes', { defaultValue: 'Yes' })
        : t('webhooks.filters.no', { defaultValue: 'No' });
    } else if (Array.isArray(c.value)) {
      valueStr = c.value.join(', ');
    } else {
      valueStr = `"${c.value}"`;
    }
    return `${field} ${operator} ${valueStr}`;
  };

  if (loadingSessions) {
    return (
      <div
        className="automation-page"
        style={{ display: 'flex', justifyContent: 'center', minHeight: '400px', alignItems: 'center' }}
      >
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="automation-page">
        <PageHeader
          title={t('automation.title', 'Automation')}
          subtitle={t('automation.subtitle', 'Configure automated replies and keyword triggers for incoming messages')}
        />
        <div className="automation-empty">
          <div className="automation-empty-icon">
            <Smartphone size={28} />
          </div>
          <h3>{t('automation.noSessionsTitle', 'No WhatsApp Sessions Available')}</h3>
          <p>
            {t(
              'automation.noSessionsDesc',
              'You need an active session to set up automation rules. Please create or connect a session first.',
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="automation-page">
      <PageHeader
        title={t('automation.title', 'Automation')}
        subtitle={t('automation.subtitle', 'Configure automated replies and keyword triggers for incoming messages')}
        actions={
          <button className="btn-primary" onClick={openCreateModal} disabled={!canWrite || !selectedSessionId}>
            <Plus size={16} />
            {t('automation.newRule', 'New Rule')}
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="automation-stats">
        <div className="automation-stat-card">
          <div className="automation-stat-icon total">
            <Bot size={22} />
          </div>
          <div className="automation-stat-info">
            <span className="automation-stat-value">{stats.total}</span>
            <span className="automation-stat-label">{t('automation.stats.total', 'Total Rules')}</span>
          </div>
        </div>

        <div className="automation-stat-card">
          <div className="automation-stat-icon active">
            <CheckCircle2 size={22} />
          </div>
          <div className="automation-stat-info">
            <span className="automation-stat-value">{stats.active}</span>
            <span className="automation-stat-label">{t('automation.stats.active', 'Active')}</span>
          </div>
        </div>

        <div className="automation-stat-card">
          <div className="automation-stat-icon paused">
            <PauseCircle size={22} />
          </div>
          <div className="automation-stat-info">
            <span className="automation-stat-value">{stats.paused}</span>
            <span className="automation-stat-label">{t('automation.stats.paused', 'Paused')}</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search (Left) + Session Picker (Right) */}
      <div className="automation-toolbar">
        <div className="automation-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder={t('automation.searchPlaceholder', 'Search rules, conditions, or replies...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="automation-session-picker">
          <Smartphone size={16} color="var(--primary-text)" />
          <select
            aria-label={t('automation.selectSession', 'Select session')}
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(e.target.value)}
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.name || s.id} ({s.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rules Content */}
      {loadingRules ? (
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '240px', alignItems: 'center' }}>
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : rulesError ? (
        <div className="error-banner">
          <span>{rulesError instanceof Error ? rulesError.message : t('common.errorGeneric')}</span>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="automation-empty">
          <div className="automation-empty-icon">
            <Bot size={28} />
          </div>
          <h3>
            {rules.length === 0
              ? t('automation.empty.title', 'No Automation Rules Yet')
              : t('automation.empty.noMatch', 'No matching rules found')}
          </h3>
          <p>
            {rules.length === 0
              ? t(
                  'automation.empty.desc',
                  'Create your first autoreply rule to automatically answer inbound messages based on keywords or custom conditions.',
                )
              : t('automation.empty.searchDesc', 'Try clearing your search query to see all rules.')}
          </p>
        </div>
      ) : (
        <div className="automation-list">
          {filteredRules.map(rule => {
            const hasConditions = rule.conditions && rule.conditions.conditions.length > 0;
            return (
              <div key={rule.id} className={`automation-card ${!rule.enabled ? 'disabled' : ''}`}>
                <div className="automation-card-header">
                  <div className="automation-card-title-group">
                    <label
                      className="automation-toggle-switch"
                      title={rule.enabled ? t('common.active') : t('common.inactive')}
                    >
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule)}
                        disabled={!canWrite}
                      />
                      <span className="automation-toggle-slider" />
                    </label>
                    <span className="automation-card-title">{rule.name}</span>
                    <span className={`automation-badge ${rule.enabled ? 'active' : 'paused'}`}>
                      {rule.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>

                  <div className="automation-card-actions">
                    <button
                      className="btn-secondary btn-icon"
                      onClick={() => openEditModal(rule)}
                      title={t('common.edit', 'Edit')}
                      aria-label={t('common.edit', 'Edit')}
                      disabled={!canWrite}
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      className="btn-danger btn-icon"
                      onClick={() => setDeleteTarget(rule)}
                      title={t('common.delete', 'Delete')}
                      aria-label={t('common.delete', 'Delete')}
                      disabled={!canWrite}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="automation-card-body">
                  <div className="automation-trigger-row">
                    <span className="automation-section-label">
                      <Filter size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                      {t('automation.triggers', 'Triggers')}
                    </span>
                    <div className="automation-conditions-list">
                      {!hasConditions ? (
                        <span className="automation-all-incoming">
                          <Sparkles size={13} />
                          {t('automation.allInbound', 'All Inbound Messages')}
                        </span>
                      ) : (
                        rule.conditions!.conditions.map((cond, idx) => (
                          <span key={idx} className="automation-condition-chip">
                            {formatCondition(cond)}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="automation-reply-row">
                    <span className="automation-section-label">
                      <MessageSquare size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                      {t('automation.reply', 'Reply')}
                    </span>
                    <div className="automation-reply-bubble">{rule.replyText}</div>
                  </div>
                </div>

                <div className="automation-card-footer">
                  <span className="automation-cooldown-badge">
                    <Clock size={13} />
                    {t('automation.cooldownLabel', '{{count}}s cooldown per chat', { count: rule.cooldownSeconds })}
                  </span>
                  <span>
                    {t('common.created', 'Created')}: {new Date(rule.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal
          open={showModal}
          title={
            editingRule
              ? t('automation.editRule', 'Edit Automation Rule')
              : t('automation.newRule', 'Create Automation Rule')
          }
          onClose={() => !isSaving && setShowModal(false)}
        >
          <form onSubmit={handleSave} className="automation-form">
            <div className="automation-form-group">
              <label>{t('automation.form.nameLabel', 'Rule Name')}</label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder={t('automation.form.namePlaceholder', 'e.g. Welcome Message or Pricing Auto-reply')}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <small>
                {t('automation.form.nameHint', 'A descriptive name to identify this rule in the dashboard.')}
              </small>
            </div>

            <div className="automation-form-group">
              <label>{t('automation.form.conditionsLabel', 'Trigger Conditions')}</label>
              <small>
                {t(
                  'automation.form.conditionsHint',
                  'Add filters to match incoming messages by body keyword, sender, or message type. If empty, the rule answers every inbound message.',
                )}
              </small>
              <FilterBuilder
                filters={form.conditions}
                onChange={conditions => setForm(f => ({ ...f, conditions }))}
                chats={chats}
              />
            </div>

            <div className="automation-form-group">
              <label>{t('automation.form.replyLabel', 'Auto-Reply Text')}</label>
              <textarea
                required
                rows={4}
                maxLength={4096}
                placeholder={t('automation.form.replyPlaceholder', 'Type the automated response message here...')}
                value={form.replyText}
                onChange={e => setForm(f => ({ ...f, replyText: e.target.value }))}
              />
              <small>
                {t('automation.form.replyHint', 'This message will be sent automatically when the conditions match.')}
              </small>
            </div>

            <div className="automation-form-row">
              <div className="automation-form-group">
                <label>{t('automation.form.cooldownLabel', 'Quiet Cooldown (seconds)')}</label>
                <input
                  type="number"
                  min={0}
                  max={86400}
                  value={form.cooldownSeconds}
                  onChange={e => setForm(f => ({ ...f, cooldownSeconds: parseInt(e.target.value, 10) || 0 }))}
                />
                <small>
                  {t(
                    'automation.form.cooldownHint',
                    'Quiet period per chat to prevent infinite bot reply loops (default: 60s).',
                  )}
                </small>
              </div>

              <div className="automation-form-group" style={{ justifyContent: 'center' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    marginTop: '1.25rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                    style={{ width: 'auto', margin: 0 }}
                  />
                  <span>{t('automation.form.enabledLabel', 'Enable this rule immediately')}</span>
                </label>
              </div>
            </div>

            <div
              className="modal-actions"
              style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}
            >
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {editingRule ? t('common.save') : t('common.create')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          open={!!deleteTarget}
          title={t('automation.deleteConfirmTitle', 'Delete Automation Rule')}
          onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              {t(
                'automation.deleteConfirmMessage',
                'Are you sure you want to delete the rule "{{name}}"? This action cannot be undone.',
                { name: deleteTarget.name },
              )}
            </p>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
              >
                {t('common.cancel')}
              </button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                {t('common.delete')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
