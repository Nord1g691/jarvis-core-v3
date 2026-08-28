"""Config flow for JARVIS Core V3."""
from __future__ import annotations

from typing import Any

from homeassistant import config_entries
from homeassistant.core import callback

from .const import DOMAIN


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Set up JARVIS Core V3 without manual entity configuration."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        return OptionsFlow()

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        """Create the integration immediately; no entity IDs are required."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        return self.async_create_entry(
            title="JARVIS Core Assistant",
            data={},
        )


class OptionsFlow(config_entries.OptionsFlow):
    """Optional settings; the integration itself remains zero-configuration."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None):
        return self.async_create_entry(title="", data=user_input or {})
