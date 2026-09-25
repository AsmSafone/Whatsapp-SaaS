package com.asmsafone.zaptura.errors;

/** 401 Unauthorized — missing or invalid API key. */
public class ZapturaAuthError extends ZapturaApiError {
    public ZapturaAuthError(String message, int status, Object body, String errorKind) {
        super(message, status, body, errorKind);
    }
}
