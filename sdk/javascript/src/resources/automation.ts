/**
 * Automation resource — autoreply automation rules.
 *
 * Backed by `src/modules/automation/automation-rule.controller.ts`.
 * @packageDocumentation
 */

import { encodeSegment } from '../http.js';
import type { ZapturaClient } from '../client.js';
import type { AutomationRule, CreateAutomationRuleRequest, UpdateAutomationRuleRequest } from '../types.js';

export class AutomationResource {
  constructor(private readonly client: ZapturaClient) {}

  /** List all automation rules for a session. */
  list(sessionId: string): Promise<AutomationRule[]> {
    return this.client.request<AutomationRule[]>({
      method: 'GET',
      path: `/api/sessions/${encodeSegment(sessionId)}/automation-rules`,
    });
  }

  /** Get a single automation rule by ID. */
  get(sessionId: string, ruleId: string): Promise<AutomationRule> {
    return this.client.request<AutomationRule>({
      method: 'GET',
      path: `/api/sessions/${encodeSegment(sessionId)}/automation-rules/${encodeSegment(ruleId)}`,
    });
  }

  /** Create an automation rule. */
  create(sessionId: string, body: CreateAutomationRuleRequest): Promise<AutomationRule> {
    return this.client.request<AutomationRule>({
      method: 'POST',
      path: `/api/sessions/${encodeSegment(sessionId)}/automation-rules`,
      body,
    });
  }

  /** Update an automation rule. */
  update(sessionId: string, ruleId: string, body: UpdateAutomationRuleRequest): Promise<AutomationRule> {
    return this.client.request<AutomationRule>({
      method: 'PUT',
      path: `/api/sessions/${encodeSegment(sessionId)}/automation-rules/${encodeSegment(ruleId)}`,
      body,
    });
  }

  /** Delete an automation rule. */
  delete(sessionId: string, ruleId: string): Promise<void> {
    return this.client.request<void>({
      method: 'DELETE',
      path: `/api/sessions/${encodeSegment(sessionId)}/automation-rules/${encodeSegment(ruleId)}`,
    });
  }
}
