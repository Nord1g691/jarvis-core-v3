"""JARVIS Core V3 Home Assistant integration."""
from __future__ import annotations
from pathlib import Path
from homeassistant.components.frontend import add_extra_js_url, async_register_built_in_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from .const import DOMAIN, FRONTEND_FILE, FRONTEND_URL, PANEL_URL
from .conversation import JarvisConversationView
from .memory import JarvisMemoryView

PLATFORMS = ["sensor"]
ASSET_VERSION = "3.0.13"
FRONTEND_FILE_VERSIONED = f"{FRONTEND_FILE}?v={ASSET_VERSION}"
HUD_CONFIG_FILE = f"{FRONTEND_URL}/jarvis-hud-config.js?v={ASSET_VERSION}"
SOLAR_BRIDGE_FILE = f"{FRONTEND_URL}/jarvis-solar-bridge.js?v={ASSET_VERSION}"
STABILIZER_FILE = f"{FRONTEND_URL}/jarvis-v308-stabilizer.js?v={ASSET_VERSION}"
UI_LAYER_FILE = f"{FRONTEND_URL}/jarvis-v311-ui-layer.js?v={ASSET_VERSION}"
MEMORY_UI_FILE = f"{FRONTEND_URL}/jarvis-v313-memory-ui.js?v={ASSET_VERSION}"

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up JARVIS Core V3 and register its single frontend panel."""
    hass.data.setdefault(DOMAIN, {})
    hass.http.register_view(JarvisConversationView(hass))
    hass.http.register_view(JarvisMemoryView(hass))
    frontend_dir = Path(__file__).parent / "frontend"
    await hass.http.async_register_static_paths([StaticPathConfig(FRONTEND_URL, str(frontend_dir), cache_headers=False)])
    for asset in (FRONTEND_FILE_VERSIONED, HUD_CONFIG_FILE, SOLAR_BRIDGE_FILE, STABILIZER_FILE, UI_LAYER_FILE, MEMORY_UI_FILE):
        add_extra_js_url(hass, asset)
    async_register_built_in_panel(hass, component_name="custom", sidebar_title="JARVIS", sidebar_icon="mdi:robot-outline", frontend_url_path=PANEL_URL, config={"_panel_custom": {"name": "jarvis-core-hud", "module_url": FRONTEND_FILE_VERSIONED, "embed_iframe": False, "trust_external": False}}, require_admin=False, update=True)
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = entry.data
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return unloaded
