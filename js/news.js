/* اخبار ایرانی — پیش‌نمایش تکی، بدون لود همزمان همه عکس‌ها */
const News = {
  articles: [],
  lastFetch: 0,
  sourceName: '',
  loading: false,

  feeds: [
    { url: 'https://www.isna.ir/rss', name: 'ایسنا' },
    { url: 'https://www.irna.ir/rss', name: 'ایرنا' },
    { url: 'https://www.khabaronline.ir/rss', name: 'خبرآنلاین' },
    { url: 'https://www.yjc.ir/fa/rss/allnews', name: 'باشگاه خبرنگاران' }
  ],

  async fetchText(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms || 8000);
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
      if (i >= 12) return;
      const title = (item.querySelector('title')?.textContent || '').trim();
      const link = (item.querySelector('link')?.textContent || item.querySelector('guid')?.textContent || '').trim();
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      let desc = item.querySelector('description')?.textContent || '';
      desc = desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
      const enc = item.querySelector('enclosure');
      const media = item.querySelector('media\\:content, content');
      const img = enc?.getAttribute('url') || media?.getAttribute('url') || '';
      if (title) list.push({ title, link, pubDate, source, desc, img });
    });
    return list;
  },

  async fetchData() {
    if (this.articles.length && Date.now() - this.lastFetch < 180000) return this.articles;
    if (this.loading) return this.articles;
    this.loading = true;
    const proxies = [
      (u) => 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(u),
      (u) => 'https://corsproxy.io/?' + encodeURIComponent(u)
    ];
    try {
      for (const feed of this.feeds) {
        for (const make of proxies) {
          try {
            const url = make(feed.url);
            const text = await this.fetchText(url, 7000);
            if (text.trim().startsWith('{')) {
              const json = JSON.parse(text);
              const items = json.items || json.feed?.items || [];
              if (items.length) {
                this.articles = items.slice(0, 12).map(it => ({
                  title: it.title || '',
                  link: it.link || it.guid || '',
                  pubDate: it.pubDate || '',
                  source: feed.name,
                  desc: String(it.description || it.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180),
                  img: (it.enclosure && it.enclosure.link) || it.thumbnail || ''
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
          } catch (e) { /* next proxy/feed */ }
        }
      }
      throw new Error('no news');
    } finally {
      this.loading = false;
    }
  },

  card(a, withImg) {
    const img = (withImg && a.img)
      ? `<img class="news-thumb" alt="" loading="lazy" decoding="async" width="72" height="54" src="${escapeAttr(a.img)}" onerror="this.remove()">`
      : '';
    return `<article class="news-item news-preview">
      ${img}
      <div>
        <div class="news-title">${escapeHtml(a.title)}</div>
        <div class="news-meta"><span>${escapeHtml(a.source || this.sourceName)}</span>
          <span>${a.pubDate ? new Date(a.pubDate).toLocaleString('fa-IR') : 'آخرین خبر'}</span></div>
        ${a.desc ? `<p class="news-desc">${escapeHtml(a.desc)}</p>` : ''}
        <a class="btn btn-text" href="${escapeAttr(a.link || '#')}" target="_blank" rel="noopener">مشاهده بیشتر</a>
      </div>
    </article>`;
  },

  async renderWidget(el) {
    if (!el) return;
    el.innerHTML = `<div class="loading-state">${t('common.loading')}</div>`;
    try {
      await this.fetchData();
      const first = this.articles.slice(0, 3);
      el.innerHTML = `<div class="news-list">${first.map((a, i) => this.card(a, i === 0)).join('')}</div>
        <button class="btn btn-text" onclick="navigateTo('news')">مشاهده بیشتر</button>`;
    } catch (e) {
      el.innerHTML = `<div class="error-state">${t('news.error')}<br>
        <button class="btn btn-secondary" style="margin-top:0.5rem" onclick="News.refresh()">${t('common.retry')}</button></div>`;
    }
  },

  async render(container) {
    container.innerHTML = `
      <div class="view-header">
        <h1>${t('news.title')}</h1>
        <div class="view-actions">
          <button class="btn btn-secondary" onclick="News.refresh()">${t('news.refresh')}</button>
        </div>
      </div>
      <div id="news-full" class="loading-state">${t('common.loading')}</div>`;
    try {
      await this.fetchData();
      const box = document.getElementById('news-full');
      if (!box) return;
      box.innerHTML = `<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem">منبع ایرانی: ${escapeHtml(this.sourceName)} · ${new Date().toLocaleString('fa-IR')}</p><div class="news-list" id="news-seq"></div>`;
      const list = document.getElementById('news-seq');
      for (let i = 0; i < this.articles.length; i++) {
        const wrap = document.createElement('div');
        wrap.innerHTML = this.card(this.articles[i], true);
        list.appendChild(wrap.firstElementChild);
        await new Promise(r => setTimeout(r, 80));
      }
    } catch (e) {
      const box = document.getElementById('news-full');
      if (box) box.innerHTML = `<div class="error-state">${t('news.error')}<br>
        <button class="btn btn-secondary" style="margin-top:0.75rem" onclick="News.refresh()">${t('common.retry')}</button></div>`;
    }
  },

  async refresh() {
    this.articles = [];
    this.lastFetch = 0;
    if (AppState.currentView === 'news') this.render(document.getElementById('main-content'));
    else if (AppState.currentView === 'dashboard') renderCurrentView();
  }
};
