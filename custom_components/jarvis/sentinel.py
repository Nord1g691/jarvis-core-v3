"""Sentinel provider helpers for current HA security sources and future Frigate.

This module is intentionally lightweight and read-only. It lets JARVIS/Sentinel
consume today's Home Assistant entities while exposing a stable provider shape
that Frigate can fill later without changing the orchestration contract.
"""
from __future__ import annotations

from homeassistant.core import HomeAssistant


def _state_item(state) -> dict[str, str]:
    return {
        "entity_id": state.entity_id,
        "name": state.name,
        "state": state.state,
    }


def current_security_snapshot(hass: HomeAssistant) -> dict:
    """Return normalized security data from entities already available in HA."""
    cameras: list[dict[str, str]] = []
    alarms: list[dict[str, str]] = []
    locks: list[dict[str, str]] = []
    binary: list[dict[str, str]] = []
    frigate_entities: list[dict[str, str]] = []

    for state in hass.states.async_all():
        entity_l = state.entity_id.casefold()
        name_l = state.name.casefold()
        looks_frigate = "frigate" in entity_l or "frigate" in name_l

        if state.domain == "camera":
            cameras.append(_state_item(state))
        elif state.domain == "alarm_control_panel":
            alarms.append(_state_item(state))
        elif state.domain == "lock":
            locks.append(_state_item(state))
        elif state.domain == "binary_sensor":
            device_class = str(state.attributes.get("device_class") or "")
            if device_class in {
                "door", "window", "opening", "motion", "occupancy", "presence",
                "smoke", "moisture", "safety", "sound",
            }:
                item = _state_item(state)
                item["device_class"] = device_class
                binary.append(item)

        if looks_frigate:
            frigate_entities.append(_state_item(state))

    mqtt_available = "mqtt" in hass.config.components
    frigate_detected = bool(frigate_entities)

    return {
        "providers": {
            "home_assistant": {
                "available": True,
                "read_only": True,
            },
            "frigate": {
                "available": frigate_detected,
                "prepared": True,
                "mqtt_available": mqtt_available,
                "read_only": True,
                "audio_ready_when_enabled": True,
            },
        },
        "cameras": cameras[:50],
        "alarms": alarms[:20],
        "locks": locks[:50],
        "binary_sensors": binary[:150],
        "frigate_entities": frigate_entities[:100],
    }
