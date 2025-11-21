/** POKEMON API *****************************************************/

// Lädt die detaillierten Daten eines Pokémon und transformiert sie direkt in ein
// vereinfachtes Objekt, das von der UI genutzt werden kann.
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

// Reduziert das umfangreiche PokeAPI-Objekt auf die Eigenschaften, die wir in der App anzeigen.
function simplifyPokemon(data) {
  return {
    id: data.id,
    name: data.name,
    sprite:
      data.sprites.other['official-artwork'].front_default ||
      data.sprites.front_default,
    types: data.types.map((t) => t.type.name),
    stats: data.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat
    })),
    abilities: data.abilities.map((a) => a.ability.name)
  };
}


/** TYPE RELATIONS *************************************************/

// Holt zu den Pokémon-Typen alle Stärken/Schwächen aus der API.
function fetchTypeRelations(types) {
  const uniqueTypes = [...new Set(types)];
  if (!uniqueTypes.length) {
    return Promise.resolve(createEmptyRelations());
  }

  console.log(`[API] Loading type relations for: ${uniqueTypes.join(', ')}`);

  // Für jeden Typ wird ein API-Aufruf gesammelt und anschließend aggregiert ausgewertet.
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

// Hilfsfunktion um leere Arrays für das UI zurückzugeben, falls keine Typen vorhanden sind.
function createEmptyRelations() {
  return {
    strengths: [],
    weaknesses: [],
    resistances: [],
    immunities: []
  };
}

// Fasst die Antworten mehrerer Typabfragen zusammen und entfernt Duplikate via Set.
function aggregateRelations(responses) {
  const agg = {
    strengths: new Set(),
    weaknesses: new Set(),
    resistances: new Set(),
    immunities: new Set()
  };

  responses.forEach((data) => {
    addToSet(agg.strengths, data.damage_relations.double_damage_to);
    addToSet(agg.weaknesses, data.damage_relations.double_damage_from);
    addToSet(agg.resistances, data.damage_relations.half_damage_from);
    addToSet(agg.immunities, data.damage_relations.no_damage_from);
  });

  return {
    strengths: [...agg.strengths],
    weaknesses: [...agg.weaknesses],
    resistances: [...agg.resistances],
    immunities: [...agg.immunities]
  };
}

// Fügt alle relativen Typnamen in ein Set ein, um doppelte Einträge zu vermeiden.
function addToSet(set, relations = []) {
  relations.forEach((r) => set.add(r.name));
}


/** TCGDEX API *****************************************************/

// Fragt die TCGdex API ab, um Karten zu einem Suchbegriff zu laden; leere Eingaben liefern ein leeres Array.
function fetchTcgCards(term) {
  const normalizedTerm = normalizeTcgTerm(term);

  console.log('[API] TCG_ENDPOINT:', TCG_ENDPOINT);
  console.log(`[API] Requesting TCGdex cards for term: ${normalizedTerm || 'alle'}`);

  if (!normalizedTerm) return $.Deferred().resolve([]).promise();

  return $.ajax({
    url: TCG_ENDPOINT,
    method: 'GET',
    dataType: 'json',
    data: {
      name: `like:${normalizedTerm}`
    }
  })
    .then((response) => {
      const normalizedCards = normalizeTcgResponse(response, normalizedTerm).slice(0, 4);

      console.log(
        `[API] TCGdex response for "${normalizedTerm}" returned ${normalizedCards.length} cards.`,
        normalizedCards
      );

      return normalizedCards;
    })
    .catch((error) => {
      console.error(`[API] Failed to load TCG cards for "${normalizedTerm}"`, error);
      throw error;
    });
}

// Bereitet den Suchbegriff auf, indem Sonderzeichen und Mehrfachleerzeichen entfernt werden.
function normalizeTcgTerm(term) {
  return (term || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\\"']/g, '')
    .replace(/\s+/g, ' ');
}

// Wandelt die TCGdex API Antwort in ein konsistentes Karten-Array um und filtert nach dem Suchbegriff.
function normalizeTcgResponse(response, normalizedTerm) {
  const cards = Array.isArray(response)
    ? response
    : response?.data || response?.results || [];

  if (!Array.isArray(cards)) return [];

  const filtered = normalizedTerm
    ? cards.filter(
        (card) =>
          card?.name &&
          card.name.toLowerCase().includes(normalizedTerm)
      )
    : cards;

  return filtered.map(transformTcgCard).filter(Boolean);
}

// Formatiert eine einzelne Karte und liefert ein vereinheitlichtes Objekt für die Galerie.
function transformTcgCard(card) {
  if (!card || !card.name) return null;

  const baseImage = card.image || null;
  const QUALITY = 'high';
  const EXTENSION = 'png';

  const imageUrl = baseImage
    ? `${baseImage}/${QUALITY}.${EXTENSION}`
    : 'img/tcg-placeholder.png'; // Fallback-Bild

  const setName =
    card.set?.name ||
    card.expansion?.name ||
    card.series?.name ||
    card.set ||
    null;

  return {
    name: card.name,
    images: { small: imageUrl },
    set: setName ? { name: setName } : null
  };
}

/** POKEMON LIST *****************************************************/

// Zwischenspeicher für die komplette Pokémon-Namensliste, damit die API nicht mehrfach aufgerufen wird.
let pokemonListPromise = null;

// Lädt einmalig alle Pokémon-Namen für die Auto-Vervollständigung und cached das Ergebnis.
function fetchAllPokemonNames() {
  if (pokemonListPromise) return pokemonListPromise;

  pokemonListPromise = $.ajax({
    url: POKEMON_LIST_ENDPOINT,
    method: 'GET',
    dataType: 'json'
  })
    .then((response) => {
      const names = (response.results || []).map((p) => p.name);
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
