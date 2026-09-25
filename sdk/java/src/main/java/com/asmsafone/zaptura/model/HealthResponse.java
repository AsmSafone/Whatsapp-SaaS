package com.asmsafone.zaptura.model;

/** General health payload. Optional fields are {@code null} when absent. */
public record HealthResponse(String status, String timestamp, String version) {}
