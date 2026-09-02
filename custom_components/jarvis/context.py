"""Read-only household context API for JARVIS Core V3."""
from __future__ import annotations

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .orchestrator import agent_catalog


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

    def _sentinel_snapshot(self) -> dict[str, list[dict[str, str]]]:
        cameras: list[dict[str, str]] = []
        security: list[dict[str, str]] = []
        for state in self._states():
            if state.domain == "camera":
                cameras.append({"entity_id": state.entity_id, "name": state.name, "state": state.state})
            elif state.domain in {"alarm_control_panel", "lock", "binary_sensor"}:
                device_class = str(state.attributes.get("device_class") or "")
                if state.domain != "binary_sensor" or device_class in {
                    "door", "window", "opening", "motion", "occupancy", "presence", "smoke", "moisture", "safety"
                }:
                    security.append({"entity_id": state.entity_id, "name": state.name, "state": state.state})
        return {"cameras": cameras[:50], "security": security[:100]}

    async def get(self, request: web.Request) -> web.Response:
        return self.json(
            {
                "home": self._home_summary(),
                "calendar": self._calendar_snapshot(),
                "sentinel": self._sentinel_snapshot(),
                "agents": agent_catalog(),
                "capabilities": {
                    "calendar": True,
                    "sentinel": True,
                    "mail": False,
                    "documents": False,
                    "suggestions": False,
                    "agent_delegation": False,
                },
            }
        )
