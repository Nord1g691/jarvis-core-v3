"""Read-only diagnostics and health scoring for JARVIS Core V3."""
from __future__ import annotations

from aiohttp import web
from homeassistant.components import assist_pipeline
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .memory import search_memories_async
from .sentinel import current_security_snapshot
from .sentinel_events import recent_sentinel_events


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

    @staticmethod
    def _clamp(value: int) -> int:
        return max(0, min(100, int(value)))

    async def get(self, request: web.Request) -> web.Response:
        sentinel = current_security_snapshot(self.hass)
        frigate = sentinel.get("providers", {}).get("frigate", {})
        unavailable = self._unavailable()
        pipelines = self._pipelines()
        memories = await search_memories_async(self.hass, "", 500)
        events = recent_sentinel_events(self.hass, 50)
        critical_unavailable = [
            item for item in unavailable
            if item["entity_id"].split(".", 1)[0] in {"camera", "alarm_control_panel", "lock", "binary_sensor"}
        ]
        critical_events = [item for item in events if item.get("severity") == "critical"]
        components = self.hass.config.components
        states = self.hass.states
        domain_data = self.hass.data.get(DOMAIN, {})
        sentinel_listener = bool(domain_data.get("_sentinel_unsub"))

        structure_present = any(
            states.async_all(domain)
            for domain in ("automation", "script", "scene", "calendar", "person")
        )

        core_score = 100 if DOMAIN in components else 20
        assist_score = 100 if pipelines else 35
        if pipelines and not any(p.get("conversation_engine") for p in pipelines):
            assist_score = 75

        security_score = 100
        security_score -= min(45, len(critical_unavailable) * 12)
        security_score -= min(35, len(critical_events) * 10)
        if not sentinel_listener:
            security_score -= 20

        memory_score = 100 if memories else 82
        structure_score = 100 if structure_present else 70

        sub_scores = {
            "core": self._clamp(core_score),
            "assist": self._clamp(assist_score),
            "security": self._clamp(security_score),
            "memory": self._clamp(memory_score),
            "structure": self._clamp(structure_score),
        }
        total = round(
            sub_scores["core"] * 0.25
            + sub_scores["assist"] * 0.20
            + sub_scores["security"] * 0.25
            + sub_scores["memory"] * 0.10
            + sub_scores["structure"] * 0.20
        )
        level = "excellent" if total >= 90 else "good" if total >= 75 else "warning" if total >= 55 else "critical"

        issues: list[dict[str, str]] = []
        if not pipelines:
            issues.append({"area": "assist", "severity": "warning", "message": "Aucun pipeline Assist détecté."})
        if critical_unavailable:
            issues.append({"area": "security", "severity": "critical", "message": f"{len(critical_unavailable)} entité(s) de sécurité indisponible(s)."})
        if not sentinel_listener:
            issues.append({"area": "security", "severity": "warning", "message": "Le listener Sentinel n'est pas actif."})
        if critical_events:
            issues.append({"area": "security", "severity": "warning", "message": f"{len(critical_events)} événement(s) Sentinel critique(s) dans le buffer récent."})
        if not structure_present:
            issues.append({"area": "structure", "severity": "info", "message": "Structure Home Assistant limitée ou non détectée."})

        return self.json(
            {
                "health": {
                    "score": total,
                    "level": level,
                    "sub_scores": sub_scores,
                    "issues": issues[:12],
                },
                "core": {
                    "loaded": DOMAIN in components,
                    "pipeline_count": len(pipelines),
                    "unavailable_count": len(unavailable),
                    "security_unavailable_count": len(critical_unavailable),
                    "memory_count": len(memories),
                    "sentinel_event_count": len(events),
                    "sentinel_listener": sentinel_listener,
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
                "status": "ok" if total >= 75 else "warning",
                "read_only": True,
            }
        )
