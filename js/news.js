/* COMMANDER HUB - News (using public RSS via allorigins proxy) */
const News = {
  articles: [],
  lastFetch: 0,

  async fetchData() {
    // Use a public news RSS feed via CORS proxy
    const feeds = [
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'
    ];
    try {
      // Try allorigins
      const feedUrl = encodeURIComponent(feeds[0]);
      const res = await fetch(`https://api.allorigins.win/get?url=${feedUrl}`);
      if (!res.ok) throw new Error('Proxy error');
      const json = await res.json();
      const parser = new DOMParser();
      const xml = parser.parseFromString(json.contents, 'text/xml');
      const items = xml.querySelectorAll('item');
      this.articles = Array.from(items).slice(0, 15).map(item => ({
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        pubDate: item.querySelector('pubDate')?.textContent || '',
        source: 'BBC'
      }));
      this.lastFetch = Date.now();
      return this.articles;
    } catch (e) {
      console.error('News fetch error:', e);
      // Fallback: try another approach or show error
      throw e;
    }
  },

  async renderWidget(el) {
    if (!el) return;
    el.innerHTML = `<div class="loading-state">${t('common.loading')}</div>`;
    try {
      if (!this.articles.length || Date.now() - this.lastFetch > 300000) await this.fetchData();
      let html = '<div class="news-list">';
      this.articles.slice(0, 4).forEach(a => {
        html += `
          <a class="news-item" href="${escapeAttr(a.link)}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block">
            <div class="news-title">${escapeHtml(a.title)}</div>
            <div class="news-meta"><span>${a.source}</span><span>${a.pubDate ? new Date(a.pubDate).toLocaleDateString() : ''}</span></div>
          </a>`;
      });
      html += '</div>';
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = `<div class="error-state">${t('news.error')}<br><button class="btn btn-secondary" style="margin-top:0.5rem" onclick="News.refresh()">${t('common.retry')}</button></div>`;
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
      let html = '<div class="news-list">';
      this.articles.forEach(a => {
        html += `
          <a class="news-item" href="${escapeAttr(a.link)}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block">
            <div class="news-title">${escapeHtml(a.title)}</div>
            <div class="news-meta"><span>${a.source}</span><span>${a.pubDate ? new Date(a.pubDate).toLocaleString() : ''}</span></div>
          </a>`;
      });
      html += '</div>';
      document.getElementById('news-full').innerHTML = html;
    } catch (e) {
      document.getElementById('news-full').innerHTML = 
        `<div class="error-state">${t('news.error')}<br><button class="btn btn-secondary" style="margin-top:0.75rem" onclick="News.refresh()">${t('common.retry')}</button></div>`;
    }
  },

  async refresh() {
    this.articles = [];
    this.lastFetch = 0;
    if (AppState.currentView === 'news') this.render(document.getElementById('main-content'));
    else if (AppState.currentView === 'dashboard') renderCurrentView();
  }
};
