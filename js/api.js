function fetchPokemon(pokemonName) {
  return $.ajax({
    url: `${POKE_API_BASE}${pokemonName}`,
    method: 'GET',
    dataType: 'json'
  }).then(simplifyPokemon);
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

  const requests = uniqueTypes.map((typeName) =>
    $.ajax({
      url: `${POKE_TYPE_ENDPOINT}${typeName}`,
      method: 'GET',
      dataType: 'json'
    })
  );

  return Promise.all(requests).then((responses) => aggregateRelations(responses));
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
  const query = buildTcgQuery(term);

  return $.ajax({
    url: TCG_ENDPOINT,
    method: 'GET',
    dataType: 'json',
    headers: {
      'X-Api-Key': TCG_API_KEY
    },
    data: {
      q: query,
      pageSize: 3
    }
  }).then((response) => response.data || []);
}

function buildTcgQuery(term) {
  const normalized = (term || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\\"']/g, '')
    .replace(/\s+/g, ' ');

  if (!normalized) {
    return 'name:*';
  }

  return `name:"${normalized}"`;
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
    .then((response) => (response.results || []).map((pokemon) => pokemon.name))
    .catch((error) => {
      pokemonListPromise = null;
      throw error;
    });

  return pokemonListPromise;
}
