"""Read-only Home Assistant structure inventory for JARVIS Core V3."""
from __future__ import annotations

from collections import Counter

from aiohttp import web
from homeassistant.components import assist_pipeline
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .memory import search_memories_async


STRUCTURE_DOMAINS = {
    "automation",
    "script",
    "scene",
    "conversation",
    "ai_task",
    "todo",
    "calendar",
    "input_boolean",
    "input_button",
    "input_text",
    "input_number",
    "input_select",
    "timer",
    "counter",
    "person",
    "device_tracker",
}


class JarvisStructureView(HomeAssistantView):
    """Expose the existing HA building blocks JARVIS can orchestrate."""

    url = "/api/jarvis/structure"
    name = "api:jarvis:structure"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    def _domain_items(self, domain: str, limit: int = 200) -> list[dict[str, str]]:
        items: list[dict[str, str]] = []
        for state in self.hass.states.async_all(domain):
            items.append(
                {
                    "entity_id": state.entity_id,
                    "name": state.name,
                    "state": state.state,
                }
            )
        return items[:limit]

    def _pipelines(self) -> list[dict[str, str | None]]:
        try:
            pipelines = assist_pipeline.async_get_pipelines(self.hass)
        except Exception:
            return []
        return [
            {
                "id": p.id,
                "name": p.name,
                "conversation_engine": p.conversation_engine,
            }
            for p in pipelines
        ]

    async def get(self, request: web.Request) -> web.Response:
        states = self.hass.states.async_all()
        counts = Counter(s.domain for s in states)
        selected = {
            domain: self._domain_items(domain)
            for domain in sorted(STRUCTURE_DOMAINS)
            if counts.get(domain, 0)
        }
        memories = await search_memories_async(self.hass, "", 500)
        pipelines = self._pipelines()
        components = self.hass.config.components
        return self.json(
            {
                "counts": {domain: counts.get(domain, 0) for domain in sorted(STRUCTURE_DOMAINS)},
                "entities": selected,
                "pipelines": pipelines,
                "memory": {
                    "available": True,
                    "count": len(memories),
                },
                "capabilities": {
                    "automation": counts.get("automation", 0) > 0,
                    "scripts": counts.get("script", 0) > 0,
                    "helpers": any(counts.get(d, 0) > 0 for d in {"input_boolean", "input_button", "input_text", "input_number", "input_select", "timer", "counter"}),
                    "conversation_agents": bool(pipelines) or counts.get("conversation", 0) > 0,
                    "ai_tasks": counts.get("ai_task", 0) > 0 or "ai_task" in components,
                    "todo_tasks": counts.get("todo", 0) > 0,
                    "calendar": counts.get("calendar", 0) > 0,
                    "memory": True,
                },
                "read_only": True,
            }
        )
