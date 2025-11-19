function getTeam() {
  const stored = localStorage.getItem(TEAM_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveTeam(team) {
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
}

function loadTeamFromStorage() {
  renderTeam(getTeam());
}

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
  saveTeam(updatedTeam);
  renderTeam(updatedTeam);
  setStatus(`${pokemon.name} wurde zum Team hinzugefügt.`, 'success');
}

function removePokemonFromTeam(index) {
  const team = getTeam();
  const updatedTeam = team.filter((_, i) => i !== index);
  saveTeam(updatedTeam);
  renderTeam(updatedTeam);
  setStatus('Pokémon wurde entfernt.', 'info');
}

function renderTeam(team) {
  renderTeamList(team);
  renderTeamShowcase(team);
}

function renderTeamList(team) {
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

function renderTeamShowcase(team) {
  const showcaseItems = team
    .map(
      (pokemon) => `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="showcase-card text-center p-4 h-100">
            <img src="${pokemon.sprite}" alt="${pokemon.name}" />
            <p class="text-uppercase fw-bold mt-3 mb-1">${pokemon.name}</p>
            <p class="text-muted mb-2">${pokemon.types.join(', ')}</p>
            <div class="small">Fähigkeiten: ${pokemon.abilities.join(', ')}</div>
          </div>
        </div>`
    )
    .join('');

  const placeholderCount = Math.max(TEAM_LIMIT - team.length, 0);
  const placeholders = Array.from({ length: placeholderCount })
    .map(
      (_, index) => `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="showcase-card showcase-card--empty text-center p-4 h-100">
            <p class="fw-bold mb-0">Freier Slot ${index + 1}</p>
            <small>Suche ein Pokémon und füge es hinzu.</small>
          </div>
        </div>`
    )
    .join('');

  const intro = team.length
    ? ''
    : '<div class="col-12"><p class="text-center text-muted">Füge Pokémon hinzu, um dein Team zu sehen.</p></div>';

  $('#team-showcase').html(intro + showcaseItems + placeholders);
}
