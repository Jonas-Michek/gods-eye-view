/**
 * @module pragueMobileGuide
 * @description Mobile Prague Guide & Tactical Radar UI for God's Eye View.
 *
 * Features:
 * - Thumb-friendly bottom dock & pull-up radar sheet ("Co ke mně jede?")
 * - Live countdowns of approaching trams, metros, and buses with delay badges
 * - Click-to-intercept and Cockpit / Ride-Along driver camera tracking
 * - Prague POI navigator with transit laser vectors
 * - GPS user centering in Prague
 */

import * as Cesium from 'cesium';
import pidTransitLayer from '../data/pidTransit.js';
import { PRAGUE_POIS } from '../data/praguePoi.js';
import { PRAGUE_BOUNDS } from '../data/pragueTransitData.js';

let _container = null;
let _viewer = null;
let _radarInterval = null;
let _activePoi = null;

/**
 * Initialize the Mobile Prague Guide UI
 * @param {Cesium.Viewer} viewer
 */
export function initPragueMobileGuide(viewer) {
  if (typeof document === 'undefined') return;
  _viewer = viewer;

  // Create UI container if not already present
  if (document.getElementById('prague-mobile-guide')) return;

  const guideEl = document.createElement('div');
  guideEl.id = 'prague-mobile-guide';
  guideEl.className = 'prague-guide-dock hidden';
  guideEl.style.display = 'none';
  guideEl.innerHTML = `
    <!-- Top Pill Trigger / Status -->
    <div class="prague-guide-header" id="prague-guide-toggle">
      <div class="prague-guide-handle"></div>
      <div class="prague-guide-title">
        <span class="pulse-radar-dot"></span>
        <span class="guide-title-text">PRAGUE INTEL &amp; RADAR</span>
      </div>
      <div class="prague-header-actions">
        <button class="prague-cockpit-btn" id="prague-cockpit-toggle" title="Cockpit / Ride Along">
          🚊 COCKPIT
        </button>
        <button class="prague-dock-close-btn" id="prague-dock-close" title="Zavřít radarový panel">
          ✕
        </button>
      </div>
    </div>

    <!-- Collapsible Drawer Body -->
    <div class="prague-guide-body" id="prague-guide-body">
      <!-- Filter Tabs -->
      <div class="prague-filter-tabs">
        <button class="filter-tab active" data-filter="radar">RADAR OKOLÍ</button>
        <button class="filter-tab" data-filter="pois">PAMÁTKY &amp; CÍLE</button>
        <button class="filter-tab" data-filter="metro">METRO A/B/C</button>
      </div>

      <!-- Radar Panel (Co ke mně jede) -->
      <div class="prague-panel active" id="prague-panel-radar">
        <div class="panel-section-header">
          <span>BLÍŽÍCÍ SE SPOJE</span>
          <button class="prague-gps-btn" id="prague-gps-locate">📍 MOJE POLOHA</button>
        </div>
        <div class="radar-arrivals-list" id="radar-arrivals-list">
          <div class="radar-empty">Skenuji okolí v dosahu 1 km...</div>
        </div>
      </div>

      <!-- POI Panel -->
      <div class="prague-panel" id="prague-panel-pois">
        <div class="panel-section-header">
          <span>TOP PAMÁTKY S TRANZITNÍM NAVEDENÍM</span>
        </div>
        <div class="prague-poi-list" id="prague-poi-list">
          <!-- Populated dynamically -->
        </div>
      </div>

      <!-- Metro Status Panel -->
      <div class="prague-panel" id="prague-panel-metro">
        <div class="metro-lines-grid">
          <div class="metro-card line-a" data-line="A">
            <div class="line-badge" style="background:#009E60">A</div>
            <div class="line-info">
              <div class="line-name">Nemocnice Motol ⇄ Depo Hostivař</div>
              <div class="line-status status-nominal">PROVOZ VČAS · 17 STANIC</div>
            </div>
          </div>
          <div class="metro-card line-b" data-line="B">
            <div class="line-badge" style="background:#FFBF00; color:#000">B</div>
            <div class="line-info">
              <div class="line-name">Zličín ⇄ Černý Most</div>
              <div class="line-status status-nominal">PROVOZ VČAS · 24 STANIC</div>
            </div>
          </div>
          <div class="metro-card line-c" data-line="C">
            <div class="line-badge" style="background:#ED1C24">C</div>
            <div class="line-info">
              <div class="line-name">Letňany ⇄ Háje</div>
              <div class="line-status status-nominal">PROVOZ VČAS · 20 STANIC</div>
            </div>
          </div>
          <div class="metro-card line-d" data-line="D">
            <div class="line-badge" style="background:#0072BB">D</div>
            <div class="line-info">
              <div class="line-name">Náměstí Míru ⇄ Depo Písnice</div>
              <div class="line-status status-future">VÝSTAVBA PRVNÍHO ÚSEKU</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Vehicle / POI Card Overlay -->
      <div class="prague-intel-card" id="prague-intel-card" style="display:none;">
        <div class="intel-card-header">
          <span class="intel-card-badge" id="intel-card-badge">TRAM 22</span>
          <span class="intel-card-destination" id="intel-card-dest">Bílá Hora</span>
          <button class="intel-card-close" id="intel-card-close">×</button>
        </div>
        <div class="intel-card-telemetry" id="intel-card-telemetry">
          <!-- Injected via telemetry events -->
        </div>
        <div class="intel-card-actions">
          <button class="intel-action-btn primary" id="intel-btn-cockpit">JÍZDA V KABINĚ</button>
          <button class="intel-action-btn secondary" id="intel-btn-flyto">ZAMĚŘIT V 3D</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(guideEl);
  _container = guideEl;

  setupGuideEvents(viewer);
  populatePoiList(viewer);
  startRadarScan(viewer);
}

/**
 * Event listeners and tab switches
 */
function setupGuideEvents(viewer) {
  const toggleBtn = document.getElementById('prague-guide-toggle');
  const cockpitBtn = document.getElementById('prague-cockpit-toggle');
  const gpsBtn = document.getElementById('prague-gps-locate');
  const cardClose = document.getElementById('intel-card-close');

  // Toggle drawer expand/collapse
  toggleBtn.addEventListener('click', (e) => {
    if (e.target.closest('#prague-cockpit-toggle') || e.target.closest('#prague-dock-close')) return;
    _container.classList.toggle('expanded');
  });

  // Cockpit view toggle
  cockpitBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    pidTransitLayer.toggleCockpitTracking();
  });

  // Dock close button
  const dockCloseBtn = document.getElementById('prague-dock-close');
  if (dockCloseBtn) {
    dockCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hidePragueGuide();
      if (typeof pidTransitLayer.setParams === 'function') {
        pidTransitLayer.setParams({ showRadar: false });
      }
    });
  }

  // GPS Locate
  gpsBtn.addEventListener('click', () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 450),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-35),
            },
            duration: 2.0,
          });
          refreshRadarArrivals(lat, lon);
        },
        (err) => {
          console.warn('[GPS] Geolocation failed, using Prague center:', err);
          flyToPragueCenter(viewer);
        },
      );
    } else {
      flyToPragueCenter(viewer);
    }
  });

  // Filter Tabs switch
  const tabs = _container.querySelectorAll('.filter-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.filter;
      _container.querySelectorAll('.prague-panel').forEach((p) => p.classList.remove('active'));
      const panel = document.getElementById(`prague-panel-${target}`);
      if (panel) panel.classList.add('active');
    });
  });

  // Card close button
  cardClose.addEventListener('click', () => {
    document.getElementById('prague-intel-card').style.display = 'none';
  });

  // Listen to vehicle selected event
  window.addEventListener('gev:pid-vehicle-selected', (e) => {
    const v = e.detail;
    showVehicleIntelCard(viewer, v);
  });

  // Listen to POI selected event
  window.addEventListener('gev:pid-poi-selected', (e) => {
    const poi = e.detail;
    showPoiIntelCard(viewer, poi);
  });
}

function flyToPragueCenter(viewer) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(PRAGUE_BOUNDS.center.lon, PRAGUE_BOUNDS.center.lat, 800),
    orientation: {
      heading: Cesium.Math.toRadians(310),
      pitch: Cesium.Math.toRadians(-30),
    },
    duration: 2.0,
  });
}

/**
 * Display vehicle card with tactical telemetry and delay
 */
function showVehicleIntelCard(viewer, v) {
  const card = document.getElementById('prague-intel-card');
  const badge = document.getElementById('intel-card-badge');
  const dest = document.getElementById('intel-card-dest');
  const telemetry = document.getElementById('intel-card-telemetry');
  const btnCockpit = document.getElementById('intel-btn-cockpit');
  const btnFlyto = document.getElementById('intel-btn-flyto');

  badge.textContent = v.lineName;
  badge.style.background = v.type === 'metro' ? (v.line === 'A' ? '#009E60' : v.line === 'B' ? '#FFBF00' : '#ED1C24') : '#DC301B';
  badge.style.color = v.line === 'B' ? '#000' : '#fff';
  dest.textContent = `směr ${v.direction}`;

  const delayText = parseFloat(v.delayMin) > 0 ? `+${v.delayMin} min` : 'Včas';
  const delayClass = parseFloat(v.delayMin) > 2 ? 'delay-bad' : 'delay-good';

  telemetry.innerHTML = `
    <div class="telemetry-row">
      <span class="label">Příští zastávka:</span>
      <span class="value font-highlight">${v.nextStop || 'Na trase'}</span>
    </div>
    <div class="telemetry-row">
      <span class="label">Přesnost / Zpoždění:</span>
      <span class="value ${delayClass}">${delayText}</span>
    </div>
    <div class="telemetry-row">
      <span class="label">Vůz / Souprava:</span>
      <span class="value">${v.fleetNumber || 'Standard'}</span>
    </div>
    <div class="telemetry-row">
      <span class="label">Vybavení:</span>
      <span class="value">${v.wheelchair ? '♿ Nízkopodlažní' : 'Schody'} ${v.airConditioned ? '· ❄️ Klima' : ''}</span>
    </div>
  `;

  btnCockpit.onclick = () => {
    pidTransitLayer.toggleCockpitTracking(v);
  };

  btnFlyto.onclick = () => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 250),
      duration: 1.5,
    });
  };

  card.style.display = 'block';
  _container.classList.add('expanded');
}

/**
 * Display POI card with nearest stop and recommended lines
 */
function showPoiIntelCard(viewer, poi) {
  const card = document.getElementById('prague-intel-card');
  const badge = document.getElementById('intel-card-badge');
  const dest = document.getElementById('intel-card-dest');
  const telemetry = document.getElementById('intel-card-telemetry');
  const btnCockpit = document.getElementById('intel-btn-cockpit');
  const btnFlyto = document.getElementById('intel-btn-flyto');

  badge.textContent = 'PAMÁTKA';
  badge.style.background = '#38bdf8';
  badge.style.color = '#000';
  dest.textContent = poi.name;

  telemetry.innerHTML = `
    <div class="telemetry-desc">${poi.description}</div>
    <div class="telemetry-row">
      <span class="label">Nejbližší stanice:</span>
      <span class="value font-highlight">${poi.nearestStop}</span>
    </div>
    <div class="telemetry-row">
      <span class="label">Doporučené linky:</span>
      <span class="value">${poi.recommendedLines.join(', ')}</span>
    </div>
    <div class="telemetry-tip">
      <span class="tip-icon">💡</span> ${poi.insiderTip}
    </div>
  `;

  btnCockpit.textContent = 'LETOVÝ PRŮLET';
  btnCockpit.onclick = () => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, 350),
      orientation: {
        heading: Cesium.Math.toRadians(45),
        pitch: Cesium.Math.toRadians(-25),
      },
      duration: 2.0,
    });
  };

  btnFlyto.textContent = 'TRANZITNÍ LASER';
  btnFlyto.onclick = () => {
    window.dispatchEvent(new CustomEvent('gev:pid-poi-selected', { detail: poi }));
  };

  card.style.display = 'block';
  _container.classList.add('expanded');
}

/**
 * Populate list of Prague POIs
 */
function populatePoiList(viewer) {
  const listEl = document.getElementById('prague-poi-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  PRAGUE_POIS.forEach((poi) => {
    const item = document.createElement('div');
    item.className = 'poi-list-item';
    item.innerHTML = `
      <div class="poi-item-main">
        <div class="poi-item-name">${poi.name}</div>
        <div class="poi-item-sub">${poi.nearestStop} · ${poi.recommendedLines[0]}</div>
      </div>
      <button class="poi-item-btn">FLY</button>
    `;
    item.addEventListener('click', () => {
      showPoiIntelCard(viewer, poi);
      window.dispatchEvent(new CustomEvent('gev:pid-poi-selected', { detail: poi }));
    });
    listEl.appendChild(item);
  });
}

/**
 * Periodically scan nearby transit arrivals based on camera or GPS position
 */
function startRadarScan(viewer) {
  if (_radarInterval) clearInterval(_radarInterval);

  function checkRadar() {
    let lat = PRAGUE_BOUNDS.center.lat;
    let lon = PRAGUE_BOUNDS.center.lon;

    try {
      if (viewer && viewer.camera) {
        const carto = viewer.camera.positionCartographic;
        if (carto && Cesium && Cesium.Math) {
          const cLat = Cesium.Math.toDegrees(carto.latitude);
          const cLon = Cesium.Math.toDegrees(carto.longitude);
          if (Number.isFinite(cLat) && Number.isFinite(cLon)) {
            // Only use camera if within or near Prague
            if (cLat >= 49.8 && cLat <= 50.3 && cLon >= 14.1 && cLon <= 14.8) {
              lat = cLat;
              lon = cLon;
            }
          }
        }
      }
    } catch {
      // Safe fallback to Prague center
    }
    refreshRadarArrivals(lat, lon);
  }

  checkRadar();
  _radarInterval = setInterval(checkRadar, 4000);
}

function refreshRadarArrivals(userLat, userLon) {
  const listEl = document.getElementById('radar-arrivals-list');
  if (!listEl) return;

  const arrivals = pidTransitLayer.getNearbyArrivals(userLat, userLon, 1200);
  if (arrivals.length === 0) {
    listEl.innerHTML = '<div class="radar-empty">V dosahu 1,2 km nejsou žádné aktivní spoje. Přibližte se k centru Prahy.</div>';
    return;
  }

  listEl.innerHTML = '';
  arrivals.slice(0, 6).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'radar-arrival-row';

    const min = Math.floor(item.etaSec / 60);
    const sec = item.etaSec % 60;
    const etaStr = min > 0 ? `${min}m ${sec}s` : `${sec}s`;

    row.innerHTML = `
      <div class="radar-row-badge ${item.type}">${item.line}</div>
      <div class="radar-row-body">
        <div class="radar-row-dest">${item.direction}</div>
        <div class="radar-row-meta">${item.distM} m vzdálenost · Zpoždění +${item.delayMin}m</div>
      </div>
      <div class="radar-row-eta">${etaStr}</div>
    `;

    row.addEventListener('click', () => {
      showVehicleIntelCard(_viewer, item.vehicle);
    });

    listEl.appendChild(row);
  });
}

/** Show the Prague Guide mobile dock */
export function showPragueGuide() {
  if (typeof document === 'undefined') return;
  if (_container) {
    _container.classList.remove('hidden');
    _container.style.display = 'block';
  }
}

/** Hide the Prague Guide mobile dock */
export function hidePragueGuide() {
  if (typeof document === 'undefined') return;
  if (_container) {
    _container.classList.add('hidden');
    _container.style.display = 'none';
    _container.classList.remove('expanded');
  }
}

/** Toggle visibility of Prague Guide dock */
export function togglePragueGuide() {
  if (typeof document === 'undefined') return false;
  if (_container) {
    if (_container.classList.contains('hidden') || _container.style.display === 'none') {
      showPragueGuide();
      return true;
    } else {
      hidePragueGuide();
      return false;
    }
  }
  return false;
}

/** Check if Prague Guide dock is visible */
export function isPragueGuideVisible() {
  if (typeof document === 'undefined') return false;
  return Boolean(_container && !_container.classList.contains('hidden') && _container.style.display !== 'none');
}

