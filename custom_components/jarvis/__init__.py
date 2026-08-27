"""JARVIS Core V3 integration."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend
from homeassistant.core import HomeAssistant

DOMAIN = "jarvis"
PANEL_NAME = "jarvis"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up JARVIS Core V3."""
    await _async_register_panel(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry) -> bool:
    """Set up JARVIS Core V3 from a config entry."""
    await _async_register_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry) -> bool:
    """Unload JARVIS Core V3."""
    return True


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Register the JARVIS HUD in the Home Assistant sidebar."""
    if PANEL_NAME in hass.data.get(DOMAIN, set()):
        return

    frontend_dir = Path(__file__).parent / "frontend"
    hass.http.register_static_path(
        "/jarvis-core-v3",
        str(frontend_dir),
        cache_headers=False,
    )
    frontend.async_register_built_in_panel(
        hass,
        component_name="iframe",
        sidebar_title="JARVIS",
        sidebar_icon="mdi:robot",
        frontend_url_path=PANEL_NAME,
        config={"url": "/jarvis-core-v3/index.html"},
        require_admin=False,
    )
    hass.data.setdefault(DOMAIN, set()).add(PANEL_NAME)
