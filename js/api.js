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
  console.log(`[API] Requesting TCGdex cards for term: ${normalizedTerm || 'alle'}`);

  // TCGdex stellt die Kartendaten ohne API Key zur Verfügung.
  return $.ajax({
    url: TCG_ENDPOINT,
    method: 'GET',
    dataType: 'json',
    timeout: 30000,
    data: normalizedTerm ? { name: normalizedTerm } : {}
  })
    .then((response) => {
      const normalizedCards = normalizeTcgResponse(response, normalizedTerm).slice(0, 3);
      console.log(
        `[API] TCGdex response for "${normalizedTerm || 'alle'}" returned ${normalizedCards.length} cards.`
      );
      return normalizedCards;
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

function normalizeTcgResponse(response, normalizedTerm) {
  const cards = Array.isArray(response) ? response : response?.data || response?.results || [];

  if (!Array.isArray(cards)) {
    return [];
  }

  const filteredCards = normalizedTerm
    ? cards.filter((card) => card?.name?.toLowerCase().includes(normalizedTerm))
    : cards;

  return filteredCards.map(transformTcgCard).filter(Boolean);
}

function transformTcgCard(card) {
  if (!card) {
    return null;
  }

  const imageUrl =
    card.images?.small || card.image?.small || card.image || card.highRes?.small || card.images?.large;

  const setName =
    (typeof card.set === 'string' && card.set) ||
    card.set?.name ||
    card.expansion?.name ||
    card.series?.name;

  return {
    name: card.name,
    images: { small: imageUrl },
    set: setName ? { name: setName } : null
  };
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
