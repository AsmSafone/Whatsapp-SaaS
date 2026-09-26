package zaptura

// AutomationRule is an autoreply rule matching inbound messages.
// Backed by src/modules/automation/dto/automation-rule.dto.ts.
type AutomationRule struct {
	ID              string          `json:"id"`
	SessionID       string          `json:"sessionId"`
	Name            string          `json:"name"`
	Enabled         bool            `json:"enabled"`
	Conditions      *WebhookFilters `json:"conditions"`
	ReplyText       string          `json:"replyText"`
	CooldownSeconds int             `json:"cooldownSeconds"`
	CreatedAt       string          `json:"createdAt"`
	UpdatedAt       string          `json:"updatedAt"`
}

// CreateAutomationRuleRequest is the payload for creating an autoreply rule.
type CreateAutomationRuleRequest struct {
	Name            string          `json:"name"`
	ReplyText       string          `json:"replyText"`
	Conditions      *WebhookFilters `json:"conditions,omitempty"`
	CooldownSeconds *int            `json:"cooldownSeconds,omitempty"`
	Enabled         *bool           `json:"enabled,omitempty"`
}

// UpdateAutomationRuleRequest is the payload for updating an autoreply rule.
type UpdateAutomationRuleRequest struct {
	Name            *string         `json:"name,omitempty"`
	ReplyText       *string         `json:"replyText,omitempty"`
	Conditions      *WebhookFilters `json:"conditions,omitempty"`
	CooldownSeconds *int            `json:"cooldownSeconds,omitempty"`
	Enabled         *bool           `json:"enabled,omitempty"`
}
