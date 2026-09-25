package com.asmsafone.zaptura.errors;

/** 403 Forbidden — the API key's role is insufficient for this endpoint. */
public class ZapturaForbiddenError extends ZapturaApiError {
    public ZapturaForbiddenError(String message, int status, Object body, String errorKind) {
        super(message, status, body, errorKind);
    }
}
