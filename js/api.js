function fetchPokemon(pokemonName) {
  return $.ajax({
    url: `${POKE_API_BASE}${pokemonName}`,
    method: 'GET',
    dataType: 'json'
  })
    .then((data) => {
      console.log(`[API] PokeAPI response received for ${pokemonName}`, data);
      return simplifyPokemon(data);
    })
    .catch((error) => {
      console.error(`[API] Failed to fetch Pokémon ${pokemonName}`, error);
      throw error;
    });
}

function simplifyPokemon(data) {
  return {
    id: data.id,
    name: data.name,
    sprite:
      data.sprites.other['official-artwork'].front_default ||
      data.sprites.front_default,
    types: data.types.map((typeInfo) => typeInfo.type.name),
    stats: data.stats.map((stat) => ({ name: stat.stat.name, value: stat.base_stat })),
    abilities: data.abilities.map((ability) => ability.ability.name)
  };
}

function fetchTypeRelations(types) {
  const uniqueTypes = [...new Set(types)];
  if (!uniqueTypes.length) {
    return Promise.resolve(createEmptyRelations());
  }

  console.log(`[API] Loading type relations for: ${uniqueTypes.join(', ')}`);
  const requests = uniqueTypes.map((typeName) =>
    $.ajax({
      url: `${POKE_TYPE_ENDPOINT}${typeName}`,
      method: 'GET',
      dataType: 'json'
    })
  );

  return Promise.all(requests)
    .then((responses) => {
      const relations = aggregateRelations(responses);
      console.log('[API] Type relations loaded', relations);
      return relations;
    })
    .catch((error) => {
      console.error('[API] Failed to load type relations', error);
      throw error;
    });
}

function createEmptyRelations() {
  return {
    strengths: [],
    weaknesses: [],
    resistances: [],
    immunities: []
  };
}

function aggregateRelations(responses) {
  const aggregate = {
    strengths: new Set(),
    weaknesses: new Set(),
    resistances: new Set(),
    immunities: new Set()
  };

  responses.forEach((data) => {
    addToSet(aggregate.strengths, data.damage_relations.double_damage_to);
    addToSet(aggregate.weaknesses, data.damage_relations.double_damage_from);
    addToSet(aggregate.resistances, data.damage_relations.half_damage_from);
    addToSet(aggregate.immunities, data.damage_relations.no_damage_from);
  });

  return {
    strengths: Array.from(aggregate.strengths),
    weaknesses: Array.from(aggregate.weaknesses),
    resistances: Array.from(aggregate.resistances),
    immunities: Array.from(aggregate.immunities)
  };
}

function addToSet(set, relations = []) {
  relations.forEach((relation) => set.add(relation.name));
}

function fetchTcgCards(term) {
  const normalizedTerm = normalizeTcgTerm(term);
  const query = buildTcgQuery(normalizedTerm);
  console.log(`[API] Requesting TCG cards with query: ${query}`);

  return $.ajax({
    url: TCG_ENDPOINT,
    method: 'GET',
    dataType: 'json',
    timeout: 100000,
    headers: {
      'X-Api-Key': TCG_API_KEY
    },
    data: {
      q: query,
      pageSize: 3
    }
  })
    .then((response) => {
      const cards = response.data || [];
      console.log(`[API] Primary TCG response for "${normalizedTerm}" returned ${cards.length} cards.`);

      if (cards.length || !normalizedTerm) {
        return cards;
      }

      const fallbackQuery = buildWildcardTcgQuery(normalizedTerm);
      console.log(`[API] No cards found. Retrying with fallback query: ${fallbackQuery}`);

      return $.ajax({
        url: TCG_ENDPOINT,
        method: 'GET',
        dataType: 'json',
        timeout: 100000,
        headers: {
          'X-Api-Key': TCG_API_KEY
        },
        data: {
          q: fallbackQuery,
          pageSize: 3
        }
      }).then((fallbackResponse) => {
        const fallbackCards = fallbackResponse.data || [];
        console.log(
          `[API] Fallback TCG response for "${normalizedTerm}" returned ${fallbackCards.length} cards.`
        );
        return fallbackCards;
      });
    })
    .catch((error) => {
      console.error(`[API] Failed to load TCG cards for "${normalizedTerm}"`, error);
      throw error;
    });
}

function normalizeTcgTerm(term) {
  return (term || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\\"']/g, '')
    .replace(/\s+/g, ' ');
}

function buildTcgQuery(normalizedTerm) {
  if (!normalizedTerm) {
    return 'name:*';
  }

  return `name:"${normalizedTerm}"`;
}

function buildWildcardTcgQuery(normalizedTerm) {
  if (!normalizedTerm) {
    return 'name:*';
  }

  return `name:*${normalizedTerm}*`;
}

let pokemonListPromise = null;

function fetchAllPokemonNames() {
  if (pokemonListPromise) {
    return pokemonListPromise;
  }

  pokemonListPromise = $.ajax({
    url: POKEMON_LIST_ENDPOINT,
    method: 'GET',
    dataType: 'json'
  })
    .then((response) => {
      const names = (response.results || []).map((pokemon) => pokemon.name);
      console.log(`[API] Loaded ${names.length} Pokémon names for suggestions.`);
      return names;
    })
    .catch((error) => {
      pokemonListPromise = null;
      console.error('[API] Failed to preload Pokémon names', error);
      throw error;
    });

  return pokemonListPromise;
}
