"""Automation resource — autoreply automation rules.

Backed by ``src/modules/automation/automation-rule.controller.ts``.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from .._http import quote_segment
from ..types import AutomationRule, CreateAutomationRuleRequest, UpdateAutomationRuleRequest

if TYPE_CHECKING:
    from .._http import HttpExecutor


class AutomationResource:
    def __init__(self, http: "HttpExecutor") -> None:
        self._http = http

    def list(self, session_id: str) -> list[AutomationRule]:
        return self._http.request("GET", f"/api/sessions/{quote_segment(session_id)}/automation-rules")

    def get(self, session_id: str, rule_id: str) -> AutomationRule:
        return self._http.request("GET", f"/api/sessions/{quote_segment(session_id)}/automation-rules/{quote_segment(rule_id)}")

    def create(self, session_id: str, body: CreateAutomationRuleRequest) -> AutomationRule:
        return self._http.request("POST", f"/api/sessions/{quote_segment(session_id)}/automation-rules", body=body)

    def update(self, session_id: str, rule_id: str, body: UpdateAutomationRuleRequest) -> AutomationRule:
        return self._http.request("PUT", f"/api/sessions/{quote_segment(session_id)}/automation-rules/{quote_segment(rule_id)}", body=body)

    def delete(self, session_id: str, rule_id: str) -> None:
        self._http.request("DELETE", f"/api/sessions/{quote_segment(session_id)}/automation-rules/{quote_segment(rule_id)}")
