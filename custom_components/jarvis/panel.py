"""JARVIS Core V3 sidebar panel registration."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.http import KEY_AUTH_DOMAIN

from . import DOMAIN


class JarvisPanelView(HomeAssistantView):
    """Serve the JARVIS V3 HUD from the integration."""

    url = "/jarvis-core-v3"
    name = "api:jarvis_core_v3:panel"
    requires_auth = True

    async def get(self, request):
        """Return the JARVIS HUD."""
        path = Path(__file__).parent / "frontend" / "index.html"
        return await self.json({"panel": str(path)})


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the sidebar panel resources."""
    hass.http.register_view(JarvisPanelView())
