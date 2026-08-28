"""Automatic solar power detection and calculation for JARVIS Core V3."""
from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfPower
from homeassistant.core import HomeAssistant


@dataclass
class _Candidate:
    entity_id: str | None = None
    score: int = -1


TARGETS = {
    "production": ("solar", "solaire", "production", "photovolta", "pv", "produced"),
    "consumption": ("consumption", "consommation", "maison", "house", "home", "load", "usage", "consumed"),
    "import": ("import", "importation", "grid import", "import réseau", "from grid", "net import"),
    "export": ("export", "exportation", "grid export", "export réseau", "injection", "to grid", "net export"),
}

_EXCLUSIONS = {
    "production": ("consommation", "consumption", "import", "export", "battery", "batterie"),
    "consumption": ("production", "solaire", "solar", "photovolta", "import", "export", "battery", "batterie"),
    "import": ("export", "production", "solaire", "solar", "consommation", "consumption"),
    "export": ("import", "production", "solaire", "solar", "consommation", "consumption"),
}


def _norm(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value).lower()).strip()


def _score(state: Any, target: str) -> int:
    if state.entity_id.startswith("sensor.jarvis_"):
        return -1000
    attrs = state.attributes
    unit = _norm(attrs.get("unit_of_measurement", ""))
    dc = _norm(attrs.get("device_class", ""))
    if unit not in {"w", "kw"} and dc != "power":
        return -1000
    text = " ".join(_norm(attrs.get(k, "")) for k in ("friendly_name", "name", "device_class", "state_class"))
    text += " " + _norm(state.entity_id)
    score = 1 + (25 if dc == "power" else 0) + (10 if unit in {"w", "kw"} else 0)
    if "envoy" in text or "enphase" in text:
        score += 15
    for keyword in TARGETS[target]:
        kw = _norm(keyword)
        if kw and kw in text:
            score += 25 if " " in kw else 12
    for excluded in _EXCLUSIONS[target]:
        ex = _norm(excluded)
        if ex and ex in text:
            score -= 50
    if any(x in text for x in ("energy", "kwh", "voltage", "current", "frequency")):
        score -= 150
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
            score = _score(state, target)
            if score > best.score:
                best = _Candidate(state.entity_id, score)
        result[target] = best.entity_id if best.score >= 35 else None
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
    if not value == value or value in (float("inf"), float("-inf")):
        return None
    unit = _norm(state.attributes.get("unit_of_measurement", "w"))
    if unit == "kw":
        value *= 1000
    return max(0.0, value)


def _values(hass: HomeAssistant) -> dict[str, float | None]:
    sources = discover_power_sources(hass)
    values = {key: _watts(hass.states.get(entity)) for key, entity in sources.items()}

    # Prefer direct home consumption. If unavailable, reconstruct it from
    # solar production and signed grid flow when possible.
    if values.get("consumption") is None:
        production = values.get("production")
        grid_import = values.get("import")
        grid_export = values.get("export")
        if production is not None and grid_import is not None and grid_export is not None:
            values["consumption"] = max(0.0, production + grid_import - grid_export)
    return values


def _self_consumption_watts(values: dict[str, float | None]) -> float | None:
    production = values.get("production")
    consumption = values.get("consumption")
    export = values.get("export")
    if production is not None and consumption is not None:
        return max(0.0, min(production, consumption))
    if production is not None and export is not None:
        return max(0.0, production - export)
    return None


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

    def _refresh(self) -> None:
        sources = discover_power_sources(self.hass)
        values = _values(self.hass)
        source = sources.get(self._key)
        self._attr_native_value = values.get(self._key) if self._key == "consumption" and source is None else (_watts(self.hass.states.get(source)) if source else None)
        self._attr_extra_state_attributes = {"source_entity": source, "auto_discovered": source is not None}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._refresh()

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
        values = _values(self.hass)
        production = values.get("production")
        consumption = values.get("consumption")
        export = values.get("export")
        surplus = (production - consumption) if production is not None and consumption is not None else export
        self._attr_native_value = max(0.0, surplus) if surplus is not None else None
        sources = discover_power_sources(self.hass)
        self._attr_extra_state_attributes = {"auto_discovered": any(sources.values()), **sources}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._refresh()

    async def async_update(self) -> None:
        self._refresh()


class JarvisSelfConsumptionInstantSensor(SensorEntity):
    _attr_native_unit_of_measurement = UnitOfPower.WATT
    _attr_device_class = "power"
    _attr_should_poll = True
    _attr_has_entity_name = True

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self.hass = hass
        self._attr_unique_id = f"{entry_id}_solar_self_consumption_power"
        self._attr_name = "Solar self-consumption"
        self._attr_native_value = None

    def _refresh(self) -> None:
        sources = discover_power_sources(self.hass)
        values = _values(self.hass)
        self._attr_native_value = _self_consumption_watts(values)
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
        [JarvisSolarSensor(hass, entry.entry_id, key) for key in TARGETS]
        + [JarvisSolarSurplusSensor(hass, entry.entry_id), JarvisSelfConsumptionInstantSensor(hass, entry.entry_id)],
        update_before_add=True,
    )
