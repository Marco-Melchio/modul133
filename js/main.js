let currentPokemon = null;
let pokemonNames = [];
const SUGGESTION_THRESHOLD = 3;
const SUGGESTION_LIMIT = 6;

$(document).ready(function () {
  console.log('[App] Initializing Pokémon Team Builder.');
  loadTeamFromStorage();
  preloadPokemonNames();

  const $pokemonInput = $('#pokemon-input');
  const $suggestions = $('#pokemon-suggestions');

  $('#search-form').on('submit', function (event) {
    event.preventDefault();
    const pokemonName = $pokemonInput.val().trim().toLowerCase();
    console.log(`[Search] Form submitted with value: "${pokemonName}"`);
    if (!pokemonName) {
      console.warn('[Search] No Pokémon name provided, aborting search.');
      return;
    }
    hideSuggestions();
    searchPokemon(pokemonName);
  });

  $('#add-to-team').on('click', function () {
    console.log('[Team] Add to team clicked.');
    if (currentPokemon) {
      const added = addPokemonToTeam(currentPokemon);
      if (added) {
        resetCurrentPokemonView();
      }
    }
  });

  $('#team-showcase').on('click', '.showcase-remove-btn', function () {
    const index = Number($(this).data('index'));
    console.log(`[Team] Remove button clicked for index ${index}.`);
    removePokemonFromTeam(index);
  });

  $pokemonInput.on('input', function () {
    handleSuggestionRender($(this).val().trim().toLowerCase());
  });

  $pokemonInput.on('focus', function () {
    handleSuggestionRender($(this).val().trim().toLowerCase());
  });

  $('#random-search').on('click', function () {
    console.log('[Random] Random search requested.');
    disableTeamButton();
    hideSuggestions();
    setStatus('Zufälliges Pokémon wird geladen...', 'info');

    getRandomPokemonName()
      .then((name) => {
        console.log(`[Random] Selected Pokémon: ${name}.`);
        $pokemonInput.val(name);
        searchPokemon(name);
      })
      .catch((error) => {
        console.error('[Random] Failed to load random Pokémon.', error);
        setStatus('Kein zufälliges Pokémon gefunden.', 'danger');
      });
  });

  $suggestions.on('click', '.suggestion-item', function () {
    const name = $(this).data('name');
    $pokemonInput.val(name);
    hideSuggestions();
    searchPokemon(name);
  });

  $(document).on('click', function (event) {
    if (!$(event.target).closest('#pokemon-input, #pokemon-suggestions').length) {
      hideSuggestions();
    }
  });
});

function searchPokemon(pokemonName) {
  console.log(`[Search] Starting lookup for ${pokemonName}.`);
  setStatus('Lade Daten...', 'info');
  disableTeamButton();
  showTypeRelationsLoading();
  showTcgLoading();

  fetchPokemon(pokemonName)
    .then((pokemon) => {
      currentPokemon = pokemon;
      console.log('[Search] Pokémon data loaded', pokemon);
      renderPokemonDetails(pokemon);
      $('#add-to-team').prop('disabled', false);
      setStatus(`${pokemon.name} wurde geladen.`, 'success');
      animateSection('#pokemon-details');
      return pokemon;
    })
    .then((pokemon) => {
      console.log('[Search] Loading supporting data (types & TCG).');
      fetchTypeRelations(pokemon.types)
        .then((relations) => {
          console.log('[Search] Type relations loaded successfully.');
          renderTypeRelations(relations);
        })
        .catch((error) => {
          console.error('[Search] Failed to load type relations', error);
          renderTypeRelationsError();
        });

      fetchTcgCards(pokemon.name)
        .then((cards) => {
          console.log(`[Search] Loaded ${cards.length} TCG cards.`);
          renderTcgCards(cards);
        })
        .catch((error) => {
          console.error('[Search] Failed to load TCG cards', error);
          renderTcgCardsError();
        });
    })
    .catch(() => {
      setStatus('Pokémon nicht gefunden oder API nicht erreichbar.', 'danger');
      currentPokemon = null;
      console.error(`[Search] Lookup failed for ${pokemonName}.`);
      clearPokemonDetails();
      clearTypeRelations();
      clearTcgCards();
    });
}

function preloadPokemonNames() {
  fetchAllPokemonNames()
    .then((names) => {
      pokemonNames = names;
      console.log('[Suggestions] Pokémon name suggestions loaded.');
    })
    .catch(() => {
      // silently ignore, suggestions are optional
      console.warn('[Suggestions] Could not preload Pokémon names (non-blocking).');
    });
}

function handleSuggestionRender(term) {
  if (!term || term.length < SUGGESTION_THRESHOLD || !pokemonNames.length) {
    hideSuggestions();
    console.log('[Suggestions] Term too short or names unavailable, hiding suggestions.');
    return;
  }

  renderSuggestions(term);
}

function renderSuggestions(term) {
  const matches = pokemonNames
    .filter((name) => name.includes(term))
    .slice(0, SUGGESTION_LIMIT);

  if (!matches.length) {
    hideSuggestions();
    console.log('[Suggestions] No matches found.');
    return;
  }

  const options = matches
    .map(
      (name) => `
        <button type="button" class="list-group-item list-group-item-action suggestion-item text-capitalize" data-name="${name}">
          ${name}
        </button>
      `
    )
    .join('');

  $('#pokemon-suggestions').html(options).addClass('suggestions--visible');
}

function hideSuggestions() {
  $('#pokemon-suggestions').removeClass('suggestions--visible').empty();
}

function resetCurrentPokemonView() {
  currentPokemon = null;
  clearPokemonDetails();
  clearTypeRelations();
  clearTcgCards();
  disableTeamButton();
}

function getRandomPokemonName() {
  if (pokemonNames.length) {
    return Promise.resolve(selectRandomName(pokemonNames));
  }

  return fetchAllPokemonNames()
    .then((names) => {
      pokemonNames = names;
      return selectRandomName(names);
    })
    .catch((error) => {
      console.warn('[Random] Could not preload Pokémon names.', error);
      return Promise.reject(error);
    });
}

function selectRandomName(names) {
  if (!names || !names.length) {
    throw new Error('No Pokémon names available');
  }

  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}
