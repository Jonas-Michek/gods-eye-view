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
import { PRAGUE_BOUNDS, METRO_LINES, METRO_COLORS } from '../data/pragueTransitData.js';

let _container = null;
let _viewer = null;
let _radarInterval = null;

/**
 * Initialize the Prague Transit (PID) Context UI
 * @param {Cesium.Viewer} viewer
 */
export function initPragueMobileGuide(viewer) {
  if (typeof document === 'undefined') return;
  _viewer = viewer;

  const contextView = document.getElementById('context-pid-view');
  if (!contextView) return;
  _container = contextView;

  setupGuideEvents(viewer);
  populatePoiList(viewer);
  setupMetroCards(viewer);
  startRadarScan(viewer);
}

/**
 * Event listeners and tab switches inside PID Context panel
 */
function setupGuideEvents(viewer) {
  const cockpitBtn = document.getElementById('prague-cockpit-toggle');
  const gpsBtn = document.getElementById('prague-gps-locate');
  const cardClose = document.getElementById('intel-card-close');

  // Cockpit view toggle
  cockpitBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    pidTransitLayer.toggleCockpitTracking();
  });

  // GPS Locate
  gpsBtn?.addEventListener('click', () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          viewer?.camera?.flyTo?.({
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
  if (_container) {
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
  }

  // Card close button
  cardClose?.addEventListener('click', () => {
    const card = document.getElementById('prague-intel-card');
    if (card) card.style.display = 'none';
  });

  // Listen to vehicle selected event
  window.addEventListener('gev:pid-vehicle-selected', (e) => {
    showVehicleIntelCard(viewer, e.detail);
  });

  // Listen to station selected event
  window.addEventListener('gev:pid-station-selected', (e) => {
    showStationIntelCard(viewer, e.detail);
  });

  // Listen to POI selected event
  window.addEventListener('gev:pid-poi-selected', (e) => {
    showPoiIntelCard(viewer, e.detail);
  });

  // Listen to selection cleared
  window.addEventListener('gev:pid-selection-cleared', () => {
    const card = document.getElementById('prague-intel-card');
    if (card) card.style.display = 'none';
  });

  // Listen to cockpit state changes to keep button visual state in sync
  window.addEventListener('gev:pid-cockpit-changed', (e) => {
    const active = Boolean(e?.detail?.active);
    if (cockpitBtn) {
      cockpitBtn.classList.toggle('active', active);
      cockpitBtn.innerHTML = active ? '🚊 SLEDUJI ZE SHORA' : '🚊 SLEDOVAT ZE SHORA';
    }
  });
}

/**
 * Wire up Metro line cards to fly camera to overview
 */
function setupMetroCards(viewer) {
  const cards = document.querySelectorAll('#context-pid-view .metro-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const lineKey = card.dataset.line;
      const metroLine = METRO_LINES[lineKey];
      if (metroLine && metroLine.stations && metroLine.stations.length > 0) {
        const midStation = metroLine.stations[Math.floor(metroLine.stations.length / 2)];
        viewer?.camera?.flyTo?.({
          destination: Cesium.Cartesian3.fromDegrees(midStation.lon, midStation.lat, 4000),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-60),
          },
          duration: 2.0,
        });
      }
    });
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
  if (!card || !v) return;
  const badge = document.getElementById('intel-card-badge');
  const dest = document.getElementById('intel-card-dest');
  const telemetry = document.getElementById('intel-card-telemetry');
  const btnCockpit = document.getElementById('intel-btn-cockpit');
  const btnFlyto = document.getElementById('intel-btn-flyto');

  if (badge) {
    badge.textContent = v.lineName;
    badge.style.background = v.type === 'metro'
      ? (v.line === 'A' ? '#009E60' : v.line === 'B' ? '#FFBF00' : v.line === 'D' ? '#0072BB' : '#ED1C24')
      : '#DC301B';
    badge.style.color = (v.type === 'metro' && v.line === 'B') ? '#000' : '#fff';
  }

  if (dest) {
    dest.textContent = `směr ${v.direction}`;
  }

  const delayText = parseFloat(v.delayMin) > 0 ? `+${v.delayMin} min` : 'Včas';
  const delayClass = parseFloat(v.delayMin) > 2 ? 'delay-bad' : 'delay-good';

  if (telemetry) {
    telemetry.innerHTML = `
      <div class="telemetry-row">
        <span class="label">Příští stanice:</span>
        <span class="value font-highlight">${v.nextStop || 'Na trase'}</span>
      </div>
      <div class="telemetry-row">
        <span class="label">Zpoždění:</span>
        <span class="value ${delayClass}">${delayText}</span>
      </div>
      <div class="telemetry-row">
        <span class="label">Vůz / Souprava:</span>
        <span class="value">${v.fleetNumber || 'Standard'}</span>
      </div>
      <div class="telemetry-row">
        <span class="label">Vybavení:</span>
        <span class="value">${v.wheelchair ? '♿ Nízkopodlažní' : 'Standard'} ${v.airConditioned ? '· ❄️ Klima' : ''}</span>
      </div>
    `;
  }

  if (btnCockpit) {
    btnCockpit.textContent = 'SLEDOVAT ZE SHORA';
    btnCockpit.onclick = () => {
      pidTransitLayer.toggleCockpitTracking(v);
    };
  }

  if (btnFlyto) {
    btnFlyto.textContent = 'ZAMĚŘIT V 3D';
    btnFlyto.onclick = () => {
      viewer?.camera?.flyTo?.({
        destination: Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 300),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
        },
        duration: 1.5,
      });
    };
  }

  card.style.display = 'block';
}

/**
 * Display station card with depth, transfers, and 3D focus
 */
function showStationIntelCard(viewer, station) {
  const card = document.getElementById('prague-intel-card');
  if (!card || !station) return;
  const badge = document.getElementById('intel-card-badge');
  const dest = document.getElementById('intel-card-dest');
  const telemetry = document.getElementById('intel-card-telemetry');
  const btnCockpit = document.getElementById('intel-btn-cockpit');
  const btnFlyto = document.getElementById('intel-btn-flyto');

  if (badge) {
    badge.textContent = `METRO ${station.line}`;
    badge.style.background = METRO_COLORS[station.line] || '#009E60';
    badge.style.color = station.line === 'B' ? '#000' : '#fff';
  }

  if (dest) {
    dest.textContent = station.name;
  }

  const depthInfo = station.surface ? 'Povrchová stanice' : `${station.depth} m pod terénem`;
  const transferInfo = station.transfer
    ? `Přestup na linku ${station.transfer}`
    : (station.trainTransfer
      ? 'Přestup na vlak (ČD)'
      : (station.airportTransfer
        ? 'Přestup na letištní bus 119'
        : (station.futureTransfer
          ? `Budoucí přestup na linku ${station.futureTransfer}`
          : 'Průchozí stanice')));

  if (telemetry) {
    telemetry.innerHTML = `
      <div class="telemetry-row">
        <span class="label">Poloha / hloubka:</span>
        <span class="value font-highlight">${depthInfo}</span>
      </div>
      <div class="telemetry-row">
        <span class="label">Přestup / spojení:</span>
        <span class="value">${transferInfo}</span>
      </div>
      <div class="telemetry-row">
        <span class="label">GPS:</span>
        <span class="value font-mono">${station.lat.toFixed(4)}°N, ${station.lon.toFixed(4)}°E</span>
      </div>
    `;
  }

  if (btnCockpit) {
    btnCockpit.textContent = 'RADAR STANICE';
    btnCockpit.onclick = () => {
      refreshRadarArrivals(station.lat, station.lon);
      const radarTab = document.querySelector('#context-pid-view .filter-tab[data-filter="radar"]');
      if (radarTab) radarTab.click();
    };
  }

  if (btnFlyto) {
    btnFlyto.textContent = 'ZAMĚŘIT V 3D';
    btnFlyto.onclick = () => {
      viewer?.camera?.flyTo?.({
        destination: Cesium.Cartesian3.fromDegrees(station.lon, station.lat, 400),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
        },
        duration: 1.5,
      });
    };
  }

  card.style.display = 'block';
}

/**
 * Display POI card with nearest stop and recommended lines
 */
function showPoiIntelCard(viewer, poi) {
  const card = document.getElementById('prague-intel-card');
  if (!card || !poi) return;
  const badge = document.getElementById('intel-card-badge');
  const dest = document.getElementById('intel-card-dest');
  const telemetry = document.getElementById('intel-card-telemetry');
  const btnCockpit = document.getElementById('intel-btn-cockpit');
  const btnFlyto = document.getElementById('intel-btn-flyto');

  if (badge) {
    badge.textContent = 'PAMÁTKA';
    badge.style.background = '#38bdf8';
    badge.style.color = '#000';
  }

  if (dest) {
    dest.textContent = poi.name;
  }

  if (telemetry) {
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
  }

  if (btnCockpit) {
    btnCockpit.textContent = 'LETOVÝ PRŮLET';
    btnCockpit.onclick = () => {
      viewer?.camera?.flyTo?.({
        destination: Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, 350),
        orientation: {
          heading: Cesium.Math.toRadians(45),
          pitch: Cesium.Math.toRadians(-25),
        },
        duration: 2.0,
      });
    };
  }

  if (btnFlyto) {
    btnFlyto.textContent = 'TRANZITNÍ LASER';
    btnFlyto.onclick = () => {
      window.dispatchEvent(new CustomEvent('gev:pid-poi-selected', { detail: poi }));
    };
  }

  card.style.display = 'block';
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

/** Show the Prague PID context panel tab */
export function showPragueGuide() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gev:open-pid-context'));
  }
  if (_container) {
    _container.hidden = false;
  }
}

/** Hide the Prague PID context panel tab */
export function hidePragueGuide() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gev:close-pid-context'));
  }
  if (_container) {
    _container.hidden = true;
  }
}

/** Toggle visibility of Prague PID context tab */
export function togglePragueGuide() {
  if (isPragueGuideVisible()) {
    hidePragueGuide();
    return false;
  } else {
    showPragueGuide();
    return true;
  }
}

/** Check if Prague PID context tab is visible */
export function isPragueGuideVisible() {
  if (typeof document === 'undefined') return false;
  const panel = document.getElementById('context-pid-view') || _container;
  return Boolean(panel && !panel.hidden && panel.style.display !== 'none');
}

