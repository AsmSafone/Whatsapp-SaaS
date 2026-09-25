package com.asmsafone.zaptura.model;

/** Readiness probe payload — checks both DB connections. {@code details} is {@code null} when absent. */
public record HealthReadyResponse(String status, HealthReadyDetails details) {}
