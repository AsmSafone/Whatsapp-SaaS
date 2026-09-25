package com.asmsafone.zaptura.resources;

import com.asmsafone.zaptura.ZapturaClient;
import com.asmsafone.zaptura.http.HttpMethod;
import com.asmsafone.zaptura.model.HealthReadyResponse;
import com.asmsafone.zaptura.model.HealthResponse;

/** Health resource — connectivity and readiness probes. */
public final class HealthResource {
    private final ZapturaClient client;

    public HealthResource(ZapturaClient client) {
        this.client = client;
    }

    /** General health (also returns the running version). */
    public HealthResponse check() {
        return client.request(HttpMethod.GET, "/api/health", null, null, HealthResponse.class);
    }

    /** Kubernetes liveness probe. */
    public HealthResponse live() {
        return client.request(HttpMethod.GET, "/api/health/live", null, null, HealthResponse.class);
    }

    /** Kubernetes readiness probe — checks both DB connections. */
    public HealthReadyResponse ready() {
        return client.request(HttpMethod.GET, "/api/health/ready", null, null, HealthReadyResponse.class);
    }
}
