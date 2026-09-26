"""Resource modules for the Zaptura Python SDK.

Each module defines a small ``_*Resource`` class whose methods map 1:1 to an
API path group. They are constructed by :class:`zaptura.client.ZapturaClient`.
"""

from __future__ import annotations

from .automation import AutomationResource
from .calls import CallsResource
from .catalog import CatalogResource
from .channels import ChannelsResource
from .chats import ChatsResource
from .contacts import ContactsResource
from .groups import GroupsResource
from .health import HealthResource
from .labels import LabelsResource
from .media import MediaResource
from .messages import MessagesResource
from .profile import ProfileResource
from .search import SearchResource
from .sessions import SessionsResource
from .status import StatusResource
from .templates import TemplatesResource
from .webhooks import WebhooksResource

__all__ = [
    "AutomationResource",
    "CallsResource",
    "CatalogResource",
    "ChannelsResource",
    "ChatsResource",
    "ContactsResource",
    "GroupsResource",
    "HealthResource",
    "LabelsResource",
    "MediaResource",
    "MessagesResource",
    "ProfileResource",
    "SearchResource",
    "SessionsResource",
    "StatusResource",
    "TemplatesResource",
    "WebhooksResource",
]
