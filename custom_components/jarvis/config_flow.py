"""Config flow for JARVIS Core V3."""
from __future__ import annotations

from homeassistant import config_entries
from homeassistant.core import callback

from .const import DOMAIN


class JarvisConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Set up JARVIS Core V3 without manual entity configuration."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return JarvisOptionsFlow(config_entry)

    async def async_step_user(self, user_input=None):
        """Create the integration immediately."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        return self.async_create_entry(title="JARVIS Core Assistant", data={})


class JarvisOptionsFlow(config_entries.OptionsFlow):
    """No mandatory options: JARVIS discovers Home Assistant entities itself."""

    async def async_step_init(self, user_input=None):
        return self.async_create_entry(title="", data=user_input or {})
