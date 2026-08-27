"""Config flow for JARVIS Core V3."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant import config_entries

from . import DOMAIN


class JarvisConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle JARVIS Core V3 configuration."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Handle the initial setup."""
        if user_input is not None:
            return self.async_create_entry(
                title="JARVIS Core V3",
                data=user_input,
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
        )
