"""Compatibility provider for the JARVIS briefing endpoint.

The Sentinel implementation lives in :mod:`.sentinel`.  This stable wrapper
keeps the briefing API decoupled from the implementation module name.
"""
from __future__ import annotations

from homeassistant.core import HomeAssistant

from .sentinel import current_security_snapshot


def build_sentinel_snapshot(hass: HomeAssistant) -> dict:
    """Return the normalized, read-only Sentinel security snapshot."""
    return current_security_snapshot(hass)
