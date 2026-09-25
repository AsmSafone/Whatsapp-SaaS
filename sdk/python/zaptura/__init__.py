"""
Zaptura Python SDK.

Official client library for the Zaptura WhatsApp API Gateway.

Example usage::

    from zaptura import ZapturaClient

    client = ZapturaClient(
        base_url="http://localhost:2785",
        api_key="zap_k1_…",
    )

    client.sessions.start("my-session")
    result = client.messages.send_text("my-session", {
        "chatId": "628123456789@c.us",
        "text": "Hello from the Zaptura Python SDK!",
    })
    print(result["messageId"])
"""

from __future__ import annotations

from .client import ZapturaClient
from .errors import (
    ZapturaApiError,
    ZapturaAuthError,
    ZapturaConflictError,
    ZapturaError,
    ZapturaForbiddenError,
    ZapturaNotFoundError,
    ZapturaNotImplementedError,
    ZapturaServiceUnavailableError,
    ZapturaRateLimitError,
    ZapturaTimeoutError,
)

__all__ = [
    "ZapturaClient",
    "ZapturaError",
    "ZapturaApiError",
    "ZapturaAuthError",
    "ZapturaForbiddenError",
    "ZapturaNotFoundError",
    "ZapturaConflictError",
    "ZapturaRateLimitError",
    "ZapturaNotImplementedError",
    "ZapturaServiceUnavailableError",
    "ZapturaTimeoutError",
]
