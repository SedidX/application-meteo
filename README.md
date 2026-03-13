# Météo Transports — Affichage météo pour écrans de transport en commun

Application météo destinée aux écrans d'information dans les stations et les transports en commun de villes françaises.

## Présentation

Ce projet est une adaptation du projet open-source [weather-app](https://github.com/madzadev/weather-app) de madzadev.

### Modifications apportées

1. **Changement d'API** : remplacement d'OpenWeatherMap par **Open-Meteo** (gratuit, sans clé).
2. **Suppression du moteur de recherche** : la ville est configurée dans `config/city.json`.
3. **Fichier de configuration** : `config/city.json` centralise les informations de la ville.
4. **Rafraîchissement automatique** : les données sont mises à jour toutes les heures.

## Configuration de la ville

Éditer `config/city.json` :

```json
{
  "name": "Grenoble",
  "country": "FR",
  "latitude": 45.1885,
  "longitude": 5.7245,
  "timezone": "Europe/Paris"
}
```

## Installation

```bash
git clone <url-du-depot>
cd application-meteo
npm install
npm run dev
```

Aucune clé API n'est nécessaire.

## Architecture

```
config/
  city.json           ← configuration de la ville (à modifier par l'exploitant)
pages/
  index.js            ← page principale, sans recherche, avec rafraîchissement horaire
  api/
    data.js           ← route API : lit city.json, appelle Open-Meteo, normalise la réponse
components/           ← composants d'affichage (inchangés)
services/
  helpers.js          ← fonctions utilitaires (inchangées)
  converters.js       ← conversions d'unités (inchangées)
```

## Fonctionnement de la récupération des données

1. Au démarrage et toutes les heures, `pages/index.js` appelle `GET /api/data`.
2. La route lit `config/city.json` pour obtenir les coordonnées GPS.
3. Elle construit une requête vers `https://api.open-meteo.com/v1/forecast`.
4. La réponse Open-Meteo est normalisée vers la structure attendue par les composants existants.
5. Les données sont retournées et affichées.

## Améliorations possibles

- **Multi-villes** : tableau de villes dans la config pour basculer entre lignes.
- **Prévisions horaires** : utiliser les données `hourly` d'Open-Meteo.
- **Mode nuit** : adapter l'affichage via le champ `is_day`.
- **Qualité de l'air** : intégrer l'API Air Quality d'Open-Meteo.
- **Build statique** : `next export` pour la webview des écrans embarqués.

## Licence

MIT — projet original par [madzadev](https://github.com/madzadev/weather-app).
