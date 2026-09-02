"""Tests for the side-effect-free JARVIS routing policy."""

from custom_components.jarvis.orchestrator import classify_request


def test_general_request_stays_with_jarvis() -> None:
    route = classify_request("Bonjour, comment vas-tu ?")
    assert route["agent"] == "jarvis"
    assert route["mode"] == "direct"


def test_simple_specialist_question_is_background_consultation() -> None:
    route = classify_request("Quelle est la température de la piscine ?")
    assert route["agent"] == "water"
    assert route["mode"] == "consult"


def test_direct_home_action_keeps_jarvis_as_speaker() -> None:
    route = classify_request("Allume la télévision")
    assert route["agent"] == "media"
    assert route["mode"] == "direct"


def test_deep_request_transfers_to_specialist() -> None:
    route = classify_request("Analyse la consommation solaire de cette semaine")
    assert route["agent"] == "energy"
    assert route["mode"] == "transfer"


def test_explicit_handoff_transfers_to_named_domain() -> None:
    route = classify_request("Passe-moi le Chef pour préparer les menus")
    assert route["agent"] == "chef"
    assert route["mode"] == "transfer"
    assert route["handoff_requested"] is True


def test_return_to_jarvis_wins_over_domain_keywords() -> None:
    route = classify_request("Repasse-moi Jarvis pour la piscine")
    assert route["agent"] == "jarvis"
    assert route["mode"] == "direct"


def test_bedroom_fan_routes_to_climate() -> None:
    route = classify_request("Mets le ventilateur de la chambre à 50 pour cent")
    assert route["agent"] == "climate"
    assert route["mode"] == "direct"
