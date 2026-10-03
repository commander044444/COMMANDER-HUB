/* COMMANDER HUB - Cryptocurrency */
const Crypto = {
  coins: [],
  lastFetch: 0,
  CACHE_MS: 60000,

  async fetchData() {
    const now = Date.now();
    if (AppState.cryptoCache && (now - AppState.cryptoCacheTime) < this.CACHE_MS) {
      this.coins = AppState.cryptoCache;
      return this.coins;
    }
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h');
      if (!res.ok) throw new Error('API error ' + res.status);
      const data = await res.json();
      this.coins = data;
      AppState.cryptoCache = data;
      AppState.cryptoCacheTime = now;
      return data;
    } catch (e) {
      console.error('Crypto fetch error:', e);
      throw e;
    }
  },

  async renderWidget(el) {
    if (!el) return;
    el.innerHTML = `<div class="loading-state">${t('common.loading')}</div>`;
    try {
      await this.fetchData();
      const favs = AppState.favorites.crypto || [];
      const list = this.coins.filter(c => favs.includes(c.id)).slice(0, 5);
      const show = list.length ? list : this.coins.slice(0, 5);
      let html = '<div class="crypto-list">';
      show.forEach(c => {
        const change = c.price_change_percentage_24h || 0;
        html += `
          <div class="crypto-item" onclick="navigateTo('crypto')">
            <div class="crypto-info">
              <img src="${c.image}" alt="" width="24" height="24" style="border-radius:50%" onerror="this.style.display='none'">
              <div>
                <div class="crypto-symbol">${c.symbol.toUpperCase()}</div>
                <div class="crypto-name">${c.name}</div>
              </div>
            </div>
            <div class="crypto-price">
              <div class="crypto-value">$${this.formatPrice(c.current_price)}</div>
              <div class="crypto-change ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</div>
            </div>
          </div>`;
      });
      html += `</div><div class="crypto-updated">${t('crypto.updated')}: ${new Date().toLocaleTimeString()} · ${t('crypto.source')}</div>`;
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = `<div class="error-state">${t('crypto.error')}<br><button class="btn btn-secondary" style="margin-top:0.75rem" onclick="Crypto.refresh()">${t('crypto.retry')}</button></div>`;
    }
  },

  async render(container) {
    container.innerHTML = `
      <div class="view-header">
        <h1>${t('crypto.title')}</h1>
        <div class="view-actions">
          <button class="btn btn-secondary" onclick="Crypto.refresh()">${t('common.refresh')}</button>
        </div>
      </div>
      <div class="card" style="margin-bottom:1rem">
        <input type="search" class="form-control" id="crypto-search" placeholder="${t('crypto.search')}" oninput="Crypto.filterList()">
      </div>
      <div id="crypto-full-list" class="loading-state">${t('common.loading')}</div>`;

    try {
      await this.fetchData();
      this.renderList();
    } catch (e) {
      document.getElementById('crypto-full-list').innerHTML = 
        `<div class="error-state">${t('crypto.error')}<br><button class="btn btn-secondary" style="margin-top:0.75rem" onclick="Crypto.refresh()">${t('crypto.retry')}</button></div>`;
    }
  },

  renderList() {
    const el = document.getElementById('crypto-full-list');
    if (!el) return;
    const q = (document.getElementById('crypto-search')?.value || '').toLowerCase();
    let list = this.coins;
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    
    let html = '<div class="crypto-list">';
    list.forEach(c => {
      const change = c.price_change_percentage_24h || 0;
      const isFav = (AppState.favorites.crypto || []).includes(c.id);
      html += `
        <div class="crypto-item">
          <div class="crypto-info">
            <button class="btn-icon" style="width:28px;height:28px;font-size:0.9rem" onclick="Crypto.toggleFav('${c.id}')">${isFav ? '⭐' : '☆'}</button>
            <img src="${c.image}" alt="" width="28" height="28" style="border-radius:50%" onerror="this.style.display='none'">
            <div>
              <div class="crypto-symbol">${c.symbol.toUpperCase()}</div>
              <div class="crypto-name">${c.name}</div>
            </div>
          </div>
          <div class="crypto-price">
            <div class="crypto-value">$${this.formatPrice(c.current_price)}</div>
            <div class="crypto-change ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</div>
            <div style="font-size:0.7rem;color:var(--text-muted)">MCap: $${this.formatCap(c.market_cap)}</div>
          </div>
        </div>`;
    });
    html += `</div><div class="crypto-updated">${t('crypto.updated')}: ${new Date().toLocaleTimeString()} · ${t('crypto.source')}</div>`;
    el.innerHTML = html;
  },

  filterList() { this.renderList(); },

  toggleFav(id) {
    if (!AppState.favorites.crypto) AppState.favorites.crypto = [];
    const idx = AppState.favorites.crypto.indexOf(id);
    if (idx >= 0) AppState.favorites.crypto.splice(idx, 1);
    else AppState.favorites.crypto.push(id);
    AppState.save();
    this.renderList();
  },

  async refresh() {
    AppState.cryptoCache = null;
    AppState.cryptoCacheTime = 0;
    if (AppState.currentView === 'crypto') this.render(document.getElementById('main-content'));
    else if (AppState.currentView === 'dashboard') renderCurrentView();
  },

  formatPrice(p) {
    if (p >= 1) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return p.toLocaleString('en-US', { maximumFractionDigits: 6 });
  },

  formatCap(c) {
    if (!c) return '—';
    if (c >= 1e12) return (c / 1e12).toFixed(2) + 'T';
    if (c >= 1e9) return (c / 1e9).toFixed(2) + 'B';
    if (c >= 1e6) return (c / 1e6).toFixed(2) + 'M';
    return c.toLocaleString();
  },

  getPrice(id) {
    const c = this.coins.find(x => x.id === id) || (AppState.cryptoCache || []).find(x => x.id === id);
    return c ? c.current_price : null;
  }
};
