let currentPokemon = null;
let pokemonNames = [];
const SUGGESTION_THRESHOLD = 3;
const SUGGESTION_LIMIT = 6;

$(document).ready(function () {
  loadTeamFromStorage();
  preloadPokemonNames();

  const $pokemonInput = $('#pokemon-input');
  const $suggestions = $('#pokemon-suggestions');

  $('#search-form').on('submit', function (event) {
    event.preventDefault();
    const pokemonName = $pokemonInput.val().trim().toLowerCase();
    if (!pokemonName) {
      return;
    }
    hideSuggestions();
    searchPokemon(pokemonName);
  });

  $('#add-to-team').on('click', function () {
    if (currentPokemon) {
      addPokemonToTeam(currentPokemon);
    }
  });

  $('#team-showcase').on('click', '.showcase-remove-btn', function () {
    const index = Number($(this).data('index'));
    removePokemonFromTeam(index);
  });

  $pokemonInput.on('input', function () {
    handleSuggestionRender($(this).val().trim().toLowerCase());
  });

  $pokemonInput.on('focus', function () {
    handleSuggestionRender($(this).val().trim().toLowerCase());
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
  setStatus('Lade Daten...', 'info');
  disableTeamButton();
  showTypeRelationsLoading();
  showTcgLoading();

  fetchPokemon(pokemonName)
    .then((pokemon) => {
      currentPokemon = pokemon;
      renderPokemonDetails(pokemon);
      $('#add-to-team').prop('disabled', false);
      setStatus(`${pokemon.name} wurde geladen.`, 'success');
      animateSection('#pokemon-details');
      return pokemon;
    })
    .then((pokemon) => {
      fetchTypeRelations(pokemon.types)
        .then((relations) => renderTypeRelations(relations))
        .catch(() => renderTypeRelationsError());

      fetchTcgCards(pokemon.name)
        .then((cards) => renderTcgCards(cards))
        .catch(() => renderTcgCardsError());
    })
    .catch(() => {
      setStatus('Pokémon nicht gefunden oder API nicht erreichbar.', 'danger');
      currentPokemon = null;
      clearPokemonDetails();
      clearTypeRelations();
      clearTcgCards();
    });
}

function preloadPokemonNames() {
  fetchAllPokemonNames()
    .then((names) => {
      pokemonNames = names;
    })
    .catch(() => {
      // silently ignore, suggestions are optional
    });
}

function handleSuggestionRender(term) {
  if (!term || term.length < SUGGESTION_THRESHOLD || !pokemonNames.length) {
    hideSuggestions();
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
