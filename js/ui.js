function setStatus(message, type) {
  $('#status-message')
    .hide()
    .attr('class', `status-message status-message--${type}`)
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
    '<div class="type-relations-placeholder text-muted">Stärken und Schwächen werden geladen...</div>'
  );
}

function renderTypeRelations(relations) {
  const content = `
    <div class="relations-grid">
      ${renderRelationPanel('Stärken', relations.strengths, 'Keine offensichtlichen Stärken.')}
      ${renderRelationPanel('Schwächen', relations.weaknesses, 'Keine direkten Schwächen.')}
    </div>
  `;

  $('#type-relations').html(content);
}

function renderRelationPanel(title, values, emptyMessage) {
  if (!values.length) {
    return `
      <div class="relations-panel" aria-live="polite">
        <p class="relations-panel__title">${title}</p>
        <p class="relations-panel__empty">${emptyMessage}</p>
      </div>`;
  }

  return `
    <div class="relations-panel">
      <p class="relations-panel__title">${title}</p>
      <ul class="relations-list">
        ${values.map((value) => `<li class="type-badge text-capitalize">${value}</li>`).join('')}
      </ul>
    </div>`;
}

function clearTypeRelations() {
  $('#type-relations').html(
    '<div class="type-relations-placeholder text-muted">Keine Daten verfügbar.</div>'
  );
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
            <p class="tcg-card-title text-capitalize mb-0">${card.name}</p>
            <small class="text-muted">${card.set?.name || 'TCGdex'}</small>
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
    '<div class="type-relations-placeholder text-warning">Beziehungen konnten nicht geladen werden.</div>'
  );
}

function animateSection(selector) {
  $(selector).hide().fadeIn(400);
}
