function setStatus(message, type) {
  $('#status-message')
    .hide()
    .removeClass()
    .addClass(`alert alert-${type}`)
    .text(message)
    .fadeIn(200);
}

function disableTeamButton() {
  $('#add-to-team').prop('disabled', true);
}

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

function clearPokemonDetails() {
  $('#pokemon-details').empty();
  disableTeamButton();
}

function showTypeRelationsLoading() {
  $('#type-relations').html(
    '<div class="col-12 text-muted">Stärken und Schwächen werden geladen...</div>'
  );
}

function renderTypeRelations(relations) {
  const content = `
    ${renderRelationColumn('Stärken', relations.strengths, 'Keine offensichtlichen Stärken.')}
    ${renderRelationColumn('Schwächen', relations.weaknesses, 'Keine direkten Schwächen.')}
    ${renderRelationColumn('Resistenzen', relations.resistances, 'Keine speziellen Resistenzen.')}
    ${renderRelationColumn('Immunitäten', relations.immunities, 'Keine Immunitäten gefunden.')}
  `;

  $('#type-relations').html(content);
}

function renderRelationColumn(title, values, emptyMessage) {
  if (!values.length) {
    return `
      <div class="col-12 col-sm-6">
        <div class="relation-card">
          <p class="text-uppercase small text-muted mb-1">${title}</p>
          <p class="mb-0 text-light">${emptyMessage}</p>
        </div>
      </div>`;
  }

  return `
    <div class="col-12 col-sm-6">
      <div class="relation-card">
        <p class="text-uppercase small text-muted mb-2">${title}</p>
        <ul class="relation-list">
          ${values
            .map((value) => `<li class="type-badge text-capitalize">${value}</li>`)
            .join('')}
        </ul>
      </div>
    </div>`;
}

function clearTypeRelations() {
  $('#type-relations').html('<div class="col-12 text-muted">Keine Daten verfügbar.</div>');
}

function showTcgLoading() {
  $('#tcg-cards').html('<p>Karten werden geladen...</p>');
}

function renderTcgCards(cards) {
  if (!cards.length) {
    $('#tcg-cards').html('<p>Keine Karten verfügbar.</p>');
    return;
  }

  const html = cards
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

  $('#tcg-cards').hide().html(html).fadeIn(300);
}

function clearTcgCards() {
  $('#tcg-cards').html('<p>Keine Karten verfügbar.</p>');
}

function renderTcgCardsError() {
  $('#tcg-cards').html('<p>TCG API nicht erreichbar.</p>');
}

function renderTypeRelationsError() {
  $('#type-relations').html(
    '<div class="col-12 text-warning">Beziehungen konnten nicht geladen werden.</div>'
  );
}

function animateSection(selector) {
  $(selector).hide().fadeIn(400);
}
