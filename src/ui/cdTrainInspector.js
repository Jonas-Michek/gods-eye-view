/**
 * @module cdTrainInspector
 * @description UI Component for České dráhy (Czech Railways) train search and route inspector in God's Eye View.
 *
 * Features:
 * - Real-time station search with debounced autocomplete whisperer
 * - Connection search between any Czech stations with live delay badges
 * - Click-to-inspect: renders 3D railway track polyline and station pins in Cesium
 * - Detailed train card with timetable, kilometrage, and delay pulse
 * - Cockpit / Ride-Along driver chase camera tracking toggle
 */

import cdTransitLayer, { searchStations, searchConnections } from '../data/cdTransit.js';

let _viewer = null;
let _container = null;
let _activeConn = null;
let _fromTimeout = null;
let _toTimeout = null;

/**
 * Initializes the ČD Train Inspector component.
 * @param {Cesium.Viewer} viewer
 */
export function initCdTrainInspector(viewer) {
  _viewer = viewer;
  _container = document.getElementById('context-cd-view');
  if (!_container) return;

  renderInspectorLayout();
  setupEventListeners();
}

/**
 * Renders the HTML structure inside #context-cd-view.
 */
function renderInspectorLayout() {
  _container.innerHTML = `
    <div class="cd-panel-container">
      <div class="cd-panel-header">
        <div class="cd-title-group">
          <span class="cd-train-icon-badge">🚆</span>
          <div>
            <h3 class="cd-title-text">VLAKY ČESKÝCH DRAH</h3>
            <span class="cd-subtitle-text">Vyhledávač spojů &amp; 3D kolejový radar</span>
          </div>
        </div>
        <div class="cd-status-chip" id="cd-live-chip">LIVE ČD</div>
      </div>

      <!-- Search Form -->
      <div class="cd-search-card">
        <div class="cd-input-group">
          <label for="cd-input-from" class="cd-label">ODKUD</label>
          <div class="cd-input-wrap">
            <input type="text" id="cd-input-from" class="cd-input" placeholder="např. Praha hl.n." autocomplete="off" value="Praha hl.n.">
            <div id="cd-from-dropdown" class="cd-dropdown" hidden></div>
          </div>
        </div>

        <button type="button" id="cd-swap-btn" class="cd-swap-btn" title="Prohodit stanice" aria-label="Prohodit">
          ⇄
        </button>

        <div class="cd-input-group">
          <label for="cd-input-to" class="cd-label">KAM</label>
          <div class="cd-input-wrap">
            <input type="text" id="cd-input-to" class="cd-input" placeholder="např. Brno hl.n., Ostrava..." autocomplete="off" value="Brno hl.n.">
            <div id="cd-to-dropdown" class="cd-dropdown" hidden></div>
          </div>
        </div>

        <div class="cd-search-actions">
          <button type="button" id="cd-search-btn" class="cd-primary-btn">
            <span>VYHLEDAT SPOJENÍ</span>
          </button>
        </div>
      </div>

      <!-- Active Train Inspector Banner (Shown when a train is selected) -->
      <div id="cd-active-inspector" class="cd-active-inspector" hidden>
        <div class="cd-inspector-card">
          <div class="cd-inspector-header">
            <div>
              <span class="cd-active-train-tag" id="cd-inspector-train-name">SC 505 Pendolino</span>
              <span class="cd-active-delay-badge" id="cd-inspector-delay">Včas</span>
            </div>
            <button type="button" id="cd-clear-route-btn" class="cd-icon-action-btn" title="Zrušit trasu">✕</button>
          </div>

          <div class="cd-inspector-route" id="cd-inspector-route-summary">
            Praha hl.n. → Ostrava hl.n.
          </div>

          <div class="cd-inspector-controls">
            <button type="button" id="cd-flyto-btn" class="cd-secondary-btn">
              <span>🔍 PŘIBLÍŽIT TRASU</span>
            </button>
            <button type="button" id="cd-cockpit-btn" class="cd-accent-btn">
              <span>🚊 SLEDOVAT VLAK (COCKPIT)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Connection Results List -->
      <div class="cd-results-container">
        <div class="cd-results-header">
          <span class="cd-results-title">NALEZENÉ SPOJE</span>
          <span id="cd-results-count" class="cd-results-count">0 spojů</span>
        </div>
        <div id="cd-results-list" class="cd-results-list">
          <div class="cd-placeholder">Zadejte stanice a klikněte na Vyhledat spojení.</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Wires input listeners, search triggers, and card clicks.
 */
function setupEventListeners() {
  const fromInput = document.getElementById('cd-input-from');
  const toInput = document.getElementById('cd-input-to');
  const fromDropdown = document.getElementById('cd-from-dropdown');
  const toDropdown = document.getElementById('cd-to-dropdown');
  const swapBtn = document.getElementById('cd-swap-btn');
  const searchBtn = document.getElementById('cd-search-btn');
  const flyToBtn = document.getElementById('cd-flyto-btn');
  const cockpitBtn = document.getElementById('cd-cockpit-btn');
  const clearBtn = document.getElementById('cd-clear-route-btn');

  // Autocomplete for "Odkud"
  fromInput?.addEventListener('input', () => {
    clearTimeout(_fromTimeout);
    const q = fromInput.value.trim();
    if (q.length < 2) {
      if (fromDropdown) fromDropdown.hidden = true;
      return;
    }
    _fromTimeout = setTimeout(async () => {
      const stations = await searchStations(q);
      renderDropdown(fromDropdown, stations, (name) => {
        fromInput.value = name;
        fromDropdown.hidden = true;
      });
    }, 280);
  });

  // Autocomplete for "Kam"
  toInput?.addEventListener('input', () => {
    clearTimeout(_toTimeout);
    const q = toInput.value.trim();
    if (q.length < 2) {
      if (toDropdown) toDropdown.hidden = true;
      return;
    }
    _toTimeout = setTimeout(async () => {
      const stations = await searchStations(q);
      renderDropdown(toDropdown, stations, (name) => {
        toInput.value = name;
        toDropdown.hidden = true;
      });
    }, 280);
  });

  // Swap button
  swapBtn?.addEventListener('click', () => {
    if (fromInput && toInput) {
      const tmp = fromInput.value;
      fromInput.value = toInput.value;
      toInput.value = tmp;
    }
  });

  // Search button
  searchBtn?.addEventListener('click', () => {
    handleSearchConnections();
  });

  // Allow pressing Enter in inputs to search
  fromInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearchConnections();
  });
  toInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearchConnections();
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.cd-input-wrap')) {
      if (fromDropdown) fromDropdown.hidden = true;
      if (toDropdown) toDropdown.hidden = true;
    }
  });

  // Inspector Buttons
  flyToBtn?.addEventListener('click', () => {
    cdTransitLayer.flyToRoute();
  });

  cockpitBtn?.addEventListener('click', () => {
    const isNowCockpit = cdTransitLayer.toggleCockpitTracking();
    if (cockpitBtn) {
      cockpitBtn.classList.toggle('active', isNowCockpit);
      cockpitBtn.innerHTML = isNowCockpit
        ? '<span>✕ ZRUŠIT SLEDOVÁNÍ</span>'
        : '<span>🚊 SLEDOVAT VLAK (COCKPIT)</span>';
    }
  });

  clearBtn?.addEventListener('click', () => {
    cdTransitLayer.clearActiveConnection();
    const inspector = document.getElementById('cd-active-inspector');
    if (inspector) inspector.hidden = true;
    _activeConn = null;
    updateCardSelection(null);
  });
}

/**
 * Renders autocomplete dropdown suggestions.
 */
function renderDropdown(dropdown, stations, onSelect) {
  if (!dropdown) return;
  if (!stations || stations.length === 0) {
    dropdown.hidden = true;
    return;
  }

  dropdown.innerHTML = '';
  for (const st of stations) {
    const item = document.createElement('div');
    item.className = 'cd-dropdown-item';
    item.innerHTML = `
      <span class="cd-item-name">${st.name}</span>
      ${st.region ? `<span class="cd-item-region">${st.region}</span>` : ''}
    `;
    item.addEventListener('click', () => onSelect(st.name));
    dropdown.appendChild(item);
  }
  dropdown.hidden = false;
}

/**
 * Executes train connection search and renders the result cards.
 */
async function handleSearchConnections() {
  const fromInput = document.getElementById('cd-input-from');
  const toInput = document.getElementById('cd-input-to');
  const resultsList = document.getElementById('cd-results-list');
  const resultsCount = document.getElementById('cd-results-count');
  const searchBtn = document.getElementById('cd-search-btn');

  const from = fromInput?.value.trim();
  const to = toInput?.value.trim();

  if (!from || !to) {
    if (resultsList) resultsList.innerHTML = '<div class="cd-error">Vyplňte prosím obě stanice.</div>';
    return;
  }

  if (searchBtn) searchBtn.disabled = true;
  if (resultsList) {
    resultsList.innerHTML = `
      <div class="cd-loading">
        <span class="cd-spinner"></span>
        <span>Vyhledávám spoje v síti Českých drah...</span>
      </div>
    `;
  }

  try {
    const data = await searchConnections(from, to, new Date());
    const connections = data.connections || [];

    if (resultsCount) {
      resultsCount.textContent = `${connections.length} spojů`;
    }

    if (connections.length === 0) {
      if (resultsList) {
        resultsList.innerHTML = `<div class="cd-empty">Pro trasu ${from} → ${to} nebyly nalezeny žádné spoje.</div>`;
      }
      return;
    }

    renderConnectionCards(connections);
  } catch (err) {
    if (resultsList) {
      resultsList.innerHTML = `<div class="cd-error">Chyba při vyhledávání: ${err.message || 'Server nedostupný'}</div>`;
    }
  } finally {
    if (searchBtn) searchBtn.disabled = false;
  }
}

/**
 * Renders list of connection cards.
 */
function renderConnectionCards(connections) {
  const list = document.getElementById('cd-results-list');
  if (!list) return;

  list.innerHTML = '';
  for (const conn of connections) {
    const card = document.createElement('div');
    card.className = 'cd-conn-card';
    card.setAttribute('data-conn-id', conn.id);

    const first = conn.trains?.[0] || {};
    const depTime = conn.firstDeparture
      ? new Date(conn.firstDeparture).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
      : '--:--';
    const arrTime = conn.lastArrival
      ? new Date(conn.lastArrival).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
      : '--:--';

    const isDelayed = conn.delayMinutes > 0;
    const delayClass = isDelayed ? 'delay-late' : 'delay-ok';
    const trainBadge = first.trainType || 'Vlak';
    const trainTitle = [first.trainType, first.trainNum, first.trainTitle].filter(Boolean).join(' ');

    card.innerHTML = `
      <div class="cd-card-top">
        <div class="cd-card-times">
          <span class="cd-time">${depTime}</span>
          <span class="cd-arrow">→</span>
          <span class="cd-time">${arrTime}</span>
          <span class="cd-duration">(${conn.totalDuration || '—'})</span>
        </div>
        <span class="cd-delay-pill ${delayClass}">${conn.delayText || 'Včas'}</span>
      </div>

      <div class="cd-card-train-info">
        <span class="cd-train-type-tag">${trainBadge}</span>
        <strong class="cd-train-full-name">${trainTitle}</strong>
        ${first.line ? `<span class="cd-line-badge">${first.line}</span>` : ''}
      </div>

      <div class="cd-card-meta">
        <span>${conn.distance || ''}</span>
        <span>•</span>
        <span>${conn.transfers === 0 ? 'Přímý spoj' : `${conn.transfers} přestup`}</span>
        <span class="cd-inspect-cta">ZOBRAZIT NA MAPĚ ➔</span>
      </div>
    `;

    card.addEventListener('click', () => {
      selectConnectionAndInspect(conn);
    });

    list.appendChild(card);
  }
}

/**
 * Handles selecting a connection card and updating UI inspector.
 */
function selectConnectionAndInspect(conn) {
  _activeConn = conn;
  updateCardSelection(conn.id);

  // 1. Activate 3D track, stations, train marker and camera in Cesium
  cdTransitLayer.selectConnection(conn);

  // 2. Populate and display inspector banner
  const inspector = document.getElementById('cd-active-inspector');
  const trainName = document.getElementById('cd-inspector-train-name');
  const delayBadge = document.getElementById('cd-inspector-delay');
  const routeSummary = document.getElementById('cd-inspector-route-summary');

  const first = conn.trains?.[0] || {};
  const isDelayed = conn.delayMinutes > 0;

  if (trainName) {
    trainName.textContent = [first.trainType, first.trainNum, first.trainTitle].filter(Boolean).join(' ');
  }
  if (delayBadge) {
    delayBadge.textContent = conn.delayText || 'Včas';
    delayBadge.className = `cd-active-delay-badge ${isDelayed ? 'delay-late' : 'delay-ok'}`;
  }
  if (routeSummary) {
    routeSummary.textContent = `${conn.fromStation} → ${conn.toStation} (${conn.distance || ''})`;
  }

  if (inspector) inspector.hidden = false;
}

/**
 * Highlights the active connection card in the list.
 */
function updateCardSelection(selectedId) {
  const cards = document.querySelectorAll('.cd-conn-card');
  cards.forEach((c) => {
    const cardId = c.getAttribute('data-conn-id');
    c.classList.toggle('selected', cardId === String(selectedId));
  });
}

export default {
  initCdTrainInspector,
};
