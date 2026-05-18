/**
 * 日本ご当地ピカチュウマップ - 主程式
 */

const LS_KEY = 'pika-map-collected-v2';
const LS_SEEDED_KEY = 'pika-map-seeded-v2';

// 首次載入時，把 CSV 內已標記為「收服」的商品自動寫入 localStorage
function seedCollectedFromData() {
  if (localStorage.getItem(LS_SEEDED_KEY)) return null;
  const preset = PLUSHES.filter(p => p.collected).map(p => p.id);
  if (preset.length > 0 && !localStorage.getItem(LS_KEY)) {
    localStorage.setItem(LS_KEY, JSON.stringify(preset));
  }
  localStorage.setItem(LS_SEEDED_KEY, '1');
  return preset;
}

const state = {
  activeRegion: 'all',
  activeType: 'all',
  priceMin: 0,
  priceMax: 9999,
  searchTerm: '',
  hideCollected: false,
  collected: new Set(),
  activeStoreId: null,
  markers: {}
};

function loadCollected() {
  seedCollectedFromData();
  try {
    state.collected = new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
  } catch (e) {
    state.collected = new Set();
  }
}

function saveCollected() {
  localStorage.setItem(LS_KEY, JSON.stringify([...state.collected]));
}

/* ============================================
   MAP MARKER SVG
   ============================================ */
function buildMarkerSVG(color) {
  return `
    <svg viewBox="0 0 44 50" class="pin-body" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2 C10 2 2 11 2 22 C2 33 22 48 22 48 C22 48 42 33 42 22 C42 11 34 2 22 2 Z"
            fill="${color}" stroke="#1A1A2E" stroke-width="2"/>
      <circle cx="22" cy="20" r="11" fill="#fff"/>
      <ellipse cx="22" cy="20" rx="9" ry="8" fill="#FFCB05" stroke="#1A1A2E" stroke-width="1.2"/>
      <path d="M14,14 L11,7 L17,11 Z" fill="#FFCB05" stroke="#1A1A2E" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M11,7 L13,4 L14,8 Z" fill="#1A1A2E"/>
      <path d="M30,14 L33,7 L27,11 Z" fill="#FFCB05" stroke="#1A1A2E" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M33,7 L31,4 L30,8 Z" fill="#1A1A2E"/>
      <circle cx="16" cy="22" r="1.8" fill="#FF4D4D"/>
      <circle cx="28" cy="22" r="1.8" fill="#FF4D4D"/>
      <circle cx="19" cy="18" r="1.3" fill="#1A1A2E"/>
      <circle cx="25" cy="18" r="1.3" fill="#1A1A2E"/>
    </svg>
  `;
}

/* ============================================
   FILTER LOGIC
   ============================================ */
function filteredPlushes() {
  const term = state.searchTerm.trim().toLowerCase();
  return PLUSHES.filter(p => {
    const store = STORES.find(s => s.id === p.storeId);
    if (!store) return false;
    if (state.activeRegion !== 'all' && store.region !== state.activeRegion) return false;
    if (state.activeType !== 'all' && p.type !== state.activeType) return false;
    if (p.priceJPY < state.priceMin || p.priceJPY > state.priceMax) return false;
    if (state.hideCollected && state.collected.has(p.id)) return false;
    if (term) {
      const hay = (p.nameJa + ' ' + p.nameZh + ' ' + store.name + ' ' + (store.nameJa || '')).toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });
}

function storesWithMatches() {
  const matched = new Set(filteredPlushes().map(p => p.storeId));
  return STORES.filter(s => matched.has(s.id));
}

/* ============================================
   MAP SETUP
   ============================================ */
let map;
function initMap() {
  map = L.map('map', {
    center: [36.0, 137.0],
    zoom: 5,
    minZoom: 3,
    maxZoom: 16,
    zoomControl: true,
    attributionControl: true,
    worldCopyJump: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  STORES.forEach(store => {
    const region = REGIONS.find(r => r.id === store.region);
    const color = region ? region.color : '#FFCB05';
    const plushCount = PLUSHES.filter(p => p.storeId === store.id).length;

    const iconHtml = `
      <div class="pika-marker" data-store="${store.id}">
        ${buildMarkerSVG(color)}
        <div class="count-badge">${plushCount}</div>
      </div>
    `;
    const icon = L.divIcon({
      html: iconHtml,
      className: 'pika-marker-wrap',
      iconSize: [44, 50],
      iconAnchor: [22, 48],
      popupAnchor: [0, -42]
    });

    const marker = L.marker([store.lat, store.lng], { icon }).addTo(map);

    // Tooltip on hover (desktop) - shows brief info without click
    marker.bindTooltip(`
      <div class="hover-tip">
        <div class="tip-name">${store.name}</div>
        <div class="tip-meta">${region ? region.label : ''} · ${plushCount} 款限定</div>
      </div>
    `, { direction: 'top', offset: [0, -42], opacity: 1, className: 'pika-tooltip' });

    // Click → open detail panel directly
    marker.on('click', () => openStoreDetail(store.id));

    state.markers[store.id] = marker;
  });
}

function updateMapMarkers() {
  const visibleStoreIds = new Set(storesWithMatches().map(s => s.id));
  Object.entries(state.markers).forEach(([storeId, marker]) => {
    const el = marker.getElement();
    if (!el) return;
    const pin = el.querySelector('.pika-marker');
    if (!pin) return;
    if (visibleStoreIds.has(storeId)) {
      pin.classList.remove('dim');
    } else {
      pin.classList.add('dim');
    }
  });
}

/* ============================================
   DETAIL PANEL
   ============================================ */
function openStoreDetail(storeId) {
  const store = STORES.find(s => s.id === storeId);
  if (!store) return;
  state.activeStoreId = storeId;
  const region = REGIONS.find(r => r.id === store.region);

  const plushes = PLUSHES.filter(p => p.storeId === storeId);

  document.getElementById('detail-region').textContent = region ? region.label : '';
  document.getElementById('detail-region').style.background = region ? region.color : '#FFCB05';
  document.getElementById('detail-region').style.color = isLight(region?.color) ? '#1A1A2E' : '#fff';
  document.getElementById('detail-name-ja').textContent = store.nameJa || '';
  document.getElementById('detail-name-zh').textContent = store.name;
  document.getElementById('detail-address').textContent = store.address;
  document.getElementById('detail-gmaps').href = store.gmaps;

  const body = document.getElementById('detail-body');
  if (plushes.length === 0) {
    body.innerHTML = '<div class="empty"><div class="ico">📦</div><div class="msg">這個店鋪暫無紀錄的限定皮卡丘</div></div>';
  } else {
    const collectedCount = plushes.filter(p => state.collected.has(p.id)).length;
    const sectionTitle = `<div class="section-title">
      <span>限定皮卡丘 · ${plushes.length} 款</span>
      <span class="collected-badge">已蒐集 ${collectedCount}/${plushes.length}</span>
    </div>`;
    body.innerHTML = sectionTitle + plushes.map(p => plushCardHTML(p)).join('');
  }

  document.getElementById('detail-panel').classList.add('open');

  if (map) {
    map.setView([store.lat, store.lng], Math.max(map.getZoom(), 8), { animate: true });
  }
}

function isLight(hex) {
  if (!hex) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function closeDetail() {
  document.getElementById('detail-panel').classList.remove('open');
  state.activeStoreId = null;
}

function plushCardHTML(p) {
  const isCollected = state.collected.has(p.id);
  const typeMeta = TYPES.find(t => t.id === p.type);
  const typeColor = typeMeta ? typeMeta.color : '#999';

  return `
    <div class="plush-card ${isCollected ? 'collected' : ''}" data-plush="${p.id}">
      <div class="plush-img">
        <img src="${p.image}" alt="${p.nameZh}" loading="lazy"
             onerror="this.style.display='none'; this.parentElement.classList.add('no-img');"/>
        <div class="img-fallback">📷</div>
      </div>
      <div class="plush-info">
        <div class="nzh">${p.nameZh}</div>
        <div class="nja">${p.nameJa}</div>
        <div class="meta-row">
          <span class="type-tag" style="background:${typeColor}1A; color:${typeColor};">${p.type}</span>
          <span class="currency-tag">${p.currency}</span>
        </div>
        <div class="price-tag">${p.priceText}</div>
        <button class="collect-btn ${isCollected ? 'is-collected' : ''}" onclick="window.toggleCollected('${p.id}')">
          ${isCollected ? '✓ 已蒐集' : '＋ 標記蒐集'}
        </button>
      </div>
    </div>
  `;
}

function toggleCollected(plushId) {
  if (state.collected.has(plushId)) {
    state.collected.delete(plushId);
  } else {
    state.collected.add(plushId);
  }
  saveCollected();
  updateStats();
  if (state.activeStoreId) openStoreDetail(state.activeStoreId);
  if (state.hideCollected) updateMapMarkers();
}

/* ============================================
   SIDEBAR + STATS
   ============================================ */
function renderRegions() {
  const grid = document.getElementById('region-grid');
  grid.innerHTML = REGIONS.map(r => {
    const count = r.id === 'all'
      ? PLUSHES.length
      : PLUSHES.filter(p => {
          const s = STORES.find(st => st.id === p.storeId);
          return s && s.region === r.id;
        }).length;
    return `
      <button class="region-chip ${r.id === state.activeRegion ? 'active' : ''}" data-region="${r.id}">
        <span class="dot" style="background:${r.color}"></span>
        <span class="lbl">${r.label}</span>
        <span class="cnt">${count}</span>
      </button>
    `;
  }).join('');
  grid.querySelectorAll('.region-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeRegion = btn.dataset.region;
      renderRegions();
      updateMapMarkers();
      updateStats();
    });
  });
}

function renderTypes() {
  const wrap = document.getElementById('type-row');
  wrap.innerHTML = TYPES.map(t => `
    <button class="type-chip ${t.id === state.activeType ? 'active' : ''}" data-type="${t.id}" style="--c:${t.color}">
      ${t.label}
    </button>
  `).join('');
  wrap.querySelectorAll('.type-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeType = btn.dataset.type;
      renderTypes();
      updateMapMarkers();
      updateStats();
    });
  });
}

function updateStats() {
  const matched = filteredPlushes().length;
  const all = PLUSHES.length;
  const collected = state.collected.size;
  document.getElementById('stat-total').textContent = matched;
  document.getElementById('stat-collected').textContent = `${collected}/${all}`;
  const pct = all > 0 ? (collected / all) * 100 : 0;
  document.getElementById('progress-fill').style.width = `${pct}%`;
}

function setupSidebar() {
  const search = document.getElementById('search-input');
  search.addEventListener('input', e => {
    state.searchTerm = e.target.value;
    updateMapMarkers();
    updateStats();
  });

  const pMin = document.getElementById('price-min');
  const pMax = document.getElementById('price-max');
  const apply = () => {
    state.priceMin = parseInt(pMin.value, 10) || 0;
    state.priceMax = parseInt(pMax.value, 10) || 9999;
    updateMapMarkers();
    updateStats();
  };
  pMin.addEventListener('input', apply);
  pMax.addEventListener('input', apply);

  const sw = document.getElementById('hide-collected-switch');
  sw.addEventListener('click', () => {
    state.hideCollected = !state.hideCollected;
    sw.classList.toggle('on', state.hideCollected);
    updateMapMarkers();
    updateStats();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    state.activeRegion = 'all';
    state.activeType = 'all';
    state.priceMin = 0;
    state.priceMax = 9999;
    state.searchTerm = '';
    state.hideCollected = false;
    search.value = '';
    pMin.value = '';
    pMax.value = '';
    sw.classList.remove('on');
    renderRegions();
    renderTypes();
    updateMapMarkers();
    updateStats();
  });

  document.getElementById('detail-close').addEventListener('click', closeDetail);
}

/* ============================================
   BOOT
   ============================================ */
window.addEventListener('DOMContentLoaded', () => {
  loadCollected();
  initMap();
  renderRegions();
  renderTypes();
  setupSidebar();
  updateStats();
});

window.openStoreDetail = openStoreDetail;
window.toggleCollected = toggleCollected;
