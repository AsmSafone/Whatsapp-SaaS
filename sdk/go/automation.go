package zaptura

import "context"

// AutomationService manages autoreply rules matching inbound messages.
// Backed by src/modules/automation/automation-rule.controller.ts.
type AutomationService struct{ client *Client }

func (s *AutomationService) base(sessionID string) string {
	return "/api/sessions/" + pathEscape(sessionID) + "/automation-rules"
}

// List returns autoreply rules for a session.
func (s *AutomationService) List(ctx context.Context, sessionID string) ([]AutomationRule, error) {
	var out []AutomationRule
	err := s.client.do(ctx, "GET", s.base(sessionID), nil, nil, &out)
	return out, err
}

// Get returns a single autoreply rule.
func (s *AutomationService) Get(ctx context.Context, sessionID, ruleID string) (*AutomationRule, error) {
	var out AutomationRule
	err := s.client.do(ctx, "GET", s.base(sessionID)+"/"+pathEscape(ruleID), nil, nil, &out)
	if err != nil {
		return nil, err
	}
	return &out, nil
}

// Create creates an autoreply rule.
func (s *AutomationService) Create(ctx context.Context, sessionID string, body CreateAutomationRuleRequest) (*AutomationRule, error) {
	var out AutomationRule
	err := s.client.do(ctx, "POST", s.base(sessionID), nil, body, &out)
	if err != nil {
		return nil, err
	}
	return &out, nil
}

// Update modifies an autoreply rule.
func (s *AutomationService) Update(ctx context.Context, sessionID, ruleID string, body UpdateAutomationRuleRequest) (*AutomationRule, error) {
	var out AutomationRule
	err := s.client.do(ctx, "PUT", s.base(sessionID)+"/"+pathEscape(ruleID), nil, body, &out)
	if err != nil {
		return nil, err
	}
	return &out, nil
}

// Delete removes an autoreply rule.
func (s *AutomationService) Delete(ctx context.Context, sessionID, ruleID string) error {
	return s.client.do(ctx, "DELETE", s.base(sessionID)+"/"+pathEscape(ruleID), nil, nil, nil)
}
