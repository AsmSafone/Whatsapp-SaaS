package com.asmsafone.zaptura.errors;

/** Thrown when a request exceeds the configured timeout. */
public class ZapturaTimeoutError extends ZapturaError {
    public ZapturaTimeoutError(long timeoutMs) {
        super("Request timed out after " + timeoutMs + "ms");
    }
}
