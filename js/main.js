let currentPokemon = null;

$(document).ready(function () {
  loadTeamFromStorage();

  $('#search-form').on('submit', function (event) {
    event.preventDefault();
    const pokemonName = $('#pokemon-input').val().trim().toLowerCase();
    if (!pokemonName) {
      return;
    }
    searchPokemon(pokemonName);
  });

  $('#add-to-team').on('click', function () {
    if (currentPokemon) {
      addPokemonToTeam(currentPokemon);
    }
  });

  $('#team-list').on('click', '.remove-btn', function () {
    const index = Number($(this).data('index'));
    removePokemonFromTeam(index);
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
