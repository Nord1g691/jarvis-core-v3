"""JARVIS Core V3 sensor platform."""
from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .solar import (
    JarvisSelfConsumptionDailySensor,
    JarvisSelfConsumptionInstantSensor,
    JarvisSolarSensor,
    JarvisSolarSurplusSensor,
    TARGETS,
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities,
) -> None:
    """Create JARVIS power sensors with zero configuration."""
    async_add_entities(
        [JarvisSolarSensor(hass, entry.entry_id, key) for key in TARGETS]
        + [
            JarvisSolarSurplusSensor(hass, entry.entry_id),
            JarvisSelfConsumptionInstantSensor(hass, entry.entry_id),
            JarvisSelfConsumptionDailySensor(hass, entry.entry_id),
        ],
        update_before_add=True,
    )
