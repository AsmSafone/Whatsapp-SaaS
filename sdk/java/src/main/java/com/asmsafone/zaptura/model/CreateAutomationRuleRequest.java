package com.asmsafone.zaptura.model;

/**
 * Request body for creating an automation rule.
 */
public record CreateAutomationRuleRequest(
    String name,
    String replyText,
    WebhookFilters conditions,
    Integer cooldownSeconds,
    Boolean enabled) {

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String name;
        private String replyText;
        private WebhookFilters conditions;
        private Integer cooldownSeconds;
        private Boolean enabled;

        public Builder name(String v) {
            this.name = v;
            return this;
        }

        public Builder replyText(String v) {
            this.replyText = v;
            return this;
        }

        public Builder conditions(WebhookFilters v) {
            this.conditions = v;
            return this;
        }

        public Builder cooldownSeconds(Integer v) {
            this.cooldownSeconds = v;
            return this;
        }

        public Builder enabled(Boolean v) {
            this.enabled = v;
            return this;
        }

        public CreateAutomationRuleRequest build() {
            return new CreateAutomationRuleRequest(name, replyText, conditions, cooldownSeconds, enabled);
        }
    }
}
