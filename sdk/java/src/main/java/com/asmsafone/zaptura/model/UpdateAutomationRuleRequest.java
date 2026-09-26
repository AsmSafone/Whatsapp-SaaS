package com.asmsafone.zaptura.model;

/**
 * Request body for updating an automation rule.
 */
public record UpdateAutomationRuleRequest(
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

        public UpdateAutomationRuleRequest build() {
            return new UpdateAutomationRuleRequest(name, replyText, conditions, cooldownSeconds, enabled);
        }
    }
}
