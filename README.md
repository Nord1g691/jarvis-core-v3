# JARVIS Core V3

JARVIS Core V3 est une intégration Home Assistant indépendante qui fournit un HUD central, une orchestration par agents, une mémoire persistante et plusieurs outils de supervision de la maison.

Version actuelle : **3.0.26**

## Installation HACS

1. Ajoutez ce dépôt comme **dépôt personnalisé** dans HACS.
2. Type : **Integration**.
3. Installez **JARVIS Core V3**.
4. Redémarrez Home Assistant.
5. Ajoutez l’intégration depuis **Paramètres → Appareils et services**.

Repository : https://github.com/Nord1g691/jarvis-core-v3

## Fonctionnalités principales

- HUD JARVIS intégré à la barre latérale Home Assistant.
- États visuels : écoute, réflexion, recherche, réponse et erreur.
- Agents spécialisés : JARVIS, Chef, Énergie, Sentinel, Climat, Eau/Piscine, Média, Jardin, Calendrier, Messagerie, Maison et Technique.
- Mapping configurable des agents vers les pipelines Assist.
- Mémoire explicite persistante avec rappel et suppression.
- Inventaire de la structure Home Assistant et capacités disponibles.
- Centre de propositions JARVIS en mode non autonome.
- Niveaux d’autonomie configurables par agent, sans exécution sensible automatique dans cette version.
- Sentinel : état sécurité, événements récents et synthèse d’absence.
- Health Score global JARVIS / Maison avec sous-scores Core, Assist, Sécurité, Mémoire et Structure.
- Anneau de santé discret autour du cœur JARVIS.
- Cartes énergie et détection automatique des flux production / consommation / import / export.
- Rôles d’entités configurables pour rendre l’intégration réutilisable sur d’autres installations.
- Raccourcis gros consommateurs configurables.
- Persistance des réglages côté Home Assistant avec fallback local.

## Apparence

Cinq designs sont disponibles :

- Classic
- Holo Grid
- Sentinel Tactical
- Glass Orbital
- Neural Core

Le design et la couleur de l’agent sont deux couches indépendantes. Le design définit la structure visuelle ; la couleur suit l’agent ou l’état actif.

Le cœur JARVIS s’adapte automatiquement à la largeur et à la hauteur disponibles, notamment lors du passage portrait / paysage. Une taille manuelle de 55 % à 120 % est également disponible dans les réglages.

## Persistance multi-appareils

Les réglages principaux sont stockés côté Home Assistant :

- thème visuel ;
- taille du cœur ;
- rôles d’entités ;
- autonomie des agents ;
- mappings agents → pipelines ;
- décisions du Centre de propositions.

Après migration des anciens réglages locaux, Home Assistant devient la source de vérité afin d’éviter qu’un appareil ancien réécrive une configuration plus récente.

## Sécurité et autonomie

La V3.0.26 privilégie une autonomie progressive :

1. Observer
2. Suggérer
3. Agir avec confirmation
4. Autorisé

Les niveaux sont configurables, mais cette version ne déclenche pas automatiquement d’actions sensibles sur la simple base d’une suggestion.

## Structure du dépôt

L’intégration Home Assistant se trouve dans `custom_components/jarvis`.

Le frontend est chargé depuis `custom_components/jarvis/frontend` via le panneau JARVIS.

## Validation

Le dépôt utilise :

- Hassfest ;
- un workflow de validation JARVIS dédié.

Une release ne doit être considérée comme prête qu’après réussite de ces validations et test réel dans Home Assistant.

## Indépendance V2

JARVIS Core V3 est séparé de JARVIS Core V2 et n’a pas vocation à modifier l’ancienne intégration.
