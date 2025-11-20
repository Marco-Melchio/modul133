function getTeam() {
  const stored = localStorage.getItem(TEAM_STORAGE_KEY);
  const team = stored ? JSON.parse(stored) : [];
  console.log(`[Team] Loaded ${team.length} Pokémon from storage.`);
  return team;
}

function saveTeam(team) {
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
  console.log(`[Team] Saved team with ${team.length} Pokémon.`);
}

function loadTeamFromStorage() {
  console.log('[Team] Restoring team from local storage.');
  renderTeam(getTeam());
}

function addPokemonToTeam(pokemon) {
  const team = getTeam();
  if (team.length >= TEAM_LIMIT) {
    setStatus('Team ist bereits voll.', 'warning');
    console.warn('[Team] Cannot add Pokémon, team is full.');
    return;
  }

  if (team.some((member) => member.id === pokemon.id)) {
    setStatus('Dieses Pokémon ist schon im Team.', 'warning');
    console.warn('[Team] Pokémon already in team, skipping.');
    return;
  }

  const updatedTeam = [...team, pokemon];
  saveTeam(updatedTeam);
  renderTeam(updatedTeam);
  setStatus(`${pokemon.name} wurde zum Team hinzugefügt.`, 'success');
  console.log(`[Team] Added ${pokemon.name} to the team.`);
}

function removePokemonFromTeam(index) {
  const team = getTeam();
  const updatedTeam = team.filter((_, i) => i !== index);
  saveTeam(updatedTeam);
  renderTeam(updatedTeam);
  setStatus('Pokémon wurde entfernt.', 'info');
  console.log(`[Team] Removed Pokémon at index ${index}.`);
}

function renderTeam(team) {
  renderTeamShowcase(team);
}

function renderTeamShowcase(team) {
  const showcaseItems = team
    .map((pokemon, index) => {
      const statsList = (pokemon.stats || [])
        .map(
          (stat) => `
            <li>
              <span>${stat.name}</span>
              <span>${stat.value}</span>
            </li>`
        )
        .join('');

      const statsOverlay = statsList
        ? `
            <div class="showcase-stats" aria-hidden="true">
              <p class="showcase-stats__title mb-2">Stats</p>
              <ul class="showcase-stats__list">${statsList}</ul>
            </div>`
        : '';

      return `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="team-slot h-100">
            <div class="showcase-card text-center p-4" tabindex="0">
              <img src="${pokemon.sprite}" alt="${pokemon.name}" />
              <p class="text-uppercase fw-bold mt-3 mb-1">${pokemon.name}</p>
              <p class="text-muted mb-2">${pokemon.types.join(', ')}</p>
              <div class="small">Fähigkeiten: ${pokemon.abilities.join(', ')}.</div>
              ${statsOverlay}
            </div>
            <button
              class="btn btn-sm showcase-remove-btn"
              type="button"
              data-index="${index}"
              aria-label="${pokemon.name} aus dem Team entfernen"
            >
              Entfernen
            </button>
          </div>
        </div>`;
    })
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
