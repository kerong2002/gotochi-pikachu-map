/**
 * 日本ご当地ピカチュウマップ - 主程式
 */

const LS_KEY = 'pika-map-collected-v2';
const LS_SEEDED_PREFIX = 'pika-map-seeded-';

// 為每個標記 collected:true 的商品，第一次看到時就匯入 localStorage
// 用 per-id 的旗標，所以日後新增的 collected:true 商品也會被自動加入
function seedCollectedFromData() {
  let saved;
  try {
    saved = new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
  } catch (e) {
    saved = new Set();
  }
  let changed = false;
  PLUSHES.forEach(p => {
    if (!p.collected) return;
    const flagKey = LS_SEEDED_PREFIX + p.id;
    if (localStorage.getItem(flagKey)) return;  // 已經 seed 過這個 ID
    saved.add(p.id);
    localStorage.setItem(flagKey, '1');
    changed = true;
  });
  if (changed) localStorage.setItem(LS_KEY, JSON.stringify([...saved]));
}

const state = {
  activeRegion: 'all',
  activeType: 'all',
  priceMin: 0,
  priceMax: 9999,
  searchTerm: '',
  hideCollected: false,
  markerMode: 'all',   // 'all' | 'collected' | 'uncollected'
  view: 'gallery',     // 'map' | 'gallery' | 'list'
  gallerySort: 'region',
  listSort: { key: 'region', asc: true },
  collected: new Set(),
  activeStoreId: null,
  markers: {},
  mapReady: false
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
   VIEW SWITCHING
   ============================================ */
function switchView(v) {
  state.view = v;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  document.querySelectorAll('.view-pane').forEach(p => p.classList.toggle('active', p.dataset.viewPane === v));
  if (v === 'map') {
    // Defer init/invalidate to next frame so the pane has its layout
    requestAnimationFrame(() => {
      if (!state.mapReady) {
        initMap();
        state.mapReady = true;
      }
      if (map) {
        map.invalidateSize();
        updateMarkerBadges();
      }
    });
  } else if (v === 'gallery') {
    renderGallery();
  } else if (v === 'list') {
    renderList();
  }
}

/* ============================================
   GALLERY VIEW
   ============================================ */
function getRegionMeta(regionId) {
  return REGIONS.find(r => r.id === regionId) || { label: '', color: '#999' };
}
function getTypeColor(type) {
  const t = TYPES.find(tt => tt.id === type);
  return t ? t.color : '#999';
}

function sortPlushes(arr, sortKey) {
  const copy = [...arr];
  copy.sort((a, b) => {
    const sa = STORES.find(s => s.id === a.storeId) || {};
    const sb = STORES.find(s => s.id === b.storeId) || {};
    if (sortKey === 'price-asc') return a.priceJPY - b.priceJPY;
    if (sortKey === 'price-desc') return b.priceJPY - a.priceJPY;
    if (sortKey === 'name') return a.nameZh.localeCompare(b.nameZh, 'zh-Hant');
    if (sortKey === 'store') return (sa.name || '').localeCompare(sb.name || '', 'zh-Hant');
    // default: region (use REGIONS order) then store
    const ai = REGIONS.findIndex(r => r.id === sa.region);
    const bi = REGIONS.findIndex(r => r.id === sb.region);
    if (ai !== bi) return ai - bi;
    return (sa.name || '').localeCompare(sb.name || '', 'zh-Hant');
  });
  return copy;
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  const count = document.getElementById('gallery-count');

  const plushes = sortPlushes(filteredPlushes(), state.gallerySort);
  count.textContent = plushes.length;

  if (plushes.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = plushes.map(p => {
    const store = STORES.find(s => s.id === p.storeId);
    const region = getRegionMeta(store?.region);
    const typeColor = getTypeColor(p.type);
    const isCollected = state.collected.has(p.id);
    return `
      <div class="gallery-card ${isCollected ? 'collected' : ''}" data-plush="${p.id}" data-store="${p.storeId}">
        <div class="gc-img">
          <img src="${p.image}" alt="${p.nameZh}" loading="lazy"
               onerror="this.style.display='none'; this.parentElement.innerHTML='📷';"/>
        </div>
        <div class="gc-body">
          <div class="gc-name">${p.nameZh}</div>
          <div class="gc-price">${p.priceText}</div>
          <div class="gc-tags">
            <span class="gc-tag" style="background:${region.color}22; color:${region.color};">${region.label}</span>
            <span class="gc-tag" style="background:${typeColor}1A; color:${typeColor};">${p.type}</span>
          </div>
          <div class="gc-store">${store ? store.name : ''}</div>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', () => openStoreDetail(card.dataset.store, card.dataset.plush));
  });
}

/* ============================================
   LIST VIEW
   ============================================ */
function renderList() {
  const tbody = document.getElementById('list-tbody');
  const empty = document.getElementById('list-empty');

  let plushes = filteredPlushes();
  // sort
  const { key, asc } = state.listSort;
  plushes = [...plushes].sort((a, b) => {
    const sa = STORES.find(s => s.id === a.storeId) || {};
    const sb = STORES.find(s => s.id === b.storeId) || {};
    let cmp = 0;
    switch (key) {
      case 'name':  cmp = a.nameZh.localeCompare(b.nameZh, 'zh-Hant'); break;
      case 'store': cmp = (sa.name || '').localeCompare(sb.name || '', 'zh-Hant'); break;
      case 'type':  cmp = a.type.localeCompare(b.type, 'zh-Hant'); break;
      case 'price': cmp = a.priceJPY - b.priceJPY; break;
      case 'region': {
        const ai = REGIONS.findIndex(r => r.id === sa.region);
        const bi = REGIONS.findIndex(r => r.id === sb.region);
        cmp = ai - bi;
        if (cmp === 0) cmp = (sa.name || '').localeCompare(sb.name || '', 'zh-Hant');
        break;
      }
    }
    return asc ? cmp : -cmp;
  });

  if (plushes.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = plushes.map(p => {
      const store = STORES.find(s => s.id === p.storeId);
      const region = getRegionMeta(store?.region);
      const typeColor = getTypeColor(p.type);
      const isCollected = state.collected.has(p.id);
      return `
        <tr class="${isCollected ? 'collected' : ''}" data-plush="${p.id}" data-store="${p.storeId}">
          <td>
            <div class="li-img"><img src="${p.image}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='📷';"/></div>
          </td>
          <td>
            <div class="li-name">${p.nameZh}</div>
            <div class="li-name-ja">${p.nameJa}</div>
          </td>
          <td><span class="li-tag" style="background:${region.color}22; color:${region.color};">${region.label}</span></td>
          <td>${store ? store.name : ''}</td>
          <td><span class="li-tag" style="background:${typeColor}1A; color:${typeColor};">${p.type}</span></td>
          <td><span class="li-price">${p.priceText}</span></td>
          <td>
            <button class="li-collect ${isCollected ? 'on' : ''}" data-collect="${p.id}" title="${isCollected ? '已蒐集' : '標記蒐集'}">${isCollected ? '✓' : '＋'}</button>
          </td>
        </tr>
      `;
    }).join('');

    // Row click → open detail; collect button click → toggle
    tbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('.li-collect')) return;
        openStoreDetail(tr.dataset.store, tr.dataset.plush);
      });
    });
    tbody.querySelectorAll('.li-collect').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCollected(btn.dataset.collect);
      });
    });
  }

  // Update header sort indicator
  document.querySelectorAll('.data-list th[data-sort]').forEach(th => {
    const isSorted = th.dataset.sort === key;
    th.classList.toggle('sorted', isSorted);
    th.classList.toggle('asc', isSorted && asc);
  });
}

/* ============================================
   RE-RENDER ALL VIEWS WHEN FILTERS CHANGE
   ============================================ */
function rerenderActiveView() {
  if (state.view === 'gallery') renderGallery();
  else if (state.view === 'list') renderList();
}
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
    // markerMode is now a global filter: 'collected' = only collected, 'uncollected' = only not, 'all' = both
    if (state.markerMode === 'collected' && !state.collected.has(p.id)) return false;
    if (state.markerMode === 'uncollected' && state.collected.has(p.id)) return false;
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

// Compute marker badge count based on markerMode
function badgeCountForStore(storeId) {
  const all = PLUSHES.filter(p => p.storeId === storeId);
  if (state.markerMode === 'collected') {
    return all.filter(p => state.collected.has(p.id)).length;
  }
  if (state.markerMode === 'uncollected') {
    return all.filter(p => !state.collected.has(p.id)).length;
  }
  return all.length;
}

// Update marker badges (numbers + colors) without rebuilding markers
function updateMarkerBadges() {
  if (!state.mapReady) return;
  STORES.forEach(store => {
    const marker = state.markers[store.id];
    if (!marker) return;
    const el = marker.getElement();
    if (!el) return;
    const badge = el.querySelector('.count-badge');
    if (!badge) return;
    const n = badgeCountForStore(store.id);
    badge.textContent = n;
    badge.classList.toggle('badge-zero', n === 0);
    badge.classList.toggle('badge-collected', state.markerMode === 'collected' && n > 0);
    badge.classList.toggle('badge-uncollected', state.markerMode === 'uncollected' && n > 0);
  });
}

function updateMapMarkers() {
  if (!state.mapReady) return;
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
function openStoreDetail(storeId, highlightPlushId) {
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
    body.innerHTML = sectionTitle + plushes.map(p => plushCardHTML(p, p.id === highlightPlushId)).join('');
  }

  document.getElementById('detail-panel').classList.add('open');

  if (state.view === 'map' && map) {
    map.setView([store.lat, store.lng], Math.max(map.getZoom(), 8), { animate: true });
    map.closePopup();
  }

  // Scroll highlighted plush into view inside the panel
  if (highlightPlushId) {
    setTimeout(() => {
      const target = body.querySelector(`[data-plush="${highlightPlushId}"]`);
      if (target) {
        body.scrollTo({ top: target.offsetTop - 16, behavior: 'smooth' });
      }
    }, 50);
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

function plushCardHTML(p, highlight) {
  const isCollected = state.collected.has(p.id);
  const typeMeta = TYPES.find(t => t.id === p.type);
  const typeColor = typeMeta ? typeMeta.color : '#999';

  return `
    <div class="plush-card ${isCollected ? 'collected' : ''} ${highlight ? 'highlight' : ''}" data-plush="${p.id}">
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
  updateMarkerBadges();
  rerenderActiveView();
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
      if (window.__renderLegend) window.__renderLegend();
      updateMapMarkers();
      updateStats();
      rerenderActiveView();
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
      rerenderActiveView();
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
  // Marker badge mode
  const modeRow = document.getElementById('marker-mode-row');
  const modes = [
    { id: 'all',          label: '全部' },
    { id: 'uncollected',  label: '未蒐集' },
    { id: 'collected',    label: '已蒐集' }
  ];
  const renderModes = () => {
    modeRow.innerHTML = modes.map(m => `
      <button class="mode-chip ${m.id === state.markerMode ? 'active' : ''}" data-mode="${m.id}">${m.label}</button>
    `).join('');
    modeRow.querySelectorAll('.mode-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        state.markerMode = btn.dataset.mode;
        renderModes();
        updateMapMarkers();
        updateMarkerBadges();
        updateStats();
        rerenderActiveView();
      });
    });
  };
  renderModes();
  const search = document.getElementById('search-input');
  search.addEventListener('input', e => {
    state.searchTerm = e.target.value;
    updateMapMarkers();
    updateStats();
    rerenderActiveView();
  });

  const pMin = document.getElementById('price-min');
  const pMax = document.getElementById('price-max');
  const apply = () => {
    state.priceMin = parseInt(pMin.value, 10) || 0;
    state.priceMax = parseInt(pMax.value, 10) || 9999;
    updateMapMarkers();
    updateStats();
    rerenderActiveView();
  };
  pMin.addEventListener('input', apply);
  pMax.addEventListener('input', apply);

  const sw = document.getElementById('hide-collected-switch');
  sw.addEventListener('click', () => {
    state.hideCollected = !state.hideCollected;
    sw.classList.toggle('on', state.hideCollected);
    updateMapMarkers();
    updateStats();
    rerenderActiveView();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    state.activeRegion = 'all';
    state.activeType = 'all';
    state.markerMode = 'all';
    state.priceMin = 0;
    state.priceMax = 9999;
    state.searchTerm = '';
    state.hideCollected = false;
    search.value = '';
    pMin.value = '';
    pMax.value = '';
    sw.classList.remove('on');
    renderRegions();
    if (window.__renderLegend) window.__renderLegend();
    renderTypes();
    renderModes();
    updateMapMarkers();
    updateMarkerBadges();
    updateStats();
    rerenderActiveView();
  });

  // View switcher
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Gallery sort
  const gallerySort = document.getElementById('gallery-sort');
  if (gallerySort) {
    gallerySort.value = state.gallerySort;
    gallerySort.addEventListener('change', e => {
      state.gallerySort = e.target.value;
      renderGallery();
    });
  }

  // List sort by clicking headers
  document.querySelectorAll('.data-list th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (state.listSort.key === key) {
        state.listSort.asc = !state.listSort.asc;
      } else {
        state.listSort.key = key;
        state.listSort.asc = true;
      }
      renderList();
    });
  });

  document.getElementById('detail-close').addEventListener('click', closeDetail);
}

/* ============================================
   BOOT
   ============================================ */
window.addEventListener('DOMContentLoaded', () => {
  loadCollected();
  renderRegions();
  renderTypes();
  setupSidebar();
  updateStats();
  // Render the default view (gallery). Map is lazy-init on first switch.
  if (state.view === 'gallery') renderGallery();
  else if (state.view === 'list') renderList();
  else { initMap(); state.mapReady = true; updateMarkerBadges(); }
});

window.openStoreDetail = openStoreDetail;
window.toggleCollected = toggleCollected;
