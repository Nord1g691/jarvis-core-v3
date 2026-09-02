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
    ("chef", re.compile(r"\b(chef|cuisine|cuisin|repas|recette|menus?|courses?|manger|déjeuner|dejeuner|d[îi]ner)\b", re.I)),
    ("energy", re.compile(r"\b(énergie|energie|solaire|photovolta|surplus|consommation|conso|réseau|reseau|chauffe.?eau|voiture électrique|ve\b)" , re.I)),
    ("sentinel", re.compile(r"\b(sécur|secur|caméra|camera|portail|intrusion|alarme|présence|presence|visiteur|colis|sentinel)\b", re.I)),
    ("water", re.compile(r"\b(piscine|eau|arrosage|jardinage eau|filtration|ph\b|chlore|oxygène|oxygene|adoucisseur)\b", re.I)),
    ("climate", re.compile(r"\b(chauffage|chauffer|clim|climatisation|thermostat|température|temperature|pac\b)" , re.I)),
    ("media", re.compile(r"\b(tv|télé|tele|télévision|television|musique|spotify|média|media|volume|apple tv|chromecast)\b", re.I)),
    ("garden", re.compile(r"\b(jardin|plante|potager|haie|pelouse|tondeuse|paysagiste)\b", re.I)),
    ("calendar", re.compile(r"\b(calendrier|agenda|rendez.?vous|planning|demain|semaine|école|ecole|crèche|creche)\b", re.I)),
    ("mail", re.compile(r"\b(mail|email|e-mail|message|boîte de réception|boite de reception|inbox)\b", re.I)),
    ("technical", re.compile(r"\b(diagnostic|debug|erreur|home assistant|intégration|integration|entité|entity|jarvis core|mcp)\b", re.I)),
    ("home", re.compile(r"\b(maison|entretien|notice|manuel|facture|garantie|document)\b", re.I)),
)

_RETURN_TO_JARVIS = re.compile(
    r"\b(repasse|reviens|retourne|retour)(?:[- ]moi)?\s+(?:à\s+|a\s+|vers\s+)?jarvis\b",
    re.I,
)
_EXPLICIT_HANDOFF = re.compile(
    r"\b(?:passe(?:z)?[- ]?moi|je veux parler|fais[- ]?moi parler|mets[- ]?moi)\b",
    re.I,
)
_DEEP_REQUEST = re.compile(
    r"\b(?:analyse|diagnostic complet|planifie|prépare|prepare|compare|conseille|"
    r"accompagne|optimise|projet|étape par étape|etape par etape)\b",
    re.I,
)
_DIRECT_ACTION = re.compile(
    r"^\s*(?:allume|éteins|eteins|ouvre|ferme|monte|descends|mets|lance|arrête|arrete)\b",
    re.I,
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


def classify_request(text: str) -> dict[str, str | float | bool]:
    """Classify a request and select the orchestration interaction mode.

    ``direct`` keeps JARVIS as the sole speaker, ``consult`` lets JARVIS use a
    specialist in the background, and ``transfer`` opens a specialist exchange.
    This function remains side-effect free: execution is owned by the conversation
    bridge.
    """
    clean = str(text or "").strip()
    if not clean:
        return {
            "agent": "jarvis",
            "confidence": 0.0,
            "reason": "empty",
            "mode": "direct",
            "handoff_requested": False,
        }

    if _RETURN_TO_JARVIS.search(clean):
        return {
            "agent": "jarvis",
            "confidence": 1.0,
            "reason": "return_to_jarvis",
            "mode": "direct",
            "handoff_requested": False,
        }

    agent = "jarvis"
    confidence = 0.45
    reason = "general"
    for key, pattern in _PATTERNS:
        match = pattern.search(clean)
        if match:
            agent = key
            confidence = 0.82
            reason = match.group(0)
            break

    handoff_requested = bool(_EXPLICIT_HANDOFF.search(clean))
    if handoff_requested and agent != "jarvis":
        mode = "transfer"
        confidence = 1.0
    elif agent == "jarvis" or _DIRECT_ACTION.search(clean):
        mode = "direct"
    elif _DEEP_REQUEST.search(clean):
        mode = "transfer"
    else:
        mode = "consult"

    return {
        "agent": agent,
        "confidence": confidence,
        "reason": reason,
        "mode": mode,
        "handoff_requested": handoff_requested,
    }
