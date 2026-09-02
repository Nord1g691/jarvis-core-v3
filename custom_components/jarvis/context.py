"""Read-only household context API for JARVIS Core V3."""
from __future__ import annotations

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .orchestrator import agent_catalog
from .sentinel import current_security_snapshot


class JarvisContextView(HomeAssistantView):
    """Expose a compact, read-only context snapshot for JARVIS and its agents."""

    url = "/api/jarvis/context"
    name = "api:jarvis:context"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    def _states(self):
        return list(self.hass.states.async_all())

    def _home_summary(self) -> dict[str, int]:
        states = self._states()
        lights_on = sum(1 for s in states if s.domain == "light" and s.state == "on")
        switches_on = sum(1 for s in states if s.domain == "switch" and s.state == "on")
        covers_open = sum(1 for s in states if s.domain == "cover" and s.state in {"open", "opening"})
        climates_active = sum(
            1 for s in states if s.domain == "climate" and s.state not in {"off", "unavailable", "unknown"}
        )
        unavailable = sum(1 for s in states if s.state in {"unavailable", "unknown"})
        return {
            "lights_on": lights_on,
            "switches_on": switches_on,
            "covers_open": covers_open,
            "climates_active": climates_active,
            "unavailable": unavailable,
        }

    def _calendar_snapshot(self) -> list[dict[str, str | None]]:
        items: list[dict[str, str | None]] = []
        for state in self._states():
            if state.domain != "calendar":
                continue
            attrs = state.attributes
            items.append(
                {
                    "entity_id": state.entity_id,
                    "name": attrs.get("friendly_name") or state.name,
                    "state": state.state,
                    "message": attrs.get("message"),
                    "start_time": attrs.get("start_time"),
                    "end_time": attrs.get("end_time"),
                    "location": attrs.get("location"),
                }
            )
        return items

    async def get(self, request: web.Request) -> web.Response:
        sentinel = current_security_snapshot(self.hass)
        frigate = sentinel.get("providers", {}).get("frigate", {})
        return self.json(
            {
                "home": self._home_summary(),
                "calendar": self._calendar_snapshot(),
                "sentinel": sentinel,
                "agents": agent_catalog(),
                "capabilities": {
                    "calendar": True,
                    "sentinel": True,
                    "frigate_prepared": True,
                    "frigate_available": bool(frigate.get("available")),
                    "mqtt_available": bool(frigate.get("mqtt_available")),
                    "frigate_audio_future": True,
                    "mail": False,
                    "documents": False,
                    "suggestions": True,
                    "agent_delegation_supported": True,
                    "agent_delegation_requires_mapping": True,
                    "structure_inventory": True,
                },
            }
        )
