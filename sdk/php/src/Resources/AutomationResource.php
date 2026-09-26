<?php

declare(strict_types=1);

namespace Zaptura\Resources;

use Zaptura\Http\HttpExecutor;

/**
 * Automation resource — autoreply rules matching inbound messages.
 *
 * Backed by src/modules/automation/automation-rule.controller.ts
 * (@Controller('sessions/:sessionId/automation-rules')).
 */
class AutomationResource
{
    private HttpExecutor $http;

    public function __construct(HttpExecutor $http)
    {
        $this->http = $http;
    }

    /** @return array<int,array<string,mixed>> */
    public function list(string $sessionId): array
    {
        return $this->http->request('GET', "/api/sessions/{$this->http->encodeSegment($sessionId)}/automation-rules") ?? [];
    }

    /** @return array<string,mixed> */
    public function get(string $sessionId, string $ruleId): array
    {
        return $this->http->request('GET', "/api/sessions/{$this->http->encodeSegment($sessionId)}/automation-rules/{$this->http->encodeSegment($ruleId)}");
    }

    /**
     * Create an autoreply rule.
     *
     * @param array<string,mixed> $body Must contain 'name' and 'replyText'.
     * @return array<string,mixed>
     */
    public function create(string $sessionId, array $body): array
    {
        return $this->http->request('POST', "/api/sessions/{$this->http->encodeSegment($sessionId)}/automation-rules", [], $body);
    }

    /**
     * Update an autoreply rule.
     *
     * @param array<string,mixed> $body
     * @return array<string,mixed>
     */
    public function update(string $sessionId, string $ruleId, array $body): array
    {
        return $this->http->request('PUT', "/api/sessions/{$this->http->encodeSegment($sessionId)}/automation-rules/{$this->http->encodeSegment($ruleId)}", [], $body);
    }

    /** Delete an autoreply rule. */
    public function delete(string $sessionId, string $ruleId): void
    {
        $this->http->request('DELETE', "/api/sessions/{$this->http->encodeSegment($sessionId)}/automation-rules/{$this->http->encodeSegment($ruleId)}");
    }
}
