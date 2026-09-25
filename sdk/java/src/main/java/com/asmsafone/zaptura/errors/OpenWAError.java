package com.asmsafone.zaptura.errors;

/** Base class for every error thrown by the SDK. */
public class ZapturaError extends RuntimeException {
    public ZapturaError(String message) {
        super(message);
    }
}
