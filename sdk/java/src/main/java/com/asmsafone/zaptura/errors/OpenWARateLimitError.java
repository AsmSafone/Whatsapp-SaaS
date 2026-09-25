package com.asmsafone.zaptura.errors;

/** 429 Too Many Requests — rate limited. */
public class ZapturaRateLimitError extends ZapturaApiError {
    public ZapturaRateLimitError(String message, int status, Object body, String errorKind) {
        super(message, status, body, errorKind);
    }
}
