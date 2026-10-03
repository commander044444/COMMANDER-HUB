/* COMMANDER HUB - اخبار از منابع ایرانی */
const News = {
  articles: [],
  lastFetch: 0,
  sourceName: 'ایرنا / ایسنا',

  feeds: [
    { url: 'https://www.irna.ir/rss', name: 'ایرنا' },
    { url: 'https://www.isna.ir/rss', name: 'ایسنا' },
    { url: 'https://www.farsnews.ir/rss', name: 'فارس' }
  ],

  async fetchOne(feed) {
    const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(feed.url);
    const res = await fetch(proxy);
    if (!res.ok) throw new Error('proxy ' + res.status);
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const items = xml.querySelectorAll('item');
    const list = [];
    items.forEach(function(item, i) {
      if (i >= 12) return;
      const title = (item.querySelector('title') && item.querySelector('title').textContent || '').trim();
      const link = (item.querySelector('link') && item.querySelector('link').textContent ||
                   item.querySelector('guid') && item.querySelector('guid').textContent || '').trim();
      const pubDate = (item.querySelector('pubDate') && item.querySelector('pubDate').textContent) || '';
      if (title) list.push({ title: title, link: link, pubDate: pubDate, source: feed.name });
    });
    return list;
  },

  async fetchData() {
    if (this.articles.length && Date.now() - this.lastFetch < 300000) {
      return this.articles;
    }
    var errors = [];
    for (var i = 0; i < this.feeds.length; i++) {
      try {
        var list = await this.fetchOne(this.feeds[i]);
        if (list.length) {
          this.articles = list;
          this.sourceName = this.feeds[i].name;
          this.lastFetch = Date.now();
          return this.articles;
        }
      } catch (e) {
        errors.push(this.feeds[i].name);
      }
    }
    try {
      var feed = this.feeds[0];
      var res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(feed.url));
      var json = await res.json();
      var parser = new DOMParser();
      var xml = parser.parseFromString(json.contents || '', 'text/xml');
      var items = xml.querySelectorAll('item');
      this.articles = [];
      for (var j = 0; j < Math.min(items.length, 12); j++) {
        var item = items[j];
        var title = (item.querySelector('title') && item.querySelector('title').textContent || '').trim();
        var link = (item.querySelector('link') && item.querySelector('link').textContent || '').trim();
        var pubDate = (item.querySelector('pubDate') && item.querySelector('pubDate').textContent) || '';
        if (title) this.articles.push({ title: title, link: link, pubDate: pubDate, source: feed.name });
      }
      if (this.articles.length) {
        this.sourceName = feed.name;
        this.lastFetch = Date.now();
        return this.articles;
      }
    } catch (e2) {}
    throw new Error('news failed');
  },

  async renderWidget(el) {
    if (!el) return;
    el.innerHTML = '<div class="loading-state">' + t('common.loading') + '</div>';
    try {
      await this.fetchData();
      var html = '<div class="news-list">';
      this.articles.slice(0, 4).forEach(function(a) {
        html += '<a class="news-item" href="' + escapeAttr(a.link || '#') + '" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block">' +
          '<div class="news-title">' + escapeHtml(a.title) + '</div>' +
          '<div class="news-meta"><span>' + escapeHtml(a.source || '') + '</span>' +
          '<span>' + (a.pubDate ? new Date(a.pubDate).toLocaleDateString('fa-IR') : '') + '</span></div></a>';
      });
      html += '</div>';
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = '<div class="error-state">' + t('news.error') + '<br><button class="btn btn-secondary" style="margin-top:0.5rem" onclick="News.refresh()">' + t('common.retry') + '</button></div>';
    }
  },

  async render(container) {
    container.innerHTML = '<div class="view-header"><h1>' + t('news.title') + '</h1>' +
      '<div class="view-actions"><button class="btn btn-secondary" onclick="News.refresh()">' + t('news.refresh') + '</button></div></div>' +
      '<div id="news-full" class="loading-state">' + t('common.loading') + '</div>';
    try {
      await this.fetchData();
      var html = '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">منبع: ' + escapeHtml(this.sourceName) + '</p><div class="news-list">';
      this.articles.forEach(function(a) {
        html += '<a class="news-item" href="' + escapeAttr(a.link || '#') + '" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block">' +
          '<div class="news-title">' + escapeHtml(a.title) + '</div>' +
          '<div class="news-meta"><span>' + escapeHtml(a.source || '') + '</span>' +
          '<span>' + (a.pubDate ? new Date(a.pubDate).toLocaleString('fa-IR') : '') + '</span></div></a>';
      });
      html += '</div>';
      document.getElementById('news-full').innerHTML = html;
    } catch (e) {
      document.getElementById('news-full').innerHTML = '<div class="error-state">' + t('news.error') +
        '<br><button class="btn btn-secondary" style="margin-top:0.75rem" onclick="News.refresh()">' + t('common.retry') + '</button></div>';
    }
  },

  async refresh() {
    this.articles = [];
    this.lastFetch = 0;
    if (AppState.currentView === 'news') this.render(document.getElementById('main-content'));
    else if (AppState.currentView === 'dashboard') renderCurrentView();
  }
};
