package com.asmsafone.zaptura.resources;

import com.asmsafone.zaptura.ZapturaClient;
import com.asmsafone.zaptura.http.HttpMethod;
import com.asmsafone.zaptura.model.SearchQuery;
import com.asmsafone.zaptura.model.SearchResults;

/**
 * Search resource — full-text message search across sessions via {@code GET /search}.
 *
 * <p>Requires an OPERATOR-level API key. {@code q} is the only required parameter.
 */
public final class SearchResource {
    private final ZapturaClient client;

    public SearchResource(ZapturaClient client) {
        this.client = client;
    }

    /**
     * Search persisted messages via the active search provider.
     *
     * @param params query parameters; {@code q} must be non-null and non-blank.
     * @throws IllegalArgumentException if {@code params.q} is null or blank.
     */
    public SearchResults search(SearchQuery params) {
        if (params == null) {
            throw new IllegalArgumentException("Search params must not be null.");
        }
        if (params.q() == null || params.q().isBlank()) {
            throw new IllegalArgumentException("Search parameter \"q\" is required and must be non-empty.");
        }
        return client.request(HttpMethod.GET, "/api/search", params, null, SearchResults.class);
    }
}
