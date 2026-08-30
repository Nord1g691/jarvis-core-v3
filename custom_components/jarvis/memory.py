"""Persistent, explicit JARVIS memory for Home Assistant."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant


MEMORY_FILE = "jarvis_memory.json"
MAX_ITEMS = 500


def _path(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(MEMORY_FILE))


def _load(hass: HomeAssistant) -> list[dict[str, Any]]:
    path = _path(hass)
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data[-MAX_ITEMS:]
    except (OSError, ValueError, TypeError):
        pass
    return []


def _save(hass: HomeAssistant, items: list[dict[str, Any]]) -> None:
    path = _path(hass)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(
        json.dumps(items[-MAX_ITEMS:], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    tmp.replace(path)


def add_memory(
    hass: HomeAssistant, text: str, category: str = "personal"
) -> dict[str, Any]:
    text = " ".join(text.split()).strip()
    if not text:
        raise ValueError("empty memory")
    items = _load(hass)
    now = datetime.now(timezone.utc).isoformat()
    for item in items:
        if item.get("text", "").casefold() == text.casefold():
            item["updated_at"] = now
            _save(hass, items)
            return item
    item = {
        "id": f"m-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        "text": text,
        "category": category or "personal",
        "created_at": now,
        "updated_at": now,
    }
    items.append(item)
    _save(hass, items)
    return item


def remove_memories(hass: HomeAssistant, query: str) -> int:
    query = " ".join(query.split()).strip().casefold()
    if not query:
        return 0
    items = _load(hass)
    kept = [
        item
        for item in items
        if query not in str(item.get("text", "")).casefold()
    ]
    removed = len(items) - len(kept)
    if removed:
        _save(hass, kept)
    return removed


def remove_memory_by_id(hass: HomeAssistant, memory_id: str) -> int:
    memory_id = str(memory_id).strip()
    if not memory_id:
        return 0
    items = _load(hass)
    kept = [item for item in items if str(item.get("id", "")) != memory_id]
    removed = len(items) - len(kept)
    if removed:
        _save(hass, kept)
    return removed


def search_memories(
    hass: HomeAssistant, query: str = "", limit: int = 8
) -> list[dict[str, Any]]:
    items = _load(hass)
    query = " ".join(query.split()).strip().casefold()
    if not query:
        return list(reversed(items[-limit:]))
    terms = [x for x in re.split(r"\s+", query) if x]
    scored: list[tuple[int, dict[str, Any]]] = []
    for item in items:
        text = str(item.get("text", "")).casefold()
        score = sum(1 for term in terms if term in text)
        if score:
            scored.append((score, item))
    scored.sort(
        key=lambda pair: (pair[0], pair[1].get("updated_at", "")),
        reverse=True,
    )
    return [item for _, item in scored[:limit]]


class JarvisMemoryView(HomeAssistantView):
    """REST API for explicit persistent JARVIS memory."""

    url = "/api/jarvis/memory"
    name = "api:jarvis:memory"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request) -> web.Response:
        query = str(request.query.get("q", ""))
        try:
            limit = max(1, min(50, int(request.query.get("limit", "20"))))
        except ValueError:
            limit = 20
        return self.json({"memories": search_memories(self.hass, query, limit)})

    async def post(self, request: web.Request) -> web.Response:
        try:
            data = await request.json()
        except (TypeError, ValueError):
            return self.json_message("Invalid JSON", status_code=400)
        text = str(data.get("text", "")).strip()
        category = str(data.get("category", "personal")).strip() or "personal"
        try:
            item = add_memory(self.hass, text, category)
        except ValueError:
            return self.json_message("Missing memory text", status_code=400)
        return self.json({"memory": item})

    async def delete(self, request: web.Request) -> web.Response:
        memory_id = str(request.query.get("id", "")).strip()
        if memory_id:
            return self.json({"removed": remove_memory_by_id(self.hass, memory_id)})
        query = str(request.query.get("q", "")).strip()
        if query.casefold() == "all":
            items = _load(self.hass)
            _save(self.hass, [])
            return self.json({"removed": len(items)})
        return self.json({"removed": remove_memories(self.hass, query)})


def extract_explicit_memory(text: str) -> tuple[str, str] | None:
    """Return (action, payload) for deliberate memory commands only."""
    value = " ".join(text.split()).strip()
    patterns = [
        (
            "remember",
            r"^(?:jarvis[ ,]+)?(?:retiens|retient|mémorise|memorise|souviens[- ]toi)[ :,-]+(.+)$",
        ),
        (
            "forget",
            r"^(?:jarvis[ ,]+)?(?:oublie|efface de ta mémoire|efface de ta memoire)[ :,-]+(.+)$",
        ),
        (
            "recall",
            r"^(?:jarvis[ ,]+)?(?:que sais[- ]tu de moi|qu[' ]est[- ]ce que tu sais sur moi|montre(?:-moi)? ta mémoire|montre(?:-moi)? ta memoire)$",
        ),
    ]
    for action, pattern in patterns:
        match = re.match(pattern, value, re.IGNORECASE)
        if match:
            return action, (match.group(1).strip() if match.groups() else "")
    return None
