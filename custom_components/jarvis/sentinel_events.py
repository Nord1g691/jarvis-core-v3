"""Read-only Sentinel event engine for JARVIS Core V3."""
from __future__ import annotations

from collections import deque
from datetime import timedelta
from typing import Any

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import Event, HomeAssistant, State, callback
from homeassistant.util import dt as dt_util

from .const import DOMAIN

_SENTINEL_KEY = "_sentinel_events"
_UNSUB_KEY = "_sentinel_unsub"
SECURITY_CLASSES = {
    "door", "window", "opening", "motion", "occupancy", "presence",
    "smoke", "moisture", "safety", "sound", "gas", "carbon_monoxide",
}


def _store(hass: HomeAssistant) -> deque[dict[str, Any]]:
    domain_data = hass.data.setdefault(DOMAIN, {})
    store = domain_data.get(_SENTINEL_KEY)
    if not isinstance(store, deque):
        store = deque(maxlen=200)
        domain_data[_SENTINEL_KEY] = store
    return store


def _relevant(state: State | None) -> bool:
    if state is None:
        return False
    if state.domain in {"alarm_control_panel", "lock"}:
        return True
    if state.domain == "binary_sensor":
        return str(state.attributes.get("device_class") or "") in SECURITY_CLASSES
    return False


def _severity(state: State) -> str:
    if state.domain == "alarm_control_panel" and state.state in {"triggered", "pending"}:
        return "critical"
    if state.domain == "binary_sensor" and state.state == "on":
        dc = str(state.attributes.get("device_class") or "")
        if dc in {"smoke", "gas", "carbon_monoxide", "moisture", "safety"}:
            return "critical"
        if dc in {"door", "window", "opening", "motion", "occupancy", "presence", "sound"}:
            return "attention"
    if state.domain == "lock" and state.state in {"unlocked", "opening"}:
        return "attention"
    return "info"


def _correlate(store: deque[dict[str, Any]], now) -> list[str]:
    cutoff = now - timedelta(seconds=30)
    related: list[str] = []
    for item in reversed(store):
        try:
            when = dt_util.parse_datetime(str(item.get("timestamp") or ""))
        except (TypeError, ValueError):
            when = None
        if when is None or when < cutoff:
            break
        category = str(item.get("category") or "")
        if category and category not in related:
            related.append(category)
        if len(related) >= 5:
            break
    return related


def _category(state: State) -> str:
    if state.domain == "alarm_control_panel":
        return "alarm"
    if state.domain == "lock":
        return "lock"
    return str(state.attributes.get("device_class") or "binary_sensor")


async def async_setup_sentinel_events(hass: HomeAssistant) -> None:
    """Start one filtered state_changed listener."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get(_UNSUB_KEY):
        return
    store = _store(hass)

    @callback
    def _state_changed(event: Event) -> None:
        old_state = event.data.get("old_state")
        new_state = event.data.get("new_state")
        if not isinstance(new_state, State) or not _relevant(new_state):
            return
        if isinstance(old_state, State) and old_state.state == new_state.state:
            return
        now = dt_util.utcnow()
        category = _category(new_state)
        related = _correlate(store, now)
        store.append(
            {
                "timestamp": now.isoformat(),
                "entity_id": new_state.entity_id,
                "name": new_state.name,
                "category": category,
                "old_state": old_state.state if isinstance(old_state, State) else None,
                "new_state": new_state.state,
                "severity": _severity(new_state),
                "related_categories_30s": related,
                "agent": "sentinel",
            }
        )

    domain_data[_UNSUB_KEY] = hass.bus.async_listen(EVENT_STATE_CHANGED, _state_changed)


async def async_unload_sentinel_events(hass: HomeAssistant) -> None:
    """Remove the Sentinel listener cleanly."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    unsub = domain_data.pop(_UNSUB_KEY, None)
    if callable(unsub):
        unsub()


class JarvisSentinelEventsView(HomeAssistantView):
    """Expose recent normalized Sentinel events."""

    url = "/api/jarvis/sentinel/events"
    name = "api:jarvis:sentinel:events"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request) -> web.Response:
        try:
            limit = max(1, min(100, int(request.query.get("limit", "50"))))
        except ValueError:
            limit = 50
        items = list(_store(self.hass))[-limit:]
        items.reverse()
        return self.json(
            {
                "events": items,
                "count": len(items),
                "correlation_window_seconds": 30,
                "read_only": True,
                "proactive_actions": False,
            }
        )
