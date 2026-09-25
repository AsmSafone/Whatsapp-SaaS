<?php

declare(strict_types=1);

namespace Zaptura\Exceptions;

/**
 * Raised when the API responds with a non-2xx status.
 *
 * Carries the HTTP status code and the parsed error body. Use the named
 * subclass for common statuses, or branch on getStatus().
 */
class ZapturaApiException extends ZapturaException
{
    private int $status;
    /** @var mixed */
    private $body;
    private ?string $errorKind;

    /**
     * @param mixed $body
     */
    public function __construct(string $message, int $status, $body = null, ?string $errorKind = null)
    {
        parent::__construct($message);
        $this->status = $status;
        $this->body = $body;
        $this->errorKind = $errorKind;
    }

    public function getStatus(): int
    {
        return $this->status;
    }

    /** @return mixed */
    public function getBody()
    {
        return $this->body;
    }

    public function getErrorKind(): ?string
    {
        return $this->errorKind;
    }

    /**
     * Build the most specific ZapturaApiException subclass for a status code.
     *
     * @param mixed $body
     */
    public static function classify(int $status, string $message, $body, ?string $errorKind): ZapturaApiException
    {
        return match ($status) {
            401 => new ZapturaAuthException($message, $status, $body, $errorKind),
            403 => new ZapturaForbiddenException($message, $status, $body, $errorKind),
            404 => new ZapturaNotFoundException($message, $status, $body, $errorKind),
            409 => new ZapturaConflictException($message, $status, $body, $errorKind),
            429 => new ZapturaRateLimitException($message, $status, $body, $errorKind),
            501 => new ZapturaNotImplementedException($message, $status, $body, $errorKind),
            503 => new ZapturaServiceUnavailableException($message, $status, $body, $errorKind),
            default => new ZapturaApiException($message, $status, $body, $errorKind),
        };
    }
}
