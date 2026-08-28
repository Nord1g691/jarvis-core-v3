"""Automatic solar power detection and calculation for JARVIS Core V3."""
from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfPower
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event


@dataclass
class _Candidate:
    entity_id: str | None = None
    score: int = -1


TARGETS = {
    "production": ("solar", "solaire", "production", "photovolta", "pv", "produit", "produced"),
    "consumption": ("consumption", "consommation", "maison", "house", "home", "load", "total", "usage", "consumed"),
    "import": ("import", "importation", "grid import", "réseau import", "from grid", "net import"),
    "export": ("export", "exportation", "grid export", "réseau export", "injection", "to grid", "net export"),
}


def _norm(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value).lower()).strip()


def _score(state: Any, keywords: tuple[str, ...]) -> int:
    if state.entity_id.startswith("sensor.jarvis_"):
        return -100
    attrs = state.attributes
    unit = _norm(attrs.get("unit_of_measurement", ""))
    dc = _norm(attrs.get("device_class", ""))
    if dc not in {"power", ""} and unit not in {"w", "kw"}:
        return -100
    if unit not in {"w", "kw"} and dc != "power":
        return -100
    text = " ".join(_norm(attrs.get(k, "")) for k in ("friendly_name", "name", "device_class", "state_class"))
    text += " " + _norm(state.entity_id)
    score = 1 + (10 if dc == "power" else 0) + (4 if unit in {"w", "kw"} else 0)
    for keyword in keywords:
        kw = _norm(keyword)
        if kw and kw in text:
            score += 8
    if "envoy" in text or "enphase" in text:
        score += 4
    if any(x in text for x in ("energy", "kwh", "voltage", "current", "frequency")):
        score -= 20
    return score


def discover_power_sources(hass: HomeAssistant) -> dict[str, str | None]:
    states = [s for s in hass.states.async_all("sensor") if not s.entity_id.startswith("sensor.jarvis_")]
    result: dict[str, str | None] = {}
    used: set[str] = set()
    for target in TARGETS:
        best = _Candidate()
        for state in states:
            if state.entity_id in used:
                continue
            score = _score(state, TARGETS[target])
            if score > best.score:
                best = _Candidate(state.entity_id, score)
        result[target] = best.entity_id if best.score >= 12 else None
        if result[target]:
            used.add(result[target])
    return result


def _watts(state: Any) -> float | None:
    if state is None:
        return None
    try:
        value = float(state.state)
    except (TypeError, ValueError):
        return None
    unit = _norm(state.attributes.get("unit_of_measurement", "W"))
    return value * 1000 if unit == "kw" else value


class JarvisSolarSensor(SensorEntity):
    _attr_native_unit_of_measurement = UnitOfPower.WATT
    _attr_device_class = "power"
    _attr_should_poll = True
    _attr_has_entity_name = True

    def __init__(self, hass: HomeAssistant, entry_id: str, key: str) -> None:
        self.hass = hass
        self._key = key
        self._attr_unique_id = f"{entry_id}_{key}_power"
        self._attr_name = {
            "production": "Solar production",
            "consumption": "Home consumption",
            "import": "Grid import",
            "export": "Grid export",
        }[key]
        self._attr_native_value = None
        self._source: str | None = None

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._refresh()
        @callback
        def _changed(_event) -> None:
            self._refresh()
            self.async_write_ha_state()
        self.async_on_remove(async_track_state_change_event(self.hass, [s.entity_id for s in self.hass.states.async_all("sensor")], _changed))

    def _refresh(self) -> None:
        self._source = discover_power_sources(self.hass).get(self._key)
        state = self.hass.states.get(self._source) if self._source else None
        self._attr_native_value = _watts(state)
        self._attr_extra_state_attributes = {
            "source_entity": self._source,
            "auto_discovered": self._source is not None,
        }

    async def async_update(self) -> None:
        self._refresh()


class JarvisSolarSurplusSensor(SensorEntity):
    _attr_native_unit_of_measurement = UnitOfPower.WATT
    _attr_device_class = "power"
    _attr_should_poll = True
    _attr_has_entity_name = True

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self.hass = hass
        self._attr_unique_id = f"{entry_id}_solar_surplus_power"
        self._attr_name = "Solar surplus"
        self._attr_native_value = None

    def _refresh(self) -> None:
        sources = discover_power_sources(self.hass)
        production = _watts(self.hass.states.get(sources.get("production")))
        consumption = _watts(self.hass.states.get(sources.get("consumption")))
        export = _watts(self.hass.states.get(sources.get("export")))
        if production is not None and consumption is not None:
            surplus = production - consumption
        elif export is not None:
            surplus = export
        else:
            surplus = None
        self._attr_native_value = max(0.0, surplus) if surplus is not None else None
        self._attr_extra_state_attributes = {
            "production_source": sources.get("production"),
            "consumption_source": sources.get("consumption"),
            "export_source": sources.get("export"),
            "auto_discovered": any(sources.values()),
        }

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._refresh()

    async def async_update(self) -> None:
        self._refresh()


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    async_add_entities(
        [
            JarvisSolarSensor(hass, entry.entry_id, key) for key in TARGETS
        ] + [JarvisSolarSurplusSensor(hass, entry.entry_id)],
        update_before_add=True,
    )
