package com.asmsafone.zaptura.model;

/**
 * Autoreply automation rule matching inbound messages.
 * Backed by {@code src/modules/automation/dto/automation-rule.dto.ts}.
 */
public record AutomationRule(
    String id,
    String sessionId,
    String name,
    Boolean enabled,
    WebhookFilters conditions,
    String replyText,
    Integer cooldownSeconds,
    String createdAt,
    String updatedAt) {}
