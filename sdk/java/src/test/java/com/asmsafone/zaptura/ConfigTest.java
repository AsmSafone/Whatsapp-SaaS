package com.asmsafone.zaptura;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.asmsafone.zaptura.errors.ZapturaError;
import com.asmsafone.zaptura.http.HttpMethod;
import com.asmsafone.zaptura.http.HttpTransport;
import com.asmsafone.zaptura.model.SuccessResult;
import com.asmsafone.zaptura.support.MockTransport;
import java.time.Duration;
import org.junit.jupiter.api.Test;

class ConfigTest {
    private static ClientConfig.Builder base() {
        return ClientConfig.builder().baseUrl("http://h").apiKey("zap_k1_x");
    }

    @Test
    void rejectsZeroAndNegativeTimeout() {
        assertThrows(IllegalArgumentException.class, () -> base().timeout(Duration.ZERO).build());
        assertThrows(IllegalArgumentException.class, () -> base().timeout(Duration.ofSeconds(-1)).build());
    }

    @Test
    void rejectsMalformedBaseUrl() {
        assertThrows(IllegalArgumentException.class,
            () -> ClientConfig.builder().baseUrl("http://my host:2785").apiKey("zap_k1_x").build());
    }

    @Test
    void rejectsApiKeyWithInteriorControlChar() {
        assertThrows(IllegalArgumentException.class,
            () -> ClientConfig.builder().baseUrl("http://h").apiKey("zap\nk1").build());
    }

    @Test
    void trimsWhitespaceFromBaseUrlAndApiKey() {
        // A trailing newline (e.g. key read from a file/env) must be tolerated, not fatal.
        MockTransport tx = new MockTransport().respond(200, "{\"valid\":true}");
        ZapturaClient c = new ZapturaClient(
            ClientConfig.builder().baseUrl("http://h ").apiKey(" zap_k1_x\n").transport(tx).build());
        c.auth();
        assertEquals("zap_k1_x", tx.lastRequest().headers().get("X-API-Key"));
        assertTrue(tx.lastRequest().url().startsWith("http://h/"));
    }

    @Test
    void transportIllegalArgumentIsWrappedAsZapturaError() {
        HttpTransport bad = req -> {
            throw new IllegalArgumentException("restricted header name: \"Host\"");
        };
        ZapturaClient c = new ZapturaClient(base().transport(bad).build());
        ZapturaError e = assertThrows(ZapturaError.class,
            () -> c.request(HttpMethod.GET, "/x", null, null, SuccessResult.class));
        assertTrue(e.getMessage().contains("Invalid request"));
    }
}
