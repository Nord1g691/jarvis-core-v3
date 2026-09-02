"""Persistent settings storage for JARVIS Core V3."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

_STORAGE_KEY = "jarvis.settings"
_STORAGE_VERSION = 1
_DATA_KEY = "_settings_store"

ALLOWED_SECTIONS = {
    "agent_autonomy",
    "entity_roles",
    "pipeline_map",
    "visual_mode",
    "core_size",
    "proposal_reviews",
}

DEFAULT_AGENT_AUTONOMY = {
    "jarvis": "suggest",
    "chef": "observe",
    "energy": "observe",
    "sentinel": "observe",
    "climate": "observe",
    "water": "observe",
    "media": "observe",
    "garden": "observe",
    "calendar": "observe",
    "mail": "observe",
    "home": "observe",
    "technical": "observe",
}

DEFAULT_ENTITY_ROLES = {
    "solar_production": "sensor.envoy_122323101280_production_solaire_instantanee",
    "grid_import": "sensor.puissance_import_reseau",
    "grid_export": "sensor.puissance_export_reseau",
    "water_heater": "switch.chauffe_eau",
    "water_heater_power": "sensor.chauffe_eau_puissance",
    "ev_charger": "switch.voiture_electrique_contacteur_1",
    "pool_filter": "switch.smart_power_outlet_3",
    "pool_filter_power": "sensor.filtration_piscine_puissance",
    "pool_heat_pump": "climate.pac_piscine",
}

DEFAULT_SETTINGS: dict[str, Any] = {
    "agent_autonomy": DEFAULT_AGENT_AUTONOMY,
    "entity_roles": DEFAULT_ENTITY_ROLES,
    "pipeline_map": {},
    "visual_mode": "classic",
    "core_size": 100,
    "proposal_reviews": {},
}


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    domain_data = hass.data.setdefault("jarvis", {})
    existing = domain_data.get(_DATA_KEY)
    if isinstance(existing, Store):
        return existing
    created: Store[dict[str, Any]] = Store(hass, _STORAGE_VERSION, _STORAGE_KEY)
    domain_data[_DATA_KEY] = created
    return created


def _merge_defaults(data: dict[str, Any] | None) -> dict[str, Any]:
    merged = deepcopy(DEFAULT_SETTINGS)
    if not isinstance(data, dict):
        return merged
    for key in ALLOWED_SECTIONS:
        value = data.get(key)
        if isinstance(merged.get(key), dict) and isinstance(value, dict):
            merged[key].update(value)
        elif value is not None:
            merged[key] = value
    return merged


async def async_get_settings(hass: HomeAssistant) -> dict[str, Any]:
    data = await _store(hass).async_load()
    return _merge_defaults(data)


async def async_update_setting(hass: HomeAssistant, section: str, value: Any) -> dict[str, Any]:
    if section not in ALLOWED_SECTIONS:
        raise ValueError(f"Unsupported settings section: {section}")
    settings = await async_get_settings(hass)
    settings[section] = value
    await _store(hass).async_save(settings)
    return settings


class JarvisSettingsView(HomeAssistantView):
    """Expose persistent JARVIS settings."""

    url = "/api/jarvis/settings"
    name = "api:jarvis:settings"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request) -> web.Response:
        raw = await _store(self.hass).async_load()
        return self.json(
            {
                "settings": _merge_defaults(raw),
                "persistent": True,
                "initialized": isinstance(raw, dict),
            }
        )

    async def post(self, request: web.Request) -> web.Response:
        try:
            data = await request.json()
        except (TypeError, ValueError):
            return self.json_message("Invalid JSON", status_code=400)
        section = str(data.get("section", "")).strip()
        if section not in ALLOWED_SECTIONS:
            return self.json_message("Unsupported settings section", status_code=400)
        value = data.get("value")
        try:
            settings = await async_update_setting(self.hass, section, value)
        except ValueError as err:
            return self.json_message(str(err), status_code=400)
        return self.json({"saved": True, "section": section, "settings": settings})
