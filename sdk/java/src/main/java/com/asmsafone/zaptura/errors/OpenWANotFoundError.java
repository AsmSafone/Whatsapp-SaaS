package com.asmsafone.zaptura.errors;

/** 404 Not Found. */
public class ZapturaNotFoundError extends ZapturaApiError {
    public ZapturaNotFoundError(String message, int status, Object body, String errorKind) {
        super(message, status, body, errorKind);
    }
}
