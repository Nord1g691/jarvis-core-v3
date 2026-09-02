"""Read-only diagnostics for JARVIS Core V3."""
from __future__ import annotations

from aiohttp import web
from homeassistant.components import assist_pipeline
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .sentinel import current_security_snapshot


class JarvisDiagnosticsView(HomeAssistantView):
    """Expose a compact health snapshot without modifying Home Assistant."""

    url = "/api/jarvis/diagnostics"
    name = "api:jarvis:diagnostics"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    def _unavailable(self) -> list[dict[str, str]]:
        important_domains = {
            "camera", "alarm_control_panel", "lock", "binary_sensor", "climate",
            "light", "switch", "cover", "media_player", "calendar",
        }
        items = []
        for state in self.hass.states.async_all():
            if state.domain in important_domains and state.state in {"unavailable", "unknown"}:
                items.append({"entity_id": state.entity_id, "name": state.name, "state": state.state})
        return items[:100]

    def _pipelines(self) -> list[dict[str, str | None]]:
        try:
            pipelines = assist_pipeline.async_get_pipelines(self.hass)
        except Exception:
            return []
        return [
            {
                "id": pipeline.id,
                "name": pipeline.name,
                "conversation_engine": pipeline.conversation_engine,
            }
            for pipeline in pipelines
        ]

    async def get(self, request: web.Request) -> web.Response:
        sentinel = current_security_snapshot(self.hass)
        frigate = sentinel.get("providers", {}).get("frigate", {})
        unavailable = self._unavailable()
        pipelines = self._pipelines()
        critical = [
            item for item in unavailable
            if item["entity_id"].split(".", 1)[0] in {"camera", "alarm_control_panel", "lock", "binary_sensor"}
        ]
        return self.json(
            {
                "core": {
                    "loaded": "jarvis" in self.hass.config.components,
                    "pipeline_count": len(pipelines),
                    "unavailable_count": len(unavailable),
                    "security_unavailable_count": len(critical),
                },
                "pipelines": pipelines,
                "unavailable": unavailable,
                "sentinel": {
                    "camera_count": len(sentinel.get("cameras", [])),
                    "alarm_count": len(sentinel.get("alarms", [])),
                    "lock_count": len(sentinel.get("locks", [])),
                    "binary_sensor_count": len(sentinel.get("binary_sensors", [])),
                    "frigate_prepared": bool(frigate.get("prepared")),
                    "frigate_available": bool(frigate.get("available")),
                    "mqtt_available": bool(frigate.get("mqtt_available")),
                },
                "status": "warning" if critical or not pipelines else "ok",
                "read_only": True,
            }
        )
