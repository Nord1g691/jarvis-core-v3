"""Lightweight orchestration contract for JARVIS Core V3.

This module deliberately does not execute Home Assistant actions. It classifies a
request, exposes the stable agent catalogue, and gives the frontend/backend a
shared vocabulary for future specialist agents.
"""
from __future__ import annotations

from dataclasses import dataclass
import re


@dataclass(frozen=True, slots=True)
class AgentDefinition:
    key: str
    name: str
    icon: str
    description: str
    default_color: str


AGENTS: tuple[AgentDefinition, ...] = (
    AgentDefinition("jarvis", "JARVIS", "mdi:robot-outline", "Interface centrale et orchestration", "#00eaff"),
    AgentDefinition("chef", "Chef", "mdi:chef-hat", "Repas, cuisine et courses", "#ff9f1c"),
    AgentDefinition("energy", "Énergie", "mdi:solar-power", "Photovoltaïque, consommation et optimisation", "#ffd60a"),
    AgentDefinition("sentinel", "Sentinel", "mdi:shield-home", "Sécurité, présence, caméras et anomalies", "#ff4050"),
    AgentDefinition("climate", "Climat", "mdi:home-thermometer", "Chauffage, climatisation et confort", "#7dd3fc"),
    AgentDefinition("water", "Eau / Piscine", "mdi:pool", "Eau, piscine, arrosage et traitement", "#38bdf8"),
    AgentDefinition("media", "Média", "mdi:television-speaker", "Télévision, musique et lecteurs", "#b56cff"),
    AgentDefinition("garden", "Jardin", "mdi:flower", "Jardin, plantes et extérieur", "#39ff88"),
    AgentDefinition("calendar", "Calendrier", "mdi:calendar-clock", "Agenda familial, rendez-vous et organisation", "#4ade80"),
    AgentDefinition("mail", "Messagerie", "mdi:email-outline", "Messages et mails utiles au foyer", "#60a5fa"),
    AgentDefinition("home", "Maison", "mdi:home-assistant", "Entretien, documents et état général de la maison", "#d7e3ea"),
    AgentDefinition("technical", "Technique", "mdi:wrench-cog", "Diagnostic Home Assistant et JARVIS", "#3b82f6"),
)

_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("chef", re.compile(r"\b(cuisine|cuisin|repas|recette|menu|courses?|manger|déjeuner|dejeuner|d[îi]ner)\b", re.I)),
    ("energy", re.compile(r"\b(énergie|energie|solaire|photovolta|surplus|consommation|conso|réseau|reseau|chauffe.?eau|voiture électrique|ve\b)" , re.I)),
    ("sentinel", re.compile(r"\b(sécur|secur|caméra|camera|portail|intrusion|alarme|présence|presence|visiteur|colis|sentinel)\b", re.I)),
    ("climate", re.compile(r"\b(chauffage|chauffer|clim|climatisation|thermostat|température|temperature|pac\b)" , re.I)),
    ("water", re.compile(r"\b(piscine|eau|arrosage|jardinage eau|filtration|ph\b|chlore|oxygène|oxygene|adoucisseur)\b", re.I)),
    ("media", re.compile(r"\b(tv|télé|tele|musique|spotify|média|media|volume|apple tv|chromecast)\b", re.I)),
    ("garden", re.compile(r"\b(jardin|plante|potager|haie|pelouse|tondeuse|paysagiste)\b", re.I)),
    ("calendar", re.compile(r"\b(calendrier|agenda|rendez.?vous|planning|demain|semaine|école|ecole|crèche|creche)\b", re.I)),
    ("mail", re.compile(r"\b(mail|email|e-mail|message|boîte de réception|boite de reception|inbox)\b", re.I)),
    ("technical", re.compile(r"\b(diagnostic|debug|erreur|home assistant|intégration|integration|entité|entity|jarvis core|mcp)\b", re.I)),
    ("home", re.compile(r"\b(maison|entretien|notice|manuel|facture|garantie|document)\b", re.I)),
)


def agent_catalog() -> list[dict[str, str]]:
    """Return a JSON-friendly specialist-agent catalogue."""
    return [
        {
            "key": agent.key,
            "name": agent.name,
            "icon": agent.icon,
            "description": agent.description,
            "default_color": agent.default_color,
        }
        for agent in AGENTS
    ]


def classify_request(text: str) -> dict[str, str | float]:
    """Classify a request without executing or delegating anything."""
    clean = str(text or "").strip()
    if not clean:
        return {"agent": "jarvis", "confidence": 0.0, "reason": "empty"}
    for key, pattern in _PATTERNS:
        match = pattern.search(clean)
        if match:
            return {"agent": key, "confidence": 0.82, "reason": match.group(0)}
    return {"agent": "jarvis", "confidence": 0.45, "reason": "general"}
