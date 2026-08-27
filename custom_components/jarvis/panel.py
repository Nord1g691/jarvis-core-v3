"""JARVIS Core V3 sidebar panel."""

from __future__ import annotations

from pathlib import Path

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant


class JarvisPanelView(HomeAssistantView):
    """Serve the JARVIS V3 HUD."""

    url = "/jarvis-core-v3"
    name = "api:jarvis_core_v3:panel"
    requires_auth = True

    async def get(self, request):
        """Return the HUD HTML."""
        path = Path(__file__).parent / "frontend" / "index.html"
        return web.FileResponse(path)


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the JARVIS panel HTTP view."""
    hass.http.register_view(JarvisPanelView())
