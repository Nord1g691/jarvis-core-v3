"""Zero-configuration config flow for JARVIS Core V3."""
from __future__ import annotations

from homeassistant import config_entries

from .const import DOMAIN


class JarvisConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Set up JARVIS Core V3 without manual entity configuration."""

    VERSION = 4

    async def async_step_user(self, user_input=None):
        """Create the integration immediately; sensors are auto-discovered."""
        return self.async_create_entry(
            title="JARVIS Core Assistant",
            data={
                "voice_enabled": True,
                "solar_enabled": True,
                "satellite_enabled": True,
                "assist_agent": None,
            },
        )
