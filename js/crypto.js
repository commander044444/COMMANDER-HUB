/* COMMANDER HUB - Cryptocurrency (دلار + تومان) */
const Crypto = {
  coins: [],
  lastFetch: 0,
  CACHE_MS: 60000,
  tomanRate: 77600, // نرخ تقریبی تومان به ازای هر دلار (به‌روز می‌شود)
  rateUpdated: 0,

  // ایموجی به‌جای تصویر خارجی (برای ایران که CDN ممکن است بلاک باشد)
  coinEmoji: {
    bitcoin: '₿', ethereum: 'Ξ', tether: '₮', binancecoin: '🟡',
    solana: '◎', ripple: '✕', cardano: '₳', dogecoin: 'Ð',
    tron: '🔴', 'usd-coin': '💵', staked-ether: 'Ξ', 'the-open-network': '💎',
    avalanche-2: '🔺', chainlink: '🔗', polkadot: '●', shiba-inu: '🐕',
    litecoin: 'Ł', bitcoin-cash: '₿', uniswap: '🦄', stellar: '✦'
  },

  async fetchTomanRate() {
    if (Date.now() - this.rateUpdated < 3600000 && this.tomanRate > 0) return this.tomanRate;
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('rate');
      const data = await res.json();
      // IRR ریال است؛ تومان = ریال / ۱۰
      if (data.rates && data.rates.IRR) {
        this.tomanRate = Math.round(data.rates.IRR / 10);
        this.rateUpdated = Date.now();
      }
    } catch (e) {
      console.warn('نرخ تومان دریافت نشد، از مقدار ذخیره‌شده استفاده می‌شود');
    }
    return this.tomanRate;
  },

  async fetchData() {
    const now = Date.now();
    if (AppState.cryptoCache && (now - AppState.cryptoCacheTime) < this.CACHE_MS) {
      this.coins = AppState.cryptoCache;
      return this.coins;
    }
    try {
      await this.fetchTomanRate();
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

  toToman(usd) {
    if (!usd && usd !== 0) return '—';
    const t = usd * this.tomanRate;
    if (t >= 1e12) return (t / 1e12).toFixed(2) + ' تریلیون';
    if (t >= 1e9) return (t / 1e9).toFixed(2) + ' میلیارد';
    if (t >= 1e6) return (t / 1e6).toFixed(1) + ' میلیون';
    if (t >= 1000) return Math.round(t).toLocaleString('fa-IR');
    return t.toFixed(0);
  },

  getEmoji(coin) {
    return this.coinEmoji[coin.id] || coin.symbol?.charAt(0)?.toUpperCase() || '●';
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
              <span style="font-size:1.4rem;width:28px;text-align:center">${this.getEmoji(c)}</span>
              <div>
                <div class="crypto-symbol">${c.symbol.toUpperCase()}</div>
                <div class="crypto-name">${this.faName(c)}</div>
              </div>
            </div>
            <div class="crypto-price">
              <div class="crypto-value">$${this.formatPrice(c.current_price)}</div>
              <div style="font-size:0.75rem;color:var(--text-secondary)">${this.toToman(c.current_price)} تومان</div>
              <div class="crypto-change ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</div>
            </div>
          </div>`;
      });
      html += `</div><div class="crypto-updated">${t('crypto.updated')}: ${new Date().toLocaleTimeString('fa-IR')} · نرخ: ۱$ ≈ ${this.tomanRate.toLocaleString('fa-IR')} تومان · ${t('crypto.source')}</div>`;
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
        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem" id="rate-info"></div>
      </div>
      <div id="crypto-full-list" class="loading-state">${t('common.loading')}</div>`;

    try {
      await this.fetchData();
      const rateEl = document.getElementById('rate-info');
      if (rateEl) rateEl.textContent = `نرخ تبدیل: ۱ دلار ≈ ${this.tomanRate.toLocaleString('fa-IR')} تومان`;
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
    if (q) list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q) ||
      this.faName(c).includes(q)
    );

    let html = '<div class="crypto-list">';
    list.forEach(c => {
      const change = c.price_change_percentage_24h || 0;
      const isFav = (AppState.favorites.crypto || []).includes(c.id);
      html += `
        <div class="crypto-item">
          <div class="crypto-info">
            <button class="btn-icon" style="width:28px;height:28px;font-size:0.9rem" onclick="Crypto.toggleFav('${c.id}')">${isFav ? '⭐' : '☆'}</button>
            <span style="font-size:1.5rem;width:32px;text-align:center">${this.getEmoji(c)}</span>
            <div>
              <div class="crypto-symbol">${c.symbol.toUpperCase()}</div>
              <div class="crypto-name">${this.faName(c)}</div>
            </div>
          </div>
          <div class="crypto-price">
            <div class="crypto-value">$${this.formatPrice(c.current_price)}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary)">${this.toToman(c.current_price)} تومان</div>
            <div class="crypto-change ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</div>
            <div style="font-size:0.7rem;color:var(--text-muted)">ارزش بازار: $${this.formatCap(c.market_cap)}</div>
          </div>
        </div>`;
    });
    html += `</div><div class="crypto-updated">${t('crypto.updated')}: ${new Date().toLocaleTimeString('fa-IR')} · منبع: CoinGecko</div>`;
    el.innerHTML = html;
  },

  faName(c) {
    const map = {
      bitcoin: 'بیت‌کوین', ethereum: 'اتریوم', tether: 'تتر', binancecoin: 'بایننس‌کوین',
      solana: 'سولانا', ripple: 'ریپل', cardano: 'کاردانو', dogecoin: 'دوج‌کوین',
      tron: 'ترون', 'usd-coin': 'یو‌اس‌دی‌کوین', 'the-open-network': 'تون‌کوین',
      avalanche-2: 'اولانچ', chainlink: 'چین‌لینک', polkadot: 'پولکادات',
      'shiba-inu': 'شیبا', litecoin: 'لایت‌کوین', uniswap: 'یونی‌سواپ', stellar: 'استلار'
    };
    return map[c.id] || c.name;
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
    this.rateUpdated = 0;
    if (AppState.currentView === 'crypto') this.render(document.getElementById('main-content'));
    else if (AppState.currentView === 'dashboard') renderCurrentView();
  },

  formatPrice(p) {
    if (p == null) return '—';
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
