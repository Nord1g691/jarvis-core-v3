"""Central JARVIS conversation bridge to Home Assistant Assist."""
from __future__ import annotations

from aiohttp import web
from homeassistant.components import assist_pipeline, conversation
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .memory import (
    add_memory_async,
    extract_explicit_memory,
    remove_memories_async,
    search_memories_async,
)
from .orchestrator import classify_request
from .sentinel_events import recent_sentinel_events


class JarvisConversationView(HomeAssistantView):
    url = "/api/jarvis/conversation"
    name = "api:jarvis:conversation"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    def _pipelines(self):
        return assist_pipeline.async_get_pipelines(self.hass)

    def _select_agent(self, requested_pipeline: str | None = None):
        pipelines = self._pipelines()
        preferred = assist_pipeline.async_get_pipeline(self.hass)
        if requested_pipeline:
            for pipeline in pipelines:
                if pipeline.id == requested_pipeline or pipeline.name == requested_pipeline:
                    return pipeline.conversation_engine, pipeline.name, True
        preferred_agent = preferred.conversation_engine
        if preferred_agent:
            return preferred_agent, preferred.name, False
        return conversation.HOME_ASSISTANT_AGENT, preferred.name, False

    async def _memory_context(self, text: str) -> str:
        words = [w for w in text.casefold().split() if len(w) > 3]
        if not words:
            return ""
        matches = await search_memories_async(self.hass, " ".join(words[-8:]), 5)
        if not matches:
            return ""
        lines = "\n".join(f"- {item['text']}" for item in matches)
        return (
            "Contexte mémoire JARVIS (à utiliser seulement si pertinent, ne pas réciter) :\n"
            + lines
            + "\n\n"
        )

    def _route_context(self, route: dict[str, str | float]) -> str:
        """Build a compact, read-only context for the selected specialist domain."""
        key = str(route.get("agent") or "jarvis")
        states = self.hass.states.async_all()
        lines: list[str] = []

        if key == "calendar":
            for state in states:
                if state.domain != "calendar":
                    continue
                attrs = state.attributes
                message = attrs.get("message") or state.name
                start = attrs.get("start_time") or ""
                end = attrs.get("end_time") or ""
                location = attrs.get("location") or ""
                lines.append(f"- {state.name}: {message} | {start} → {end} | {location}")
            title = "Contexte calendrier Home Assistant"
        elif key == "sentinel":
            for event in recent_sentinel_events(self.hass, 12):
                related = ", ".join(event.get("related_categories_30s") or [])
                suffix = f" | corrélé: {related}" if related else ""
                lines.append(
                    f"- événement {event.get('timestamp')}: {event.get('name')} "
                    f"{event.get('old_state')}→{event.get('new_state')} "
                    f"[{event.get('severity')}] ({event.get('category')}){suffix}"
                )
            for state in states:
                if state.domain == "camera":
                    lines.append(f"- caméra {state.name}: {state.state}")
                elif state.domain in {"alarm_control_panel", "lock"}:
                    lines.append(f"- {state.domain} {state.name}: {state.state}")
                elif state.domain == "binary_sensor":
                    dc = str(state.attributes.get("device_class") or "")
                    if dc in {"door", "window", "opening", "motion", "occupancy", "presence", "smoke", "moisture", "safety", "sound", "gas", "carbon_monoxide"}:
                        lines.append(f"- {state.name} ({dc}): {state.state}")
            title = "Contexte Sentinel / sécurité"
        elif key == "energy":
            wanted = {
                "sensor.envoy_122323101280_production_solaire_instantanee",
                "sensor.envoy_122323101280_consommation_electrique_actuelle",
                "sensor.puissance_import_reseau",
                "sensor.puissance_export_reseau",
                "switch.chauffe_eau",
                "switch.voiture_electrique_contacteur_1",
            }
            for entity_id in wanted:
                state = self.hass.states.get(entity_id)
                if state is not None:
                    unit = state.attributes.get("unit_of_measurement") or ""
                    lines.append(f"- {state.name}: {state.state} {unit}".rstrip())
            title = "Contexte énergie"
        elif key == "climate":
            for state in states:
                if state.domain != "climate":
                    continue
                cur = state.attributes.get("current_temperature")
                target = state.attributes.get("temperature")
                lines.append(f"- {state.name}: {state.state} | actuel {cur}° | cible {target}°")
            title = "Contexte climat"
        elif key == "water":
            for state in states:
                text = f"{state.entity_id} {state.name}".casefold()
                if any(word in text for word in ("piscine", "filtration", "eau", "arrosage", "veolia", "adouc")):
                    lines.append(f"- {state.name}: {state.state}")
            title = "Contexte eau / piscine"
        elif key == "media":
            for state in states:
                if state.domain == "media_player":
                    title_now = state.attributes.get("media_title") or ""
                    lines.append(f"- {state.name}: {state.state} {title_now}".rstrip())
            title = "Contexte média"
        elif key == "garden":
            for state in states:
                text = f"{state.entity_id} {state.name}".casefold()
                if any(word in text for word in ("jardin", "arrosage", "potager", "tondeuse", "pluie", "precip")):
                    lines.append(f"- {state.name}: {state.state}")
            title = "Contexte jardin"
        elif key == "technical":
            for state in states:
                if state.state in {"unavailable", "unknown"} and state.domain in {"automation", "script", "camera", "alarm_control_panel", "lock", "climate", "switch", "cover", "media_player", "conversation", "ai_task"}:
                    lines.append(f"- indisponible {state.name} ({state.entity_id}): {state.state}")
            title = "Contexte technique Home Assistant / JARVIS"
        elif key == "home":
            for state in states:
                if state.domain in {"automation", "script", "scene", "input_boolean", "input_button", "input_text", "todo"} and "jarvis" in f"{state.entity_id} {state.name}".casefold():
                    lines.append(f"- {state.name} ({state.entity_id}): {state.state}")
            title = "Contexte Maison / structure JARVIS"
        else:
            return ""

        if not lines:
            return ""
        return title + " (lecture seule, utiliser seulement si pertinent) :\n" + "\n".join(lines[:30]) + "\n\n"

    async def post(self, request: web.Request) -> web.Response:
        try:
            data = await request.json()
        except (TypeError, ValueError):
            return self.json_message("Invalid JSON", status_code=400)

        text = str(data.get("text", "")).strip()
        if not text:
            return self.json_message("Missing text", status_code=400)

        route = classify_request(text)
        explicit = extract_explicit_memory(text)
        if explicit:
            action, payload = explicit
            if action == "remember":
                item = await add_memory_async(self.hass, payload)
                return self.json({"response": {"speech": {"plain": {"speech": "C'est retenu."}}}, "memory_action": "remember", "memory": item, "conversation_id": data.get("conversation_id"), "orchestration": route})
            if action == "forget":
                removed = await remove_memories_async(self.hass, payload)
                speech = "C'est oublié." if removed else "Je ne trouve pas cette information dans ma mémoire."
                return self.json({"response": {"speech": {"plain": {"speech": speech}}}, "memory_action": "forget", "removed": removed, "conversation_id": data.get("conversation_id"), "orchestration": route})
            if action == "recall":
                memories = await search_memories_async(self.hass, "", 20)
                speech = "Je n'ai encore rien en mémoire." if not memories else "Voici ce que j'ai mémorisé : " + "; ".join(item["text"] for item in memories[:10])
                return self.json({"response": {"speech": {"plain": {"speech": speech}}}, "memory_action": "recall", "memories": memories, "conversation_id": data.get("conversation_id"), "orchestration": route})

        conversation_id = data.get("conversation_id")
        conversation_id = conversation_id.strip() if isinstance(conversation_id, str) and conversation_id.strip() else None
        requested_pipeline = data.get("pipeline")
        requested_pipeline = str(requested_pipeline).strip() or None if requested_pipeline is not None else None
        pipeline_map = data.get("pipeline_map")
        mapped_pipeline = None
        if isinstance(pipeline_map, dict):
            candidate = pipeline_map.get(str(route.get("agent") or "jarvis"))
            if candidate is not None:
                mapped_pipeline = str(candidate).strip() or None
        selected_pipeline = mapped_pipeline or requested_pipeline

        try:
            agent_id, pipeline_name, pipeline_matched = self._select_agent(selected_pipeline)
            memory_context = await self._memory_context(text)
            route_context = self._route_context(route)
            contextual_text = memory_context + route_context
            payload = {"text": contextual_text + text if contextual_text else text, "agent_id": agent_id}
            if conversation_id:
                payload["conversation_id"] = conversation_id
            result = await self.hass.services.async_call("conversation", "process", payload, blocking=True, return_response=True)
        except Exception as err:
            return self.json_message(f"Assist error: {err}", status_code=502)

        response = result or {}
        response_data = response.get("response", {}) if isinstance(response, dict) else {}
        new_conversation_id = response.get("conversation_id") if isinstance(response, dict) else None
        return self.json({
            "response": response_data,
            "conversation_id": new_conversation_id or conversation_id,
            "agent_id": agent_id,
            "pipeline_name": pipeline_name,
            "orchestration": route,
            "delegation": {
                "active": bool(mapped_pipeline and pipeline_matched),
                "route": str(route.get("agent") or "jarvis"),
                "mapped_pipeline": mapped_pipeline,
                "requested_pipeline": requested_pipeline,
                "matched": pipeline_matched,
            },
            "context_used": bool(route_context),
            "pipelines": [{"id": p.id, "name": p.name, "conversation_engine": p.conversation_engine} for p in self._pipelines()],
            "continue_conversation": response.get("continue_conversation", False) if isinstance(response, dict) else False,
        })
