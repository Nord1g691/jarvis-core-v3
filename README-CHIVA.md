# CHIVA — Démo Safari

Cette branche contient une démonstration **100 % simulée** de CHIVA (télévision, lumière, climatisation, volet et portail). Elle ne se connecte ni à Home Assistant, ni à HomeKit, ni à Tuya. Aucune adresse privée ni aucun identifiant n'est inclus.

## Publier sur GitHub Pages

1. Ouvrir les [paramètres GitHub Pages](https://github.com/Nord1g691/jarvis-core-v3/settings/pages).
2. **Si un site Pages est déjà actif pour Jarvis, ne pas remplacer sa source** : il faudrait alors un dépôt dédié à CHIVA.
3. Sinon, sous **Build and deployment**, choisir **Deploy from a branch**.
4. Choisir la branche `chiva-demo` et le dossier `/(root)`, puis **Save**.
5. Quand GitHub indique que le site est publié, ouvrir `https://nord1g691.github.io/jarvis-core-v3/` depuis Safari.

La publication GitHub Pages peut prendre quelques minutes après l'activation. Cette branche n'a pas modifié `main`.

## Tester

Dans Safari, essayer successivement les onglets TV, lumière, clim, volet et portail. Le portail exige une confirmation fictive. Aucun équipement réel n'est commandé.
