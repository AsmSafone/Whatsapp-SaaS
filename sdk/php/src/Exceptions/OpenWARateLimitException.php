<?php

declare(strict_types=1);

namespace Zaptura\Exceptions;

/** 429 Too Many Requests — rate limited. */
class ZapturaRateLimitException extends ZapturaApiException
{
}
