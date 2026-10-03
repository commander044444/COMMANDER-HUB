/* اخبار ایرانی — متن اول، بدون عکس سنگین، تازه‌سازی خودکار */
const News = {
  articles: [],
  lastFetch: 0,
  sourceName: '',
  loading: false,
  _timer: null,

  feeds: [
    { url: 'https://www.isna.ir/rss', name: 'ایسنا' },
    { url: 'https://www.irna.ir/rss', name: 'ایرنا' },
    { url: 'https://www.khabaronline.ir/rss', name: 'خبرآنلاین' },
    { url: 'https://www.yjc.ir/fa/rss/allnews', name: 'باشگاه خبرنگاران' }
  ],

  async fetchText(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms || 5000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  },

  parseRss(xmlText, source) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    if (xml.querySelector('parsererror')) return [];
    const items = xml.querySelectorAll('item');
    const list = [];
    items.forEach((item, i) => {
      if (i >= 10) return;
      const title = (item.querySelector('title')?.textContent || '').trim();
      const link = (item.querySelector('link')?.textContent || item.querySelector('guid')?.textContent || '').trim();
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      let desc = item.querySelector('description')?.textContent || '';
      desc = desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
      if (title) list.push({ title, link, pubDate, source, desc, img: '' });
    });
    return list;
  },

  async fetchData(force) {
    if (!force && this.articles.length && Date.now() - this.lastFetch < 300000) {
      return this.articles;
    }
    if (this.loading) {
      // صبر کوتاه برای اتمام درخواست قبلی
      await new Promise(r => setTimeout(r, 400));
      if (this.articles.length) return this.articles;
    }
    this.loading = true;
    const proxies = [
      (u) => 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(u) + '&count=10',
      (u) => 'https://corsproxy.io/?' + encodeURIComponent(u)
    ];
    try {
      for (const feed of this.feeds) {
        for (const make of proxies) {
          try {
            const text = await this.fetchText(make(feed.url), 5000);
            if (text.trim().startsWith('{')) {
              const json = JSON.parse(text);
              const items = json.items || [];
              if (items.length) {
                this.articles = items.slice(0, 10).map(it => ({
                  title: it.title || '',
                  link: it.link || it.guid || '',
                  pubDate: it.pubDate || '',
                  source: feed.name,
                  desc: String(it.description || it.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140),
                  img: ''
                })).filter(a => a.title);
                this.sourceName = feed.name;
                this.lastFetch = Date.now();
                return this.articles;
              }
            }
            const list = this.parseRss(text, feed.name);
            if (list.length) {
              this.articles = list;
              this.sourceName = feed.name;
              this.lastFetch = Date.now();
              return this.articles;
            }
          } catch (e) { /* next */ }
        }
      }
      if (this.articles.length) return this.articles; // نگه داشتن قبلی
      throw new Error('no news');
    } finally {
      this.loading = false;
    }
  },

  card(a) {
    return `<article class="news-item news-preview">
      <div>
        <div class="news-title">${escapeHtml(a.title)}</div>
        <div class="news-meta"><span>${escapeHtml(a.source || this.sourceName)}</span>
          <span>${a.pubDate ? new Date(a.pubDate).toLocaleString('fa-IR') : ''}</span></div>
        ${a.desc ? `<p class="news-desc">${escapeHtml(a.desc)}</p>` : ''}
        <a class="btn btn-text" href="${escapeAttr(a.link || '#')}" target="_blank" rel="noopener">مشاهده بیشتر</a>
      </div>
    </article>`;
  },

  async renderWidget(el, soft) {
    if (!el) return;
    const had = this.articles && this.articles.length;
    if (!soft || !had) {
      el.innerHTML = `<div class="loading-state">${t('common.loading')}</div>`;
    }
    try {
      await this.fetchData(!!soft && had ? false : false);
      const first = this.articles.slice(0, 3);
      if (!first.length) throw new Error('empty');
      el.innerHTML = `<div class="news-list">${first.map(a => this.card(a)).join('')}</div>
        <div class="news-meta" style="margin-top:0.4rem">${escapeHtml(this.sourceName)} · ${new Date(this.lastFetch).toLocaleTimeString('fa-IR')}</div>
        <button class="btn btn-text" onclick="navigateTo('news')">مشاهده بیشتر</button>`;
      this.ensureLive();
    } catch (e) {
      el.innerHTML = `<div class="error-state">${t('news.error')}<br>
        <button class="btn btn-secondary" style="margin-top:0.5rem" onclick="News.refresh(true)">${t('common.retry')}</button></div>`;
    }
  },

  async render(container) {
    container.innerHTML = `
      <div class="view-header">
        <h1>${t('news.title')}</h1>
        <div class="view-actions">
          <button class="btn btn-secondary" onclick="News.refresh(true)">${t('news.refresh')}</button>
        </div>
      </div>
      <div id="news-full" class="loading-state">${t('common.loading')}</div>`;
    try {
      await this.fetchData(false);
      const box = document.getElementById('news-full');
      if (!box) return;
      if (!this.articles.length) throw new Error('empty');
      box.innerHTML = `<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem">منبع: ${escapeHtml(this.sourceName)} · به‌روز: ${new Date(this.lastFetch).toLocaleString('fa-IR')}</p>
        <div class="news-list">${this.articles.map(a => this.card(a)).join('')}</div>`;
      this.ensureLive();
    } catch (e) {
      const box = document.getElementById('news-full');
      if (box) box.innerHTML = `<div class="error-state">${t('news.error')}<br>
        <button class="btn btn-secondary" style="margin-top:0.75rem" onclick="News.refresh(true)">${t('common.retry')}</button></div>`;
    }
  },

  ensureLive() {
    if (this._timer) return;
    // پس‌زمینه؛ بدون اسپینر — هر ۱۰ دقیقه
    this._timer = setInterval(() => {
      if (document.hidden) return;
      this.softRefresh();
    }, 600000);
  },

  async softRefresh() {
    try {
      await this.fetchData(true);
      const host = document.getElementById('news-widget-content');
      if (host && this.articles.length) {
        this.renderWidget(host, true);
      } else if (AppState.currentView === 'news') {
        const box = document.getElementById('news-full');
        if (box && this.articles.length) {
          box.innerHTML = `<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem">منبع: ${escapeHtml(this.sourceName)} · به‌روز: ${new Date(this.lastFetch).toLocaleString('fa-IR')}</p>
            <div class="news-list">${this.articles.map(a => this.card(a)).join('')}</div>`;
        }
      }
    } catch (e) { /* quiet */ }
  },

  async refresh(force) {
    if (force) this.lastFetch = 0;
    if (AppState.currentView === 'news') this.render(document.getElementById('main-content'));
    else if (AppState.currentView === 'dashboard') {
      const host = document.getElementById('news-widget-content');
      if (host) this.renderWidget(host, !force && !!(this.articles && this.articles.length));
      else renderCurrentView();
    }
  }
};
