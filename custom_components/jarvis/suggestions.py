"""Read-only suggestion engine for JARVIS Core V3.

This module observes current Home Assistant state and returns conservative
suggestions. It never creates automations, calls services, or changes state.
"""
from __future__ import annotations

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant


class JarvisSuggestionsView(HomeAssistantView):
    """Expose safe, read-only automation suggestions."""

    url = "/api/jarvis/suggestions"
    name = "api:jarvis:suggestions"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    def _state(self, entity_id: str):
        return self.hass.states.get(entity_id)

    def _entity_exists(self, entity_id: str) -> bool:
        return self._state(entity_id) is not None

    def _suggestions(self) -> list[dict[str, object]]:
        suggestions: list[dict[str, object]] = []

        prod = self._state("sensor.envoy_122323101280_production_solaire_instantanee")
        export = self._state("sensor.puissance_export_reseau")
        chauffe_eau = self._state("switch.chauffe_eau")
        voiture = self._state("switch.voiture_electrique_contacteur_1")

        if export and chauffe_eau:
            try:
                export_w = float(export.state)
            except (TypeError, ValueError):
                export_w = 0.0
            if export_w >= 1500 and chauffe_eau.state == "off":
                suggestions.append(
                    {
                        "id": "solar_surplus_water_heater",
                        "agent": "energy",
                        "title": "Utiliser le surplus pour le chauffe-eau",
                        "reason": "Un surplus réseau important est disponible alors que le chauffe-eau est arrêté.",
                        "confidence": 0.82,
                        "mode": "observe_only",
                        "requires_confirmation": True,
                    }
                )

        if export and voiture:
            try:
                export_w = float(export.state)
            except (TypeError, ValueError):
                export_w = 0.0
            if export_w >= 1800 and voiture.state == "off":
                suggestions.append(
                    {
                        "id": "solar_surplus_ev",
                        "agent": "energy",
                        "title": "Profiter du surplus pour la voiture",
                        "reason": "La maison exporte suffisamment pour envisager la charge du véhicule.",
                        "confidence": 0.78,
                        "mode": "observe_only",
                        "requires_confirmation": True,
                    }
                )

        open_covers = [
            s
            for s in self.hass.states.async_all("cover")
            if s.state in {"open", "opening"}
        ]
        if len(open_covers) >= 3:
            suggestions.append(
                {
                    "id": "many_covers_open",
                    "agent": "home",
                    "title": "Créer une scène de fermeture groupée",
                    "reason": f"{len(open_covers)} ouvertures sont actuellement ouvertes.",
                    "confidence": 0.62,
                    "mode": "observe_only",
                    "requires_confirmation": True,
                }
            )

        unavailable_critical = []
        for s in self.hass.states.async_all():
            if s.state not in {"unavailable", "unknown"}:
                continue
            if s.domain in {"camera", "alarm_control_panel", "lock", "climate"}:
                unavailable_critical.append(s)
        if unavailable_critical:
            suggestions.append(
                {
                    "id": "critical_entities_unavailable",
                    "agent": "technical",
                    "title": "Surveiller les entités critiques indisponibles",
                    "reason": f"{len(unavailable_critical)} entité(s) importante(s) sont indisponibles ou inconnues.",
                    "confidence": 0.9,
                    "mode": "observe_only",
                    "requires_confirmation": True,
                }
            )

        if prod and not suggestions:
            suggestions.append(
                {
                    "id": "no_actionable_pattern",
                    "agent": "jarvis",
                    "title": "Aucune suggestion prioritaire",
                    "reason": "Aucun motif suffisamment clair n'est détecté dans l'état actuel de la maison.",
                    "confidence": 0.5,
                    "mode": "observe_only",
                    "requires_confirmation": True,
                }
            )

        return suggestions[:12]

    async def get(self, request: web.Request) -> web.Response:
        return self.json(
            {
                "mode": "observe_only",
                "can_write": False,
                "suggestions": self._suggestions(),
            }
        )
