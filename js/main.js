// Aktuell geladenes Pokémon, das zur Detailanzeige und zum Team hinzufügen genutzt wird.
window.currentPokemon = null;

// Cache für alle Pokémon-Namen, um Vorschläge ohne ständige API-Calls zu ermöglichen.
window.pokemonNames = [];

// Konfiguration für Auto-Vervollständigung.
window.SUGGESTION_THRESHOLD = 3;
window.SUGGESTION_LIMIT = 6;

$(document).ready(function () {
  console.log('[App] Initializing Pokémon Team Builder.');
  loadTeamFromStorage();
  preloadPokemonNames();

  const $pokemonInput = $('#pokemon-input');
  const $suggestions = $('#pokemon-suggestions');

  // Sucht nach einem Pokémon, wenn das Formular abgeschickt wird.
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

  // Fügt das aktuell geladene Pokémon dem Team hinzu.
  $('#add-to-team').on('click', function () {
    console.log('[Team] Add to team clicked.');
    if (window.currentPokemon) {
      const added = addPokemonToTeam(window.currentPokemon);
      if (added) {
        resetCurrentPokemonView();
      }
    }
  });

  // Entfernt ein Pokémon aus dem Team, wenn der Button in der Showcase-Liste geklickt wird.
  $('#team-showcase').on('click', '.showcase-remove-btn', function () {
    const index = Number($(this).data('index'));
    console.log(`[Team] Remove button clicked for index ${index}.`);
    removePokemonFromTeam(index);
  });

  // Rendert Vorschläge während der Eingabe.
  $pokemonInput.on('input', function () {
    handleSuggestionRender($(this).val().trim().toLowerCase());
  });

  // Zeigt Vorschläge erneut an, sobald das Feld den Fokus erhält.
  $pokemonInput.on('focus', function () {
    handleSuggestionRender($(this).val().trim().toLowerCase());
  });

  // Lädt ein zufälliges Pokémon und befüllt das Eingabefeld damit.
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

  // Übernimmt einen Vorschlag aus der Liste in das Eingabefeld.
  $suggestions.on('click', '.suggestion-item', function () {
    const name = $(this).data('name');
    $pokemonInput.val(name);
    hideSuggestions();
    searchPokemon(name);
  });

  // Schließt die Vorschlagsliste, wenn ausserhalb geklickt wird.
  $(document).on('click', function (event) {
    if (!$(event.target).closest('#pokemon-input, #pokemon-suggestions').length) {
      hideSuggestions();
    }
  });
});
