"""Read-only JARVIS briefing helpers.

Builds compact household briefings from Home Assistant state only. No actions are
executed here; the goal is to provide JARVIS/Sentinel with a stable summary layer.
"""
from __future__ import annotations

from datetime import timedelta

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .sentinel_provider import build_sentinel_snapshot


class JarvisBriefingView(HomeAssistantView):
    """Expose a compact read-only household briefing."""

    url = "/api/jarvis/briefing"
    name = "api:jarvis:briefing"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    def _states(self):
        return list(self.hass.states.async_all())

    def _calendar(self) -> list[dict[str, str | None]]:
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

    def _energy(self) -> dict[str, str | None]:
        aliases = {
            "production": "sensor.envoy_122323101280_production_solaire_instantanee",
            "consumption": "sensor.envoy_122323101280_consommation_electrique_actuelle",
            "grid_import": "sensor.puissance_import_reseau",
            "grid_export": "sensor.puissance_export_reseau",
        }
        out: dict[str, str | None] = {}
        for key, entity_id in aliases.items():
            state = self.hass.states.get(entity_id)
            out[key] = state.state if state else None
        return out

    def _alerts(self) -> list[dict[str, str]]:
        alerts: list[dict[str, str]] = []
        for state in self._states():
            if state.state in {"unavailable", "unknown"}:
                if state.domain in {"camera", "alarm_control_panel", "lock", "binary_sensor", "climate"}:
                    alerts.append({"entity_id": state.entity_id, "name": state.name, "state": state.state})
            if state.domain == "alarm_control_panel" and state.state in {"triggered", "pending"}:
                alerts.append({"entity_id": state.entity_id, "name": state.name, "state": state.state})
            if state.domain == "binary_sensor" and state.state == "on":
                device_class = str(state.attributes.get("device_class") or "")
                if device_class in {"smoke", "moisture", "safety", "gas", "carbon_monoxide"}:
                    alerts.append({"entity_id": state.entity_id, "name": state.name, "state": state.state})
        return alerts[:50]

    def _home(self) -> dict[str, int]:
        states = self._states()
        return {
            "lights_on": sum(1 for s in states if s.domain == "light" and s.state == "on"),
            "switches_on": sum(1 for s in states if s.domain == "switch" and s.state == "on"),
            "covers_open": sum(1 for s in states if s.domain == "cover" and s.state in {"open", "opening"}),
            "climates_active": sum(1 for s in states if s.domain == "climate" and s.state not in {"off", "unknown", "unavailable"}),
        }

    async def get(self, request: web.Request) -> web.Response:
        hours_raw = request.query.get("hours", "8")
        try:
            hours = max(1, min(48, int(hours_raw)))
        except ValueError:
            hours = 8
        now = dt_util.utcnow()
        return self.json(
            {
                "generated_at": now.isoformat(),
                "window": {"hours": hours, "since": (now - timedelta(hours=hours)).isoformat()},
                "home": self._home(),
                "alerts": self._alerts(),
                "calendar": self._calendar(),
                "energy": self._energy(),
                "sentinel": build_sentinel_snapshot(self.hass),
                "capabilities": {
                    "absence_summary": True,
                    "briefing": True,
                    "history_detail": False,
                    "proactive_notifications": False,
                },
            }
        )
