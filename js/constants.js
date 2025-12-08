// Basis-URLs und Endpunkte der PokeAPI für einzelne Pokémon, Typen und die gesamte Namensliste.
const POKE_API_BASE = 'https://pokeapi.co/api/v2/pokemon/';
//ENDPOINT1
const POKE_TYPE_ENDPOINT = 'https://pokeapi.co/api/v2/type/';
//ENDPOINT2
const POKEMON_LIST_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';

// TCGdex API-Konfiguration für das Laden der deutschsprachigen Karten.
const TCG_API_BASE = 'https://api.tcgdex.net/v2';
const TCG_LANGUAGE = 'en';
//ENDPOINT3
const TCG_ENDPOINT = `${TCG_API_BASE}/${TCG_LANGUAGE}/cards`;

// Lokale Storage-Konstanten für das Team-Management.
const TEAM_STORAGE_KEY = 'pokemon-team';
const TEAM_LIMIT = 6;
