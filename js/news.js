/* اخبار ایرانی — چند منبع/دسته، ادغام، عکس، تازه‌سازی لحظه‌ای‌تر */
const News = {
  articles: [],
  lastFetch: 0,
  sourceName: '',
  loading: false,
  _timer: null,
  _seen: new Set(),
  category: 'all',

  feeds: [
    { url: 'https://www.isna.ir/rss', name: 'ایسنا', cat: 'عمومی' },
    { url: 'https://www.isna.ir/rss/tp/5', name: 'ایسنا سیاست', cat: 'سیاست' },
    { url: 'https://www.isna.ir/rss/tp/14', name: 'ایسنا اقتصاد', cat: 'اقتصاد' },
    { url: 'https://www.isna.ir/rss/tp/2', name: 'ایسنا ورزش', cat: 'ورزش' },
    { url: 'https://www.irna.ir/rss', name: 'ایرنا', cat: 'عمومی' },
    { url: 'https://www.irna.ir/rss/tp/4', name: 'ایرنا اقتصاد', cat: 'اقتصاد' },
    { url: 'https://www.irna.ir/rss/tp/5', name: 'ایرنا ورزش', cat: 'ورزش' },
    { url: 'https://www.khabaronline.ir/rss', name: 'خبرآنلاین', cat: 'عمومی' },
    { url: 'https://www.mehrnews.com/rss', name: 'مهر', cat: 'عمومی' },
    { url: 'https://www.tasnimnews.com/fa/rss/feed/0/7/0/%D9%83%D9%84-%D8%A7%D8%AE%D8%A8%D8%A7%D8%B1', name: 'تسنیم', cat: 'عمومی' },
    { url: 'https://www.yjc.ir/fa/rss/allnews', name: 'باشگاه خبرنگاران', cat: 'عمومی' },
    { url: 'https://www.farsnews.ir/rss', name: 'فارس', cat: 'عمومی' }
  ],

  proxies: [
    (u) => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
    (u) => 'https://corsproxy.io/?' + encodeURIComponent(u),
    (u) => 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(u) + '&count=15'
  ],

  async fetchText(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms || 7000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  },

  extractImg(html, item) {
    if (!html && !item) return '';
    const tryUrls = [];
    if (item) {
      const enc = item.querySelector && item.querySelector('enclosure');
      if (enc) {
        const t = (enc.getAttribute('type') || '');
        const u = enc.getAttribute('url') || '';
        if (u && (!t || t.startsWith('image'))) tryUrls.push(u);
      }
      // media:content / media:thumbnail
      item.querySelectorAll && item.querySelectorAll('*').forEach(n => {
        const tag = (n.tagName || '').toLowerCase();
        if (tag.includes('content') || tag.includes('thumbnail') || tag.includes('enclosure')) {
          const u = n.getAttribute('url') || n.getAttribute('href') || '';
          if (u && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(u) || /image/i.test(n.getAttribute('type') || '')) {
            tryUrls.push(u);
          }
        }
      });
    }
    const src = html && html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (src) tryUrls.push(src[1]);
    const og = html && html.match(/https?:\/\/[^\s"'<>]+\.(jpe?g|png|webp)/i);
    if (og) tryUrls.push(og[0]);
    for (const u of tryUrls) {
      if (!u || u.startsWith('data:')) continue;
      // ترجیح دامنه ایرانی
      if (/isna\.ir|irna\.ir|mehrnews|tasnim|farsnews|yjc\.ir|khabaronline|entekhab|tabnak/i.test(u)) return u;
    }
    return tryUrls[0] || '';
  },

  parseRss(xmlText, source, cat) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    if (xml.querySelector('parsererror')) return [];
    const items = xml.querySelectorAll('item');
    const list = [];
    items.forEach((item, i) => {
      if (i >= 20) return;
      const title = (item.querySelector('title')?.textContent || '').trim();
      const link = (item.querySelector('link')?.textContent || item.querySelector('guid')?.textContent || '').trim();
      const pubDate = item.querySelector('pubDate')?.textContent || item.querySelector('dc\\:date')?.textContent || '';
      let rawDesc = item.querySelector('description')?.textContent || item.querySelector('content\\:encoded')?.textContent || '';
      const img = this.extractImg(rawDesc, item);
      let desc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
      if (title) list.push({
        id: (link || title).slice(0, 180),
        title, link, pubDate, source, cat: cat || 'عمومی', desc, img
      });
    });
    return list;
  },

  parseJsonFeed(json, source, cat) {
    const items = json.items || json.feed?.items || [];
    return items.slice(0, 20).map(it => {
      const raw = String(it.description || it.content || it.content_html || '');
      let img = (it.enclosure && (it.enclosure.link || it.enclosure.url)) || it.thumbnail || it.image || '';
      if (!img) {
        const m = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (m) img = m[1];
      }
      return {
        id: (it.link || it.guid || it.title || '').toString().slice(0, 180),
        title: it.title || '',
        link: it.link || it.guid || '',
        pubDate: it.pubDate || it.published || '',
        source, cat: cat || 'عمومی',
        desc: raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180),
        img
      };
    }).filter(a => a.title);
  },

  async fetchOneFeed(feed) {
    for (const make of this.proxies) {
      try {
        const text = await this.fetchText(make(feed.url), 8000);
        if (!text) continue;
        if (text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          // allorigins wraps? raw should be direct
          if (json.contents && typeof json.contents === 'string') {
            if (json.contents.trim().startsWith('{')) {
              return this.parseJsonFeed(JSON.parse(json.contents), feed.name, feed.cat);
            }
            return this.parseRss(json.contents, feed.name, feed.cat);
          }
          const list = this.parseJsonFeed(json, feed.name, feed.cat);
          if (list.length) return list;
        } else {
          const list = this.parseRss(text, feed.name, feed.cat);
          if (list.length) return list;
        }
      } catch (e) { /* next proxy */ }
    }
    return [];
  },

  mergeArticles(lists) {
    const map = new Map();
    lists.flat().forEach(a => {
      if (!a || !a.title) return;
      const key = (a.link || a.title).replace(/\s+/g, '').slice(0, 120);
      if (!map.has(key)) map.set(key, a);
    });
    const arr = [...map.values()];
    arr.sort((a, b) => {
      const ta = a.pubDate ? Date.parse(a.pubDate) : 0;
      const tb = b.pubDate ? Date.parse(b.pubDate) : 0;
      return (tb || 0) - (ta || 0);
    });
    return arr;
  },

  async fetchData(force) {
    if (!force && this.articles.length && Date.now() - this.lastFetch < 90000) {
      return this.filterByCat(this.articles);
    }
    if (this.loading) {
      await new Promise(r => setTimeout(r, 500));
      if (this.articles.length) return this.filterByCat(this.articles);
    }
    this.loading = true;
    try {
      // موازی — چند منبع با هم (حداکثر ۸ برای سرعت)
      const batch = this.feeds.slice(0, 10);
      const results = await Promise.all(batch.map(f => this.fetchOneFeed(f)));
      const merged = this.mergeArticles(results);
      if (merged.length) {
        // ادغام با قبلی تا خبر قدیمی‌تر هم نپره؛ خبر جدید اول
        const combined = this.mergeArticles([merged, this.articles]);
        this.articles = combined.slice(0, 60);
        this.sourceName = [...new Set(merged.map(a => a.source))].slice(0, 4).join(' · ');
        this.lastFetch = Date.now();
      } else if (!this.articles.length) {
        throw new Error('no news');
      }
      return this.filterByCat(this.articles);
    } finally {
      this.loading = false;
    }
  },

  filterByCat(list) {
    if (!this.category || this.category === 'all') return list;
    return list.filter(a => a.cat === this.category || a.source.includes(this.category));
  },

  setCategory(cat) {
    this.category = cat || 'all';
    if (AppState.currentView === 'news') this.render(document.getElementById('main-content'));
    else this.refresh(false);
  },

  card(a) {
    const img = a.img
      ? `<img class="news-thumb" src="${escapeAttr(a.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">`
      : '';
    return `<article class="news-item news-preview">
      ${img}
      <div>
        <div class="news-title">${escapeHtml(a.title)}</div>
        <div class="news-meta"><span>${escapeHtml(a.source || '')}</span>
          ${a.cat ? `<span>· ${escapeHtml(a.cat)}</span>` : ''}
          <span>${a.pubDate ? new Date(a.pubDate).toLocaleString('fa-IR') : ''}</span></div>
        ${a.desc ? `<p class="news-desc">${escapeHtml(a.desc)}</p>` : ''}
        <a class="btn btn-text" href="${escapeAttr(a.link || '#')}" target="_blank" rel="noopener">مشاهده بیشتر</a>
      </div>
    </article>`;
  },

  async renderWidget(el, soft) {
    if (!el) return;
    const had = this.articles && this.articles.length;
    if (!soft || !had) el.innerHTML = `<div class="loading-state">${t('common.loading')}</div>`;
    try {
      const list = await this.fetchData(false);
      const first = list.slice(0, 5);
      if (!first.length) throw new Error('empty');
      el.innerHTML = `<div class="news-list">${first.map(a => this.card(a)).join('')}</div>
        <div class="news-meta" style="margin-top:0.4rem">${escapeHtml(this.sourceName)} · ${new Date(this.lastFetch).toLocaleTimeString('fa-IR')} · ${list.length} خبر</div>
        <button class="btn btn-text" onclick="navigateTo('news')">مشاهده بیشتر</button>`;
      this.ensureLive();
    } catch (e) {
      if (!had) {
        el.innerHTML = `<div class="error-state">${t('news.error')}<br>
          <button class="btn btn-secondary" style="margin-top:0.5rem" onclick="News.refresh(true)">${t('common.retry')}</button></div>`;
      }
    }
  },

  catsBar() {
    const cats = [
      { id: 'all', label: 'همه' },
      { id: 'عمومی', label: 'عمومی' },
      { id: 'سیاست', label: 'سیاست' },
      { id: 'اقتصاد', label: 'اقتصاد' },
      { id: 'ورزش', label: 'ورزش' }
    ];
    return `<div class="news-cats">${cats.map(c =>
      `<button type="button" class="achat-chip ${this.category === c.id ? 'sticky' : ''}" onclick="News.setCategory('${c.id}')">${c.label}</button>`
    ).join('')}</div>`;
  },

  async render(container) {
    container.innerHTML = `
      <div class="view-header">
        <h1>${t('news.title')}</h1>
        <div class="view-actions">
          <button class="btn btn-secondary" onclick="News.refresh(true)">${t('news.refresh')}</button>
        </div>
      </div>
      ${this.catsBar()}
      <div id="news-full" class="loading-state">${t('common.loading')}</div>`;
    try {
      const list = await this.fetchData(false);
      const box = document.getElementById('news-full');
      if (!box) return;
      if (!list.length) throw new Error('empty');
      box.innerHTML = `<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem">منابع: ${escapeHtml(this.sourceName)} · به‌روز: ${new Date(this.lastFetch).toLocaleString('fa-IR')} · ${list.length} خبر</p>
        <div class="news-list">${list.slice(0, 40).map(a => this.card(a)).join('')}</div>`;
      this.ensureLive();
    } catch (e) {
      const box = document.getElementById('news-full');
      if (box) box.innerHTML = `<div class="error-state">${t('news.error')}<br>
        <button class="btn btn-secondary" style="margin-top:0.75rem" onclick="News.refresh(true)">${t('common.retry')}</button></div>`;
    }
  },

  ensureLive() {
    if (this._timer) return;
    // هر ۹۰ ثانیه تلاش برای خبر جدید — بدون اسپینر
    this._timer = setInterval(() => {
      if (document.hidden) return;
      this.softRefresh();
    }, 90000);
  },

  async softRefresh() {
    try {
      await this.fetchData(true);
      const host = document.getElementById('news-widget-content');
      if (host && this.articles.length) this.renderWidget(host, true);
      if (AppState.currentView === 'news') {
        const box = document.getElementById('news-full');
        const list = this.filterByCat(this.articles);
        if (box && list.length) {
          box.innerHTML = `<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem">منابع: ${escapeHtml(this.sourceName)} · به‌روز: ${new Date(this.lastFetch).toLocaleString('fa-IR')} · ${list.length} خبر</p>
            <div class="news-list">${list.slice(0, 40).map(a => this.card(a)).join('')}</div>`;
        }
      }
    } catch (e) { /* quiet */ }
  },

  async refresh(force) {
    if (force) this.lastFetch = 0;
    if (AppState.currentView === 'news') this.render(document.getElementById('main-content'));
    else if (AppState.currentView === 'dashboard') {
      const host = document.getElementById('news-widget-content');
      if (host) this.renderWidget(host, !force && !!this.articles.length);
      else renderCurrentView();
    }
  }
};
