# Pokémon Team Builder

Ein interaktives Single-Page-Tool, um Pokémon zu suchen, Typ-Beziehungen anzuzeigen, Sammelkarten zu entdecken und ein eigenes Team zusammenzustellen. Die Anwendung nutzt öffentliche APIs (PokeAPI und TCGdex) und speichert dein Team lokal im Browser.

## Features
- **Live-Suche**: Finde Pokémon per Nameingabe oder Zufallssuche und erhalte offizielle Artworks sowie Basiswerte.
- **Typ-Stärken & -Schwächen**: Automatisch aggregierte Beziehungen für alle Typ-Kombinationen.
- **TCG-Galerie**: Passende Trading-Card-Motive direkt im Interface.
- **Teamverwaltung**: Bis zu sechs Pokémon speichern, duplizierte Einträge verhindern und Einträge komfortabel entfernen.
- **Auto-Vervollständigung**: Vorschläge nach wenigen Buchstaben auf Basis aller bekannten Pokémon-Namen.

## Projektstruktur
```
modul133/
├── index.html       # Einstiegspunkt der Anwendung
├── css/
│   └── styles.css   # Layout & Styling
└── js/
    ├── constants.js # API-Endpunkte & Storage-Konfiguration
    ├── api.js       # Datenzugriff auf PokeAPI & TCGdex
    ├── team.js      # Teamlogik & Local-Storage-Handling
    ├── ui.js        # DOM-Manipulation & Rendering-Helfer
    └── main.js      # Event-Handling & App-Orchestrierung
```

## Lokale Nutzung
1. Repo klonen oder herunterladen.
2. Öffne `index.html` direkt im Browser **oder** starte einen einfachen Webserver, z. B. mit Python:
   ```bash
   python3 -m http.server 8000
   ```
3. Rufe die App unter `http://localhost:8000` auf.

> Hinweis: Da externe APIs genutzt werden, ist eine Internetverbindung erforderlich.

## Wichtige Abläufe
- **Suche**: `main.js` orchestriert den Ablauf, ruft `fetchPokemon` auf und rendert Details, Typ-Relationen (`api.js` → `ui.js`) sowie TCG-Karten.
- **Team**: `team.js` verwaltet Lesen/Schreiben im Local Storage und erstellt die Showcase-Karten.
- **UI**: `ui.js` enthält alle Rendering-Funktionen und Statusmeldungen; `styles.css` liefert das thematische Design.

## Technologien
- HTML5, CSS3 (Bootstrap 5, eigene Styles)
- JavaScript (jQuery für Ajax und DOM-Handling)
- APIs: [PokeAPI](https://pokeapi.co/) & [TCGdex](https://www.tcgdex.net/)

## Beitrag & Anpassung
- Passe API-Endpunkte oder Limits in `js/constants.js` an.
- Das Team-Limit (`TEAM_LIMIT`) kann dort ebenfalls verändert werden.
- Für neue UI-Elemente: entsprechende Render-Funktionen in `ui.js` ergänzen und Events in `main.js` binden.

## Lizenz
Dieses Projekt ist für Lernzwecke gedacht. Nutze es frei und passe es nach Bedarf an.
