# Pokémon Team Builder (deutsch kommentiert)

Dieses Single-Page-Tool hilft dir dabei, schnell ein eigenes Pokémon-Team zusammenzustellen. Die Anwendung erklärt sich nun komplett auf Deutsch – von der Codebasis bis zur Anleitung – und eignet sich damit auch für Einsteiger, die die PokeAPI oder jQuery noch nicht kennen.

## Was die App kann
- **Pokémon-Suche:** Namen eintippen (oder Zufallsbutton nutzen) und sofort offizielle Artworks, Stats, Typen und Fähigkeiten sehen.
- **Typen-Übersicht:** Stärken und Schwächen werden automatisch anhand der geladenen Typen ermittelt.
- **TCG-Showcase:** Bis zu vier passende Trading-Card-Motive der Pokémon TCG API werden angezeigt.
- **Team-Verwaltung:** Bis zu sechs Pokémon abspeichern, doppelte Einträge werden verhindert, Entfernen-Buttons pro Slot.
- **Auto-Vervollständigung:** Vorschläge ab drei Zeichen auf Basis aller bekannten Pokémon-Namen.

## Projektstruktur
```
modul133/
├── index.html         # Einstiegspunkt, bindet alle Skripte und beschreibt das Layout
├── css/
│   └── styles.css     # Komplett deutsch kommentiertes Styling im Glassmorphism-Look
├── js/
│   ├── constants.js   # Zentral gesammelte API-Endpunkte und Team-Limits
│   ├── functions.js   # API-Aufrufe, Team-Logik, Rendering-Helfer (ausführlich kommentiert)
│   └── main.js        # Event-Handler und Orchestrierung der App
└── img/
    ├── Poke.png             # Favicon
    └── tcg-placeholder.png  # Platzhalterbild für fehlende TCG-Karten
```

## Voraussetzungen
- Internetzugang (für PokeAPI und Pokémon TCG API).
- Moderner Browser mit aktiviertem Local Storage (für die Teamspeicherung).
- Keine Build-Tools nötig: alles läuft rein im Browser.

## Lokale Nutzung
1. Repository klonen oder als ZIP herunterladen und entpacken.
2. **Option A:** `index.html` doppelklicken und direkt im Browser öffnen.
3. **Option B (empfohlen):** einen kleinen lokalen Webserver starten, damit alle Ressourcen gleich geladen werden:
   ```bash
   python3 -m http.server 8000
   ```
   Anschließend im Browser `http://localhost:8000` aufrufen.

## Bedienung
- Gib den Namen eines Pokémon ein und drücke auf **"Laden"**.
- Nutze **"Zufallspokemon"** für einen zufälligen Vorschlag inklusive automatischer Suche.
- Klicke auf **"Zum Team hinzufügen"**, um das aktuell geladene Pokémon in einen freien Slot zu legen.
- Entfernen geht über die **"Entfernen"**-Buttons in der Team-Showcase-Liste.
- Die App merkt sich dein Team automatisch im Browser (Local Storage), sodass es nach einem Reload wieder da ist.

## Anpassungen
- Möchtest du mehr oder weniger Team-Slots? Passe `TEAM_LIMIT` in `js/constants.js` an.
- Andere API-Endpunkte oder Limits? Ebenfalls in `js/constants.js` pflegen.
- Zusätzliche UI-Elemente oder Render-Varianten? Ergänze neue Funktionen in `js/functions.js` und binde sie in `index.html` oder `js/main.js` ein.

## Hinweise zur Codebasis
- Der gesamte Code ist auf Deutsch kommentiert, damit Abläufe nachvollziehbar bleiben.
- jQuery wird für AJAX und DOM-Manipulation genutzt, Bootstrap 5 liefert Basisstyles.
- Typen- und Karten-APIs laufen parallel zur Pokémon-Suche, Fehler werden im UI mit Hinweisen abgefangen.

Viel Spaß beim Zusammenstellen deines Teams!
