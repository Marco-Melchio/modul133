// Zentrale Konfigurationswerte, damit Endpunkte, Limits und Storage-Keys nicht
// mehrfach im Code verteilt sind. Alle Konstanten sind deutsch kommentiert,
// damit auch Einsteiger sofort verstehen, welche URL wofür genutzt wird.

// Basis-URL der PokeAPI, über die einzelne Pokémon-Objekte geladen werden.
const POKE_API_BASE = 'https://pokeapi.co/api/v2/pokemon/';

// Endpunkt für Typinformationen (Stärken/Schwächen) eines bestimmten Typs.
const POKE_TYPE_ENDPOINT = 'https://pokeapi.co/api/v2/type/';

// Sammel-Endpunkt, der alle Pokémon-Namen zurückliefert (für Autocomplete).
const POKEMON_LIST_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';

// Pokémon TCG API-Konfiguration (öffentlich erreichbar ohne Referer-Header).
const TCG_API_BASE = 'https://api.pokemontcg.io/v2';

// Endpunkt, um nach Trading Cards zu suchen.
const TCG_ENDPOINT = `${TCG_API_BASE}/cards`;

// Lokale Storage-Konstanten für das Team-Management.
// Key: unter welchem Namen das Team im Local Storage liegt.
const TEAM_STORAGE_KEY = 'pokemon-team';
// Limit: maximal erlaubte Teamgröße (Standard: 6 Slots wie im Gameboy-Original).
const TEAM_LIMIT = 6;
