"""JARVIS Core V3 sensor platform."""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfPower
from homeassistant.core import HomeAssistant

from .solar import (
    JarvisSolarSensor,
    JarvisSolarSurplusSensor,
    TARGETS,
    _self_consumption_watts,
    _values,
)


class JarvisSelfConsumptionInstantSensor(SensorEntity):
    """Instantaneous solar self-consumption power."""

    _attr_native_unit_of_measurement = UnitOfPower.WATT
    _attr_device_class = "power"
    _attr_should_poll = True
    _attr_has_entity_name = True

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self.hass = hass
        self._attr_unique_id = f"{entry_id}_self_consumption_instant_power"
        self._attr_name = "Solar self-consumption"
        self._attr_native_value = None

    def _refresh(self) -> None:
        values = _values(self.hass)
        self._attr_native_value = _self_consumption_watts(values)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._refresh()

    async def async_update(self) -> None:
        self._refresh()


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
        ],
        update_before_add=True,
    )
