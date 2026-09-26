package com.asmsafone.zaptura.resources;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.asmsafone.zaptura.ClientConfig;
import com.asmsafone.zaptura.ZapturaClient;
import com.asmsafone.zaptura.http.HttpMethod;
import com.asmsafone.zaptura.model.CreateAutomationRuleRequest;
import com.asmsafone.zaptura.model.UpdateAutomationRuleRequest;
import com.asmsafone.zaptura.support.MockTransport;
import org.junit.jupiter.api.Test;

class AutomationResourceTest {
    final MockTransport tx = new MockTransport();
    final ZapturaClient client = new ZapturaClient(
        ClientConfig.builder().baseUrl("http://h").apiKey("k").transport(tx).build());

    @Test
    void listHitsAutomationRulesPath() {
        tx.respond(200, "[]");
        client.automation.list("s");
        assertEquals("http://h/api/sessions/s/automation-rules", tx.lastRequest().url());
        assertEquals(HttpMethod.GET, tx.lastRequest().method());
    }

    @Test
    void getEncodesIds() {
        tx.respond(
            200,
            "{\"id\":\"r/1\",\"sessionId\":\"s\",\"name\":\"n\",\"replyText\":\"b\",\"cooldownSeconds\":60,\"enabled\":true,\"createdAt\":\"c\",\"updatedAt\":\"u\"}");
        client.automation.get("a/b", "r/1");
        assertEquals("http://h/api/sessions/a%2Fb/automation-rules/r%2F1", tx.lastRequest().url());
        assertEquals(HttpMethod.GET, tx.lastRequest().method());
    }

    @Test
    void createSendsBody() {
        tx.respond(
            200,
            "{\"id\":\"r1\",\"sessionId\":\"s\",\"name\":\"greeting\",\"replyText\":\"Hello\",\"cooldownSeconds\":60,\"enabled\":true,\"createdAt\":\"c\",\"updatedAt\":\"u\"}");
        client.automation.create(
            "s", CreateAutomationRuleRequest.builder().name("greeting").replyText("Hello").build());
        assertEquals("http://h/api/sessions/s/automation-rules", tx.lastRequest().url());
        assertEquals(HttpMethod.POST, tx.lastRequest().method());
        assertTrue(tx.lastRequest().body().contains("greeting"));
    }

    @Test
    void updateSendsBodyAndEncodesId() {
        tx.respond(
            200,
            "{\"id\":\"r1\",\"sessionId\":\"s\",\"name\":\"n\",\"replyText\":\"updated\",\"cooldownSeconds\":60,\"enabled\":true,\"createdAt\":\"c\",\"updatedAt\":\"u\"}");
        client.automation.update("s", "r1", UpdateAutomationRuleRequest.builder().replyText("updated").build());
        assertEquals("http://h/api/sessions/s/automation-rules/r1", tx.lastRequest().url());
        assertEquals(HttpMethod.PUT, tx.lastRequest().method());
        assertTrue(tx.lastRequest().body().contains("updated"));
    }

    @Test
    void deleteEncodesId() {
        tx.respond(204, "");
        client.automation.delete("s", "r1");
        assertEquals("http://h/api/sessions/s/automation-rules/r1", tx.lastRequest().url());
        assertEquals(HttpMethod.DELETE, tx.lastRequest().method());
    }
}
