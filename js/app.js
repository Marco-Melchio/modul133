// Konstanten für die verwendeten APIs
const POKE_API_BASE = 'https://pokeapi.co/api/v2/pokemon/';
const GIPHY_ENDPOINT = 'https://api.giphy.com/v1/gifs/search';
const GIPHY_API_KEY = 'dc6zaTOxFJmzC';
const TCG_ENDPOINT = 'https://api.pokemontcg.io/v2/cards';
const TEAM_STORAGE_KEY = 'pokemon-team';
const TEAM_LIMIT = 6;

let currentPokemon = null;

$(document).ready(function () {
  loadTeamFromStorage();

  $('#search-form').on('submit', function (event) {
    event.preventDefault();
    const pokemonName = $('#pokemon-input').val().trim().toLowerCase();
    if (!pokemonName) {
      return;
    }
    fetchPokemon(pokemonName);
  });

  $('#add-to-team').on('click', function () {
    if (currentPokemon) {
      addPokemonToTeam(currentPokemon);
    }
  });

  $('#team-list').on('click', '.remove-btn', function () {
    const index = $(this).data('index');
    removePokemonFromTeam(index);
  });
});

/**
 * Lädt ein Pokémon inklusive GIFs und TCG-Karten.
 * @param {string} pokemonName
 */
function fetchPokemon(pokemonName) {
  setStatus('Lade Daten...', 'info');
  disableTeamButton();

  $.ajax({
    url: `${POKE_API_BASE}${pokemonName}`,
    method: 'GET',
    dataType: 'json'
  })
    .done(function (pokemonData) {
      currentPokemon = simplifyPokemon(pokemonData);
      renderPokemonDetails(currentPokemon);
      $('#add-to-team').prop('disabled', false);
      animateSection('#pokemon-details');
      setStatus(`${currentPokemon.name} wurde geladen.`, 'success');
      fetchGiphy(currentPokemon.name);
      fetchTcgCards(currentPokemon.name);
    })
    .fail(function () {
      setStatus('Pokémon nicht gefunden oder API nicht erreichbar.', 'danger');
      clearPokemonDetails();
    });
}

/**
 * Zeigt eine Statusmeldung mit Bootstrap-Styling an.
 */
function setStatus(message, type) {
  $('#status-message')
    .hide()
    .removeClass()
    .addClass(`alert alert-${type}`)
    .text(message)
    .fadeIn(200);
}

/**
 * Deaktiviert den Team-Button.
 */
function disableTeamButton() {
  $('#add-to-team').prop('disabled', true);
}

/**
 * Reduziert das Pokémon Objekt auf die benötigten Eigenschaften.
 */
function simplifyPokemon(data) {
  return {
    id: data.id,
    name: data.name,
    sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    types: data.types.map((typeInfo) => typeInfo.type.name),
    stats: data.stats.map((stat) => ({ name: stat.stat.name, value: stat.base_stat })),
    abilities: data.abilities.map((ability) => ability.ability.name)
  };
}

/**
 * Rendert die Pokémondetails in die DOM.
 */
function renderPokemonDetails(pokemon) {
  const details = `
    <div class="col-12 col-lg-4 text-center">
      <img src="${pokemon.sprite}" alt="${pokemon.name}" class="img-fluid" />
      <h3 class="text-capitalize mt-3">${pokemon.name}</h3>
      <p class="text-muted">Typen: ${pokemon.types.join(', ')}</p>
      <p>Fähigkeiten: ${pokemon.abilities.join(', ')}</p>
    </div>
    <div class="col-12 col-lg-8">
      <h4>Stats</h4>
      <div class="row g-2">
        ${pokemon.stats
          .map(
            (stat) => `
              <div class="col-12">
                <div class="d-flex justify-content-between">
                  <span class="text-capitalize">${stat.name}</span>
                  <span>${stat.value}</span>
                </div>
                <div class="progress" role="progressbar" aria-valuenow="${stat.value}" aria-valuemin="0" aria-valuemax="200">
                  <div class="progress-bar bg-warning" style="width: ${Math.min(stat.value, 200)}%"></div>
                </div>
              </div>
            `
          )
          .join('')}
      </div>
    </div>`;

  $('#pokemon-details').html(details);
}

/**
 * Entfernt Details und Medieninhalte.
 */
function clearPokemonDetails() {
  $('#pokemon-details').empty();
  $('#giphy-container').empty();
  $('#tcg-cards').empty();
  disableTeamButton();
}

/**
 * Lädt ein GIF über die Giphy API.
 */
function fetchGiphy(term) {
  $('#giphy-container').html('<div class="text-center py-5">GIF wird geladen...</div>');
  $.ajax({
    url: GIPHY_ENDPOINT,
    method: 'GET',
    dataType: 'json',
    data: {
      api_key: GIPHY_API_KEY,
      q: term,
      limit: 1,
      rating: 'g'
    }
  })
    .done(function (response) {
      const gif = response.data[0];
      if (!gif) {
        $('#giphy-container').html('<p class="text-center">Kein GIF gefunden.</p>');
        return;
      }
      $('#giphy-container')
        .hide()
        .html(
          `<iframe src="${gif.embed_url}" title="${term}" allowfullscreen class="rounded border-0"></iframe>`
        )
        .fadeIn(300);
    })
    .fail(function () {
      $('#giphy-container').html('<p class="text-center">Giphy API nicht erreichbar.</p>');
    });
}

/**
 * Lädt Karten von der Pokémon TCG API.
 */
function fetchTcgCards(term) {
  $('#tcg-cards').html('<p>Karten werden geladen...</p>');
  $.ajax({
    url: TCG_ENDPOINT,
    method: 'GET',
    dataType: 'json',
    data: {
      q: `name:${term}`,
      pageSize: 3
    }
  })
    .done(function (response) {
      if (!response.data || !response.data.length) {
        $('#tcg-cards').html('<p>Keine Karten verfügbar.</p>');
        return;
      }

      const cards = response.data
        .map(
          (card) => `
            <div class="col-12 col-md-4">
              <div class="tcg-card text-center">
                <img src="${card.images.small}" alt="${card.name}" />
                <p class="mt-2">${card.name}</p>
              </div>
            </div>`
        )
        .join('');

      $('#tcg-cards').hide().html(cards).fadeIn(300);
    })
    .fail(function () {
      $('#tcg-cards').html('<p>TCG API nicht erreichbar.</p>');
    });
}

/**
 * Fügt das aktuelle Pokémon dem Team hinzu und speichert es im WebStorage.
 */
function addPokemonToTeam(pokemon) {
  const team = getTeam();
  if (team.length >= TEAM_LIMIT) {
    setStatus('Team ist bereits voll.', 'warning');
    return;
  }
  if (team.some((member) => member.id === pokemon.id)) {
    setStatus('Dieses Pokémon ist schon im Team.', 'warning');
    return;
  }
  const updatedTeam = [...team, pokemon];
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updatedTeam));
  renderTeam(updatedTeam);
  setStatus(`${pokemon.name} wurde zum Team hinzugefügt.`, 'success');
}

/**
 * Entfernt ein Pokémon aus dem Team.
 */
function removePokemonFromTeam(index) {
  const team = getTeam();
  const updated = team.filter((_, i) => i !== index);
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updated));
  renderTeam(updated);
  setStatus('Pokémon wurde entfernt.', 'info');
}

/**
 * Liest das Team aus dem LocalStorage.
 */
function getTeam() {
  const stored = localStorage.getItem(TEAM_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Lädt das Team beim Start.
 */
function loadTeamFromStorage() {
  renderTeam(getTeam());
}

/**
 * Rendert die Liste der Team-Pokémon.
 */
function renderTeam(team) {
  if (!team.length) {
    $('#team-list').html(
      '<li class="list-group-item">Noch keine Pokémon gespeichert.</li>'
    );
    return;
  }

  const listItems = team
    .map(
      (pokemon, index) => `
        <li class="list-group-item">
          <div class="team-slot">
            <div class="d-flex align-items-center gap-3">
              <img src="${pokemon.sprite}" alt="${pokemon.name}" />
              <div>
                <p class="mb-0 text-capitalize fw-bold">${pokemon.name}</p>
                <small>${pokemon.types.join(', ')}</small>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-light remove-btn" data-index="${index}">
              Entfernen
            </button>
          </div>
        </li>`
    )
    .join('');

  $('#team-list').html(listItems);
}

/**
 * Kleine Fade-In Animation für neue Inhalte.
 */
function animateSection(selector) {
  $(selector).hide().fadeIn(400);
}
