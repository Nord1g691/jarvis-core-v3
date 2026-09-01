"""JARVIS Core V3 Home Assistant integration."""
from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, FRONTEND_URL, PANEL_URL
from .conversation import JarvisConversationView
from .memory import JarvisMemoryView

PLATFORMS = ["sensor"]
ASSET_VERSION = "3.0.22"
PANEL_MODULE = f"{FRONTEND_URL}/jarvis-panel.js?v={ASSET_VERSION}"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up JARVIS Core V3 and register its single frontend panel."""
    hass.data.setdefault(DOMAIN, {})
    hass.http.register_view(JarvisConversationView(hass))
    hass.http.register_view(JarvisMemoryView(hass))
    frontend_dir = Path(__file__).parent / "frontend"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(FRONTEND_URL, str(frontend_dir), cache_headers=False)]
    )
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="JARVIS",
        sidebar_icon="mdi:robot-outline",
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": "jarvis-panel",
                "module_url": PANEL_MODULE,
                "embed_iframe": False,
                "trust_external": False,
            }
        },
        require_admin=False,
        update=True,
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = entry.data
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return unloaded
