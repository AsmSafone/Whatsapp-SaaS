package com.asmsafone.zaptura.resources;

import static com.asmsafone.zaptura.http.Http.encodeSegment;

import com.asmsafone.zaptura.ZapturaClient;
import com.asmsafone.zaptura.http.HttpMethod;
import com.asmsafone.zaptura.model.AutomationRule;
import com.asmsafone.zaptura.model.CreateAutomationRuleRequest;
import com.asmsafone.zaptura.model.UpdateAutomationRuleRequest;
import java.util.List;

/** Automation resource — autoreply rules matching inbound messages. */
public final class AutomationResource {
    private final ZapturaClient client;

    public AutomationResource(ZapturaClient client) {
        this.client = client;
    }

    /** List all automation rules for a session. */
    public List<AutomationRule> list(String sessionId) {
        return client.requestList(
            HttpMethod.GET,
            "/api/sessions/" + encodeSegment(sessionId) + "/automation-rules",
            null,
            null,
            AutomationRule.class);
    }

    /** Get a single automation rule by ID. */
    public AutomationRule get(String sessionId, String ruleId) {
        return client.request(
            HttpMethod.GET,
            "/api/sessions/" + encodeSegment(sessionId) + "/automation-rules/" + encodeSegment(ruleId),
            null,
            null,
            AutomationRule.class);
    }

    /** Create an automation rule. */
    public AutomationRule create(String sessionId, CreateAutomationRuleRequest body) {
        return client.request(
            HttpMethod.POST,
            "/api/sessions/" + encodeSegment(sessionId) + "/automation-rules",
            null,
            body,
            AutomationRule.class);
    }

    /** Update an automation rule. */
    public AutomationRule update(String sessionId, String ruleId, UpdateAutomationRuleRequest body) {
        return client.request(
            HttpMethod.PUT,
            "/api/sessions/" + encodeSegment(sessionId) + "/automation-rules/" + encodeSegment(ruleId),
            null,
            body,
            AutomationRule.class);
    }

    /** Delete an automation rule. */
    public void delete(String sessionId, String ruleId) {
        client.request(
            HttpMethod.DELETE,
            "/api/sessions/" + encodeSegment(sessionId) + "/automation-rules/" + encodeSegment(ruleId),
            null,
            null,
            Void.class);
    }
}
