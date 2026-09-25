package com.asmsafone.zaptura.errors;

/** 501 Not Implemented — the active engine does not support this operation. */
public class ZapturaNotImplementedError extends ZapturaApiError {
    public ZapturaNotImplementedError(String message, int status, Object body, String errorKind) {
        super(message, status, body, errorKind);
    }
}
