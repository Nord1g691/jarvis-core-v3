"""JARVIS Core V3 integration."""

from homeassistant.core import HomeAssistant

DOMAIN = "jarvis"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up JARVIS Core V3."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry) -> bool:
    """Set up JARVIS Core V3 from a config entry."""
    return True


async def async_unload_entry(hass: HomeAssistant, entry) -> bool:
    """Unload JARVIS Core V3."""
    return True
