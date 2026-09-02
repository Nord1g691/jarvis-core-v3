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
                return self.json(
                    {
                        "response": {"speech": {"plain": {"speech": "C'est retenu."}}},
                        "memory_action": "remember",
                        "memory": item,
                        "conversation_id": data.get("conversation_id"),
                        "orchestration": route,
                    }
                )
            if action == "forget":
                removed = await remove_memories_async(self.hass, payload)
                speech = (
                    "C'est oublié."
                    if removed
                    else "Je ne trouve pas cette information dans ma mémoire."
                )
                return self.json(
                    {
                        "response": {"speech": {"plain": {"speech": speech}}},
                        "memory_action": "forget",
                        "removed": removed,
                        "conversation_id": data.get("conversation_id"),
                        "orchestration": route,
                    }
                )
            if action == "recall":
                memories = await search_memories_async(self.hass, "", 20)
                speech = (
                    "Je n'ai encore rien en mémoire."
                    if not memories
                    else "Voici ce que j'ai mémorisé : "
                    + "; ".join(item["text"] for item in memories[:10])
                )
                return self.json(
                    {
                        "response": {"speech": {"plain": {"speech": speech}}},
                        "memory_action": "recall",
                        "memories": memories,
                        "conversation_id": data.get("conversation_id"),
                        "orchestration": route,
                    }
                )

        conversation_id = data.get("conversation_id")
        conversation_id = (
            conversation_id.strip()
            if isinstance(conversation_id, str) and conversation_id.strip()
            else None
        )
        requested_pipeline = data.get("pipeline")
        requested_pipeline = (
            str(requested_pipeline).strip() or None
            if requested_pipeline is not None
            else None
        )

        try:
            agent_id, pipeline_name = self._select_agent(requested_pipeline)
            contextual_text = await self._memory_context(text)
            payload = {
                "text": contextual_text + text if contextual_text else text,
                "agent_id": agent_id,
            }
            if conversation_id:
                payload["conversation_id"] = conversation_id
            result = await self.hass.services.async_call(
                "conversation",
                "process",
                payload,
                blocking=True,
                return_response=True,
            )
        except Exception as err:
            return self.json_message(f"Assist error: {err}", status_code=502)

        response = result or {}
        response_data = response.get("response", {}) if isinstance(response, dict) else {}
        new_conversation_id = (
            response.get("conversation_id") if isinstance(response, dict) else None
        )
        return self.json(
            {
                "response": response_data,
                "conversation_id": new_conversation_id or conversation_id,
                "agent_id": agent_id,
                "pipeline_name": pipeline_name,
                "orchestration": route,
                "pipelines": [
                    {
                        "id": p.id,
                        "name": p.name,
                        "conversation_engine": p.conversation_engine,
                    }
                    for p in self._pipelines()
                ],
                "continue_conversation": response.get("continue_conversation", False)
                if isinstance(response, dict)
                else False,
            }
        )
