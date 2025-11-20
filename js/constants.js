const POKE_API_BASE = 'https://pokeapi.co/api/v2/pokemon/';
const POKE_TYPE_ENDPOINT = 'https://pokeapi.co/api/v2/type/';
const POKEMON_LIST_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';
// TCGdex host documented at https://docs.tcgdex.dev
// We default to the German locale used in the UI but expose the base and language separately
// to make it easier to switch if needed.
const TCG_API_BASE = 'https://api.tcgdex.net/v2';
const TCG_LANGUAGE = 'de';
const TCG_ENDPOINT = `${TCG_API_BASE}/${TCG_LANGUAGE}/cards`;
const TEAM_STORAGE_KEY = 'pokemon-team';
const TEAM_LIMIT = 6;
