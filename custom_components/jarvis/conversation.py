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


_SPECIALIST_PIPELINE_TERMS: dict[str, tuple[str, ...]] = {
    "chef": ("chef", "cuisine"),
    "mail": ("messenger", "messagerie"),
    "technical": ("système", "systeme", "technique"),
}


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
                    return pipeline.conversation_engine, pipeline.name
        preferred_agent = preferred.conversation_engine
        if preferred_agent:
            return preferred_agent, preferred.name
        return conversation.HOME_ASSISTANT_AGENT, preferred.name

    def _select_specialist(self, agent_key: str):
        """Return a configured specialist pipeline, if one is available."""
        terms = _SPECIALIST_PIPELINE_TERMS.get(agent_key, ())
        if not terms:
            return None
        for pipeline in self._pipelines():
            haystack = f"{pipeline.name} {pipeline.conversation_engine}".casefold()
            if any(term in haystack for term in terms):
                return pipeline.conversation_engine, pipeline.name, pipeline.id
        return None

    async def _process_agent(
        self,
        agent_id: str,
        text: str,
        conversation_id: str | None = None,
    ) -> dict:
        payload = {"text": text, "agent_id": agent_id}
        if conversation_id:
            payload["conversation_id"] = conversation_id
        result = await self.hass.services.async_call(
            "conversation", "process", payload, blocking=True, return_response=True
        )
        return result or {}

    @staticmethod
    def _plain_speech(result: dict) -> str:
        response = result.get("response", {}) if isinstance(result, dict) else {}
        speech = response.get("speech", {}) if isinstance(response, dict) else {}
        plain = speech.get("plain", {}) if isinstance(speech, dict) else {}
        return str(plain.get("speech") or "").strip() if isinstance(plain, dict) else ""

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
            for state in states:
                if state.domain == "camera":
                    lines.append(f"- caméra {state.name}: {state.state}")
                elif state.domain in {"alarm_control_panel", "lock"}:
                    lines.append(f"- {state.domain} {state.name}: {state.state}")
                elif state.domain == "binary_sensor":
                    dc = str(state.attributes.get("device_class") or "")
                    if dc in {"door", "window", "opening", "motion", "occupancy", "presence", "smoke", "moisture", "safety"}:
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
                if state.domain == "fan":
                    percentage = state.attributes.get("percentage")
                    suffix = f" | vitesse {percentage} %" if percentage is not None else ""
                    lines.append(f"- {state.name}: {state.state}{suffix}")
                    continue
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

        try:
            agent_id, pipeline_name = self._select_agent(requested_pipeline)
            memory_context = await self._memory_context(text)
            route_context = self._route_context(route)
            contextual_text = memory_context + route_context
            mode = str(route.get("mode") or "direct")
            specialist = self._select_specialist(str(route.get("agent") or "jarvis"))
            delegated = False
            specialist_pipeline = None

            if specialist and mode == "transfer":
                specialist_agent, specialist_name, candidate_pipeline = specialist
                try:
                    result = await self._process_agent(
                        specialist_agent,
                        contextual_text + text if contextual_text else text,
                        conversation_id,
                    )
                except Exception:  # Specialist unavailable: JARVIS remains usable.
                    result = await self._process_agent(
                        agent_id,
                        contextual_text + text if contextual_text else text,
                        conversation_id,
                    )
                else:
                    agent_id = specialist_agent
                    pipeline_name = specialist_name
                    specialist_pipeline = candidate_pipeline
                    delegated = True
            else:
                if specialist and mode == "consult":
                    specialist_agent, specialist_name, candidate_pipeline = specialist
                    try:
                        specialist_result = await self._process_agent(
                            specialist_agent,
                            contextual_text + text if contextual_text else text,
                        )
                    except Exception:
                        specialist_speech = ""
                    else:
                        specialist_speech = self._plain_speech(specialist_result)
                    if specialist_speech:
                        specialist_pipeline = candidate_pipeline
                        contextual_text += (
                            f"Avis du spécialiste {specialist_name} (à synthétiser sans "
                            f"mentionner la délégation) :\n{specialist_speech}\n\n"
                        )
                        delegated = True
                result = await self._process_agent(
                    agent_id,
                    contextual_text + text if contextual_text else text,
                    conversation_id,
                )
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
            "delegated": delegated,
            "specialist_pipeline": specialist_pipeline,
            "context_used": bool(route_context),
            "pipelines": [{"id": p.id, "name": p.name, "conversation_engine": p.conversation_engine} for p in self._pipelines()],
            "continue_conversation": response.get("continue_conversation", False) if isinstance(response, dict) else False,
        })
