package com.asmsafone.zaptura;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.asmsafone.zaptura.errors.ZapturaError;
import com.asmsafone.zaptura.errors.ZapturaNotFoundError;
import com.asmsafone.zaptura.http.BinaryResponse;
import com.asmsafone.zaptura.http.HttpMethod;
import com.asmsafone.zaptura.model.SuccessResult;
import com.asmsafone.zaptura.support.MockTransport;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ClientTest {
    final MockTransport tx = new MockTransport();
    final ZapturaClient client = new ZapturaClient(
        ClientConfig.builder().baseUrl("http://h:2785").apiKey("zap_k1_x").transport(tx).build());

    @Test
    void constructorRejectsMissingConfig() {
        assertThrows(IllegalArgumentException.class,
            () -> new ZapturaClient(ClientConfig.builder().apiKey("x").build()));
        assertThrows(IllegalArgumentException.class,
            () -> new ZapturaClient(ClientConfig.builder().baseUrl("http://h").build()));
    }

    @Test
    void requestSendsAuthHeaderAndParsesBody() {
        tx.respond(200, "{\"success\":true}");
        SuccessResult r = client.request(HttpMethod.POST, "/api/x", null, null, SuccessResult.class);
        assertTrue(r.success());
        assertEquals("http://h:2785/api/x", tx.lastRequest().url());
        assertEquals("zap_k1_x", tx.lastRequest().headers().get("X-API-Key"));
        assertEquals("application/json", tx.lastRequest().headers().get("Content-Type"));
    }

    @Test
    void nonOkResponseThrowsClassifiedError() {
        tx.respond(404, "{\"statusCode\":404,\"message\":\"nope\",\"error\":\"Not Found\"}");
        assertThrows(ZapturaNotFoundError.class,
            () -> client.request(HttpMethod.GET, "/api/x", null, null, SuccessResult.class));
    }

    @Test
    void authPostsToValidatePath() {
        tx.respond(200, "{\"valid\":true,\"role\":\"OPERATOR\"}");
        client.auth();
        assertEquals("http://h:2785/api/auth/validate", tx.lastRequest().url());
        assertEquals(HttpMethod.POST, tx.lastRequest().method());
    }

    @Test
    void emptyBodyReturnsNull() {
        tx.respond(204, "");
        SuccessResult r = client.request(HttpMethod.DELETE, "/api/x", null, null, SuccessResult.class);
        assertNull(r);
    }

    @Test
    void nonJson2xxFallsBackToRawTextForStringTargets() {
        tx.respond(200, "plain text");
        String r = client.request(HttpMethod.GET, "/api/x", null, null, String.class);
        assertEquals("plain text", r);
    }

    @Test
    void nonJson2xxForTypedTargetsThrowsTidySdkError() {
        tx.respond(200, "plain text");
        // Must surface the SDK's own error type — a raw Gson JsonSyntaxException
        // leaking to callers is the bug this guards.
        ZapturaError e = assertThrows(ZapturaError.class,
            () -> client.request(HttpMethod.GET, "/api/x", null, null, SuccessResult.class));
        assertEquals(ZapturaError.class, e.getClass());
    }

    @Test
    void requestBytesReturnsRawBodyAndContentType() {
        tx.respondRaw(
            200,
            "PNG_BYTES".getBytes(StandardCharsets.UTF_8),
            Map.of("content-type", List.of("image/png")));
        BinaryResponse r = client.requestBytes(HttpMethod.GET, "/api/x", null);
        assertArrayEquals("PNG_BYTES".getBytes(StandardCharsets.UTF_8), r.data());
        assertEquals("image/png", r.contentType());
    }

    @Test
    void requestBytes204ReturnsEmptyData() {
        tx.respond(204, "");
        BinaryResponse r = client.requestBytes(HttpMethod.GET, "/api/x", null);
        assertEquals(0, r.data().length);
        assertNull(r.contentType());
    }
}
