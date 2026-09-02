"""Constants for JARVIS Core 3."""
DOMAIN = "jarvis"
PANEL_URL = "jarvis"
FRONTEND_URL = "/jarvis_core"
FRONTEND_FILE = f"{FRONTEND_URL}/jarvis-core.js"
PREFERRED_ASSIST_FILE = f"{FRONTEND_URL}/jarvis-preferred-assist.js"
ENERGY_ENTITIES = {
    "production": "sensor.envoy_122323101280_production_solaire_instantanee",
    "consumption": "sensor.envoy_122323101280_consommation_electrique_actuelle",
    "import": "sensor.puissance_import_reseau",
    "export": "sensor.puissance_export_reseau",
}
SOLAR_MAX_W = 7000
SURPLUS_ON_W = 1500
SURPLUS_OFF_W = 500
REFRESH_SECONDS = 5
