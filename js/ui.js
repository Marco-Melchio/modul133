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

function clearPokemonDetails() {
  $('#pokemon-details').empty();
  disableTeamButton();
}

function showTypeRelationsLoading() {
  const loading =
    '<div class="type-relations-placeholder text-muted">Stärken und Schwächen werden geladen...</div>';

  $('#strength-relations').html(loading);
  $('#weakness-relations').html(loading);
}

function renderTypeRelations(relations) {
  $('#strength-relations').html(
    renderRelationContent(relations.strengths, 'Keine offensichtlichen Stärken.')
  );
  $('#weakness-relations').html(renderRelationContent(relations.weaknesses, 'Keine direkten Schwächen.'));
}

function renderRelationContent(values, emptyMessage) {
  if (!values.length) {
    return `<p class="relations-panel__empty">${emptyMessage}</p>`;
  }

  return `
    <ul class="relations-list">
      ${values.map((value) => `<li class="type-badge text-capitalize">${value}</li>`).join('')}
    </ul>`;
}

function clearTypeRelations() {
  $('#strength-relations').html(
    '<div class="type-relations-placeholder text-muted">Keine Daten verfügbar.</div>'
  );
  $('#weakness-relations').html(
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

function clearTcgCards() {
  $('#tcg-cards').html('<p>Keine Karten verfügbar.</p>');
}

function renderTcgCardsError() {
  $('#tcg-cards').html('<p>TCG API nicht erreichbar.</p>');
}

function renderTypeRelationsError() {
  const errorMessage =
    '<div class="type-relations-placeholder text-warning">Beziehungen konnten nicht geladen werden.</div>';

  $('#strength-relations').html(errorMessage);
  $('#weakness-relations').html(errorMessage);
}

function animateSection(selector) {
  $(selector).hide().fadeIn(400);
}
