package com.asmsafone.zaptura.errors;

/** 409 Conflict — typically an engine-not-ready condition from the backend. */
public class ZapturaConflictError extends ZapturaApiError {
    public ZapturaConflictError(String message, int status, Object body, String errorKind) {
        super(message, status, body, errorKind);
    }
}
