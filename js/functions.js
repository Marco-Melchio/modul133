/** POKEMON API *****************************************************/

// Lädt die detaillierten Daten eines Pokémon und transformiert sie direkt in ein
// vereinfachtes Objekt, das von der UI genutzt werden kann.
// Rückgabe: Promise mit einem schlanken Objekt, das nur die benötigten Felder enthält.
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
// So bleibt die UI-Logik unabhängig von den Rohdaten der API.
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
// Mehrere Typen werden parallel angefragt und danach zusammengeführt.
function fetchTypeRelations(types) {
  const uniqueTypes = [...new Set(types)];
  if (!uniqueTypes.length) {
    return Promise.resolve(createEmptyRelations());
  }

  console.log(`[API] Loading type relations for: ${uniqueTypes.join(', ')}`);

  // Für jeden Typ wird ein AJAX-Request vorbereitet und später gemeinsam ausgewertet.
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
// Ergebnis: ein Objekt mit einzigartigen Typnamen pro Kategorie.
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

/** POKÉMON TCG API *************************************************/

// Fragt die Pokémon TCG API ab, um Karten zu einem Suchbegriff zu laden; leere Eingaben liefern ein leeres Array.
// Die API liefert deutlich mehr Ergebnisse, deshalb begrenzen wir per pageSize auf vier Karten.
function fetchTcgCards(term) {
  const normalizedTerm = normalizeTcgTerm(term);

  console.log('[API] TCG_ENDPOINT:', TCG_ENDPOINT);
  console.log(`[API] Requesting Pokémon TCG cards for term: ${normalizedTerm || 'alle'}`);

  if (!normalizedTerm) return $.Deferred().resolve([]).promise();

  return $.ajax({
    url: TCG_ENDPOINT,
    method: 'GET',
    dataType: 'json',
    data: {
      q: `name:${normalizedTerm}*`,
      pageSize: 4
    }
  })
    .then((response) => {
      const normalizedCards = normalizeTcgResponse(response, normalizedTerm);

      console.log(
        `[API] Pokémon TCG response for "${normalizedTerm}" returned ${normalizedCards.length} cards.`,
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
// Dadurch schlagen API-Queries nicht fehl, wenn der Nutzer z. B. Anführungszeichen eintippt.
function normalizeTcgTerm(term) {
  return (term || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\\"']/g, '')
    .replace(/\s+/g, ' ');
}

// Wandelt die Pokémon TCG API Antwort in ein konsistentes Karten-Array um und filtert nach dem Suchbegriff.
// Gleichzeitig werden Null-Werte entfernt, damit die UI sauber rendert.
function normalizeTcgResponse(response, normalizedTerm) {
  const cards = Array.isArray(response) ? response : response?.data || [];

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
// Falls keine Bildquelle existiert, wird ein Platzhalter verwendet.
function transformTcgCard(card) {
  if (!card || !card.name) return null;

  const baseImage = card.images?.small || card.images?.large || null;

  const imageUrl = baseImage || 'img/tcg-placeholder.png'; // Fallback-Bild

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

/** TEAM MANAGEMENT *************************************************/

// Liest das gespeicherte Team aus dem Local Storage und gibt ein Array zurück.
// Fehlende Einträge werden als leeres Array zurückgegeben, damit die Aufrufer nicht crashen.
function getTeam() {
  const stored = localStorage.getItem(TEAM_STORAGE_KEY);
  const team = stored ? JSON.parse(stored) : [];
  console.log(`[Team] Loaded ${team.length} Pokémon from storage.`);
  return team;
}

// Persistiert das Team im Local Storage.
function saveTeam(team) {
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
  console.log(`[Team] Saved team with ${team.length} Pokémon.`);
}

// Stellt das Team beim Laden der Seite wieder her.
// Wird bei App-Start aufgerufen, damit vorhandene Einträge sofort sichtbar sind.
function loadTeamFromStorage() {
  console.log('[Team] Restoring team from local storage.');
  renderTeam(getTeam());
}

// Fügt ein Pokémon hinzu, sofern Kapazität frei ist und es nicht doppelt existiert.
// Rückgabe: true bei Erfolg, false bei Fehlversuch (voll oder Duplikat).
function addPokemonToTeam(pokemon) {
  const team = getTeam();
  if (team.length >= TEAM_LIMIT) {
    setStatus('Team ist bereits voll.', 'warning');
    console.warn('[Team] Cannot add Pokémon, team is full.');
    return false;
  }

  if (team.some((member) => member.id === pokemon.id)) {
    setStatus('Dieses Pokémon ist schon im Team.', 'warning');
    console.warn('[Team] Pokémon already in team, skipping.');
    return false;
  }

  const updatedTeam = [...team, pokemon];
  saveTeam(updatedTeam);
  renderTeam(updatedTeam);
  setStatus(`${pokemon.name} wurde zum Team hinzugefügt.`, 'success');
  console.log(`[Team] Added ${pokemon.name} to the team.`);
  return true;
}

// Entfernt einen Eintrag anhand des Indexes aus dem Team.
function removePokemonFromTeam(index) {
  const team = getTeam();
  const updatedTeam = team.filter((_, i) => i !== index);
  saveTeam(updatedTeam);
  renderTeam(updatedTeam);
  setStatus('Pokémon wurde entfernt.', 'info');
  console.log(`[Team] Removed Pokémon at index ${index}.`);
}

// Rendert aktuell nur die Showcase-Ansicht, kann später erweitert werden.
// Idee: hier könnte man weitere Darstellungen (z. B. Liste oder Tabelle) ergänzen.
function renderTeam(team) {
  renderTeamShowcase(team);
}

// Baut die visuelle Showcase-Anzeige mit Stats-Overlay und freien Slots.
// Für jedes Pokémon werden Abbildung, Typen, Fähigkeiten und Stats-Overlay erzeugt.
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
              class="btn btn-sm showcase-remove-btn btn-animated"
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

/** UI HELPERS *****************************************************/

// Zeigt eine Statusmeldung oberhalb der Suche an.
// Typen (success, warning, info, danger) steuern das Farbschema per CSS.
function setStatus(message, type) {
  $('#status-message')
    .hide()
    .attr('class', `status-message status-message--${type}`)
    .text(message)
    .fadeIn(200);
}

// Deaktiviert den Button zum Hinzufügen zum Team (z. B. wenn kein Pokémon geladen ist).
function disableTeamButton() {
  $('#add-to-team').prop('disabled', true);
}

// Baut das Detailpanel für das aktuell geladene Pokémon.
// Enthält Artwork, Typen, Fähigkeiten und eine kleine Stat-Progressbar.
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
                <div class="progress stat-progress" role="progressbar" aria-valuenow="${stat.value}" aria-valuemin="0" aria-valuemax="200">
                  <div class="progress-bar stat-bar" style="width: ${Math.min(stat.value, 200)}%"></div>
                </div>
              </div>
            `
          )
          .join('')}
      </div>
    </div>`;

  $('#pokemon-details').html(details);
}

// Entfernt die Detailansicht und deaktiviert den Team-Button.
function clearPokemonDetails() {
  $('#pokemon-details').empty();
  disableTeamButton();
}

// Platzhalter während Stärke-/Schwäche-Abfragen laufen.
function showTypeRelationsLoading() {
  const loading =
    '<div class="type-relations-placeholder text-muted">Stärken und Schwächen werden geladen...</div>';

  $('#strength-relations').html(loading);
  $('#weakness-relations').html(loading);
}

// Stellt Stärken und Schwächen nebeneinander dar.
// Im Fehlerfall wird eine platzhalterhafte Meldung angezeigt.
function renderTypeRelations(relations) {
  $('#strength-relations').html(
    renderRelationContent(relations.strengths, 'Keine offensichtlichen Stärken.')
  );
  $('#weakness-relations').html(renderRelationContent(relations.weaknesses, 'Keine direkten Schwächen.'));
}

// Wandelt die Relation-Arrays in eine Liste von Badges um.
// Falls keine Daten vorhanden sind, wird ein Standardtext angezeigt.
function renderRelationContent(values, emptyMessage) {
  if (!values.length) {
    return `<p class="relations-panel__empty">${emptyMessage}</p>`;
  }

  return `
    <ul class="relations-list">
      ${values.map((value) => `<li class="type-badge text-capitalize">${value}</li>`).join('')}
    </ul>`;
}

// Setzt die Bereichsausgabe zurück, wenn kein Pokémon geladen ist.
function clearTypeRelations() {
  $('#strength-relations').html(
    '<div class="type-relations-placeholder text-muted">Keine Daten verfügbar.</div>'
  );
  $('#weakness-relations').html(
    '<div class="type-relations-placeholder text-muted">Keine Daten verfügbar.</div>'
  );
}

// Kurzer Ladehinweis für die TCG-Sektion.
function showTcgLoading() {
  $('#tcg-cards').html('<p>Karten werden geladen...</p>');
}

// Baut die Karten-Galerie für maximal vier Karten auf.
// Mehr Karten würden das Layout sprengen, daher begrenzen wir die Auswahl im Frontend.
function renderTcgCards(cards) {
  if (!cards.length) {
    $('#tcg-cards').html('<p>Keine Karten verfügbar.</p>');
    return;
  }

  const visibleCards = cards.slice(0, 4);

  const html = visibleCards
    .map(
      (card) => `
        <div class="col-12 col-md-6 col-xl-3">
          <div class="tcg-card text-center">
            <img class="tcg-card__image" src="${card.images.small}" alt="${card.name}" />
            <p class="tcg-card-title text-capitalize mb-0">${card.name}</p>
            <small class="text-muted">${card.set?.name || 'TCGdex'}</small>
          </div>
        </div>`
    )
    .join('');

  $('#tcg-cards').hide().html(html).fadeIn(300);
}

// Rückfallausgabe, wenn keine Karten gefunden werden oder kein Suchbegriff vorliegt.
function clearTcgCards() {
  $('#tcg-cards').html('<p>Keine Karten verfügbar.</p>');
}

// Fehlerausgabe für die TCG API.
function renderTcgCardsError() {
  $('#tcg-cards').html('<p>TCG API nicht erreichbar.</p>');
}

// Zeigt eine Warnung an, falls Typbeziehungen nicht geladen werden konnten.
function renderTypeRelationsError() {
  const errorMessage =
    '<div class="type-relations-placeholder text-warning">Beziehungen konnten nicht geladen werden.</div>';

  $('#strength-relations').html(errorMessage);
  $('#weakness-relations').html(errorMessage);
}

// Kleine Fade-In-Animation, um neue Inhalte hervorzuheben.
function animateSection(selector) {
  $(selector).hide().fadeIn(400);
}

/** APP LOGIC *****************************************************/

// Zentraler Suchablauf: lädt Pokémon, Typ-Beziehungen und TCG-Karten und aktualisiert die UI.
// Der Ablauf ist bewusst in then-Ketten aufgeteilt, damit Fehler separat behandelt werden können.
function searchPokemon(pokemonName) {
  console.log(`[Search] Starting lookup for ${pokemonName}.`);
  setStatus('Lade Daten...', 'info');
  disableTeamButton();
  showTypeRelationsLoading();
  showTcgLoading();

  fetchPokemon(pokemonName)
    .then((pokemon) => {
      window.currentPokemon = pokemon;
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
      window.currentPokemon = null;
      console.error(`[Search] Lookup failed for ${pokemonName}.`);
      clearPokemonDetails();
      clearTypeRelations();
      clearTcgCards();
    });
}

// Lädt Namen einmalig vor, damit die Vorschläge sofort reagieren.
// Das Feature ist optional – schlägt der Request fehl, funktioniert die App trotzdem.
function preloadPokemonNames() {
  fetchAllPokemonNames()
    .then((names) => {
      window.pokemonNames = names;
      console.log('[Suggestions] Pokémon name suggestions loaded.');
    })
    .catch(() => {
      // silently ignore, suggestions are optional
      console.warn('[Suggestions] Could not preload Pokémon names (non-blocking).');
    });
}

// Zeigt die Vorschläge nur an, wenn der eingegebene Begriff lang genug ist.
// Zusätzlich wird geprüft, ob überhaupt Namensdaten vorhanden sind.
function handleSuggestionRender(term) {
  if (!term || term.length < window.SUGGESTION_THRESHOLD || !window.pokemonNames.length) {
    hideSuggestions();
    console.log('[Suggestions] Term too short or names unavailable, hiding suggestions.');
    return;
  }

  renderSuggestions(term);
}

// Baut die HTML-Liste für die passenden Vorschläge.
// Es werden maximal SUGGESTION_LIMIT Einträge angezeigt, um die Liste kurz zu halten.
function renderSuggestions(term) {
  const matches = window.pokemonNames
    .filter((name) => name.includes(term))
    .slice(0, window.SUGGESTION_LIMIT);

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

// Blendet die Vorschlagsliste aus.
function hideSuggestions() {
  $('#pokemon-suggestions').removeClass('suggestions--visible').empty();
}

// Leert die aktuelle Detailansicht und deaktiviert den Team-Button.
function resetCurrentPokemonView() {
  window.currentPokemon = null;
  clearPokemonDetails();
  clearTypeRelations();
  clearTcgCards();
  disableTeamButton();
}

// Liefert einen zufälligen Pokémon-Namen aus dem Cache oder lädt ihn bei Bedarf nach.
// Das vereinfacht den "Zufallspokémon"-Button im UI.
function getRandomPokemonName() {
  if (window.pokemonNames.length) {
    return Promise.resolve(selectRandomName(window.pokemonNames));
  }

  return fetchAllPokemonNames()
    .then((names) => {
      window.pokemonNames = names;
      return selectRandomName(names);
    })
    .catch((error) => {
      console.warn('[Random] Could not preload Pokémon names.', error);
      return Promise.reject(error);
    });
}

// Helfer um einen zufälligen Namen aus einem Array auszuwählen.
function selectRandomName(names) {
  if (!names || !names.length) {
    throw new Error('No Pokémon names available');
  }

  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}

// Lädt einmalig alle Pokémon-Namen von der API.
// Diese Daten werden für Autocomplete und Zufallsauswahl genutzt.
function fetchAllPokemonNames() {
  return $.ajax({
    url: POKEMON_LIST_ENDPOINT,
    method: 'GET',
    dataType: 'json'
  })
    .then((data) => data.results.map((pokemon) => pokemon.name))
    .catch((error) => {
      console.error('[API] Failed to fetch Pokémon names', error);
      throw error;
    });
}
