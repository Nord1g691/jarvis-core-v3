"""JARVIS Core V3 Home Assistant integration."""
from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url, async_register_built_in_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, FRONTEND_FILE, FRONTEND_URL, PANEL_URL
from .conversation import JarvisConversationView

PLATFORMS = ["sensor"]
ASSET_VERSION = "3.0.9"
FRONTEND_FILE_VERSIONED = f"{FRONTEND_FILE}?v={ASSET_VERSION}"
HUD_CONFIG_FILE = f"{FRONTEND_URL}/jarvis-hud-config.js?v={ASSET_VERSION}"
SOLAR_BRIDGE_FILE = f"{FRONTEND_URL}/jarvis-solar-bridge.js?v={ASSET_VERSION}"
STABILIZER_FILE = f"{FRONTEND_URL}/jarvis-v308-stabilizer.js?v={ASSET_VERSION}"
SETTINGS_FILE = f"{FRONTEND_URL}/jarvis-v308-settings.js?v={ASSET_VERSION}"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up JARVIS Core V3 and register its single frontend panel."""
    hass.data.setdefault(DOMAIN, {})
    hass.http.register_view(JarvisConversationView(hass))

    frontend_dir = Path(__file__).parent / "frontend"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(FRONTEND_URL, str(frontend_dir), cache_headers=False)]
    )

    add_extra_js_url(hass, FRONTEND_FILE_VERSIONED)
    add_extra_js_url(hass, HUD_CONFIG_FILE)
    add_extra_js_url(hass, SOLAR_BRIDGE_FILE)
    add_extra_js_url(hass, STABILIZER_FILE)
    add_extra_js_url(hass, SETTINGS_FILE)

    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="JARVIS",
        sidebar_icon="mdi:robot-outline",
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": "jarvis-core-hud",
                "module_url": FRONTEND_FILE_VERSIONED,
                "embed_iframe": False,
                "trust_external": False,
            }
        },
        require_admin=False,
        update=True,
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up JARVIS Core V3 from a config entry."""
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = entry.data
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload JARVIS Core V3 from a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return unloaded
