/* COMMANDER HUB - Widget Renderers */
const Widgets = {
  render(type, container) {
    const renderers = {
      clock: this.clock,
      weather: this.weather,
      tasks: this.tasks,
      notes: this.notes,
      crypto: this.crypto,
      portfolio: this.portfolio,
      goals: this.goals,
      quicklinks: this.quicklinks,
      news: this.news,
      system: this.system,
      calendar: this.calendar,
      activity: this.activity,
      music: this.music,
      search: this.search
    };
    const fn = renderers[type];
    if (fn) fn.call(this, container);
    else container.innerHTML = `<div class="empty-state">${type}</div>`;
  },

  clock(el) {
    el.innerHTML = `
      <div class="widget-header">
        <span class="widget-title">🕐 ${t('widget.clock')}</span>
      </div>
      <div class="clock-widget">
        <div class="clock-time" id="widget-clock-time">--:--</div>
        <div class="clock-date" id="widget-clock-date">--</div>
      </div>`;
    this.updateClock();
    if (!this._clockInterval) {
      this._clockInterval = setInterval(() => this.updateClock(), 1000);
    }
  },

  updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('widget-clock-time');
    const dateEl = document.getElementById('widget-clock-date');
    if (!timeEl) return;
    const lang = AppState.language;
    timeEl.textContent = now.toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    dateEl.textContent = now.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  },

  weather(el) {
    el.innerHTML = `
      <div class="widget-header">
        <span class="widget-title">🌤️ ${t('widget.weather')}</span>
        <div class="widget-actions">
          <button class="btn-icon" onclick="Weather.refresh()" title="${t('common.refresh')}">🔄</button>
        </div>
      </div>
      <div id="weather-content" class="loading-state">${t('common.loading')}</div>`;
    Weather.render(document.getElementById('weather-content'));
  },

  tasks(el) {
    const tasks = AppState.tasks.filter(t => !t.completed).slice(0, 5);
    let html = `
      <div class="widget-header">
        <span class="widget-title">✅ ${t('widget.tasks')}</span>
        <button class="btn-text" onclick="navigateTo('tasks')">${t('common.add')}</button>
      </div>`;
    if (tasks.length === 0) {
      html += `<div class="empty-state">${t('tasks.empty')}</div>`;
    } else {
      html += '<div class="task-list">';
      tasks.forEach(task => {
        html += `
          <div class="task-item" data-id="${task.id}">
            <div class="task-check" onclick="Tasks.toggle('${task.id}')"></div>
            <div class="task-content">
              <div class="task-title">${escapeHtml(task.title)}</div>
              ${task.due ? `<div class="task-meta">${formatDate(task.due)}</div>` : ''}
            </div>
          </div>`;
      });
      html += '</div>';
    }
    el.innerHTML = html;
  },

  notes(el) {
    const notes = AppState.notes.filter(n => n.pinned).concat(AppState.notes.filter(n => !n.pinned)).slice(0, 4);
    let html = `
      <div class="widget-header">
        <span class="widget-title">📝 ${t('widget.notes')}</span>
        <button class="btn-text" onclick="navigateTo('notes')">${t('common.add')}</button>
      </div>`;
    if (notes.length === 0) {
      html += `<div class="empty-state">${t('notes.empty')}</div>`;
    } else {
      html += '<div style="display:flex;flex-direction:column;gap:0.5rem">';
      notes.forEach(n => {
        html += `
          <div class="note-card" style="padding:0.75rem;cursor:pointer" onclick="navigateTo('notes')">
            <div class="note-title">${escapeHtml(n.title || 'Untitled')}</div>
            <div class="note-preview">${escapeHtml((n.content || '').slice(0, 80))}</div>
          </div>`;
      });
      html += '</div>';
    }
    el.innerHTML = html;
  },

  crypto(el) {
    el.innerHTML = `
      <div class="widget-header">
        <span class="widget-title">💰 ${t('widget.crypto')}</span>
        <button class="btn-icon" onclick="Crypto.refresh()" title="${t('common.refresh')}">🔄</button>
      </div>
      <div id="crypto-widget-content" class="loading-state">${t('common.loading')}</div>`;
    Crypto.renderWidget(document.getElementById('crypto-widget-content'));
  },

  portfolio(el) {
    el.innerHTML = `
      <div class="widget-header">
        <span class="widget-title">📊 ${t('widget.portfolio')}</span>
        <button class="btn-text" onclick="navigateTo('portfolio')">${t('common.add')}</button>
      </div>
      <div id="portfolio-widget-content"></div>`;
    Portfolio.renderWidget(document.getElementById('portfolio-widget-content'));
  },

  goals(el) {
    const goals = AppState.goals;
    let html = `
      <div class="widget-header">
        <span class="widget-title">🎯 ${t('widget.goals')}</span>
        <button class="btn-text" onclick="Goals.add()">${t('common.add')}</button>
      </div>`;
    if (goals.length === 0) {
      html += `<div class="empty-state">${t('goals.empty')}</div>`;
    } else {
      goals.forEach(g => {
        html += `
          <div class="goal-item">
            <input type="checkbox" class="goal-check" ${g.done ? 'checked' : ''} onchange="Goals.toggle('${g.id}')">
            <span style="${g.done ? 'text-decoration:line-through;opacity:0.6' : ''}">${escapeHtml(g.text)}</span>
          </div>`;
      });
    }
    el.innerHTML = html;
  },

  quicklinks(el) {
    const links = AppState.quickLinks;
    let html = `
      <div class="widget-header">
        <span class="widget-title">🔗 ${t('widget.quicklinks')}</span>
      </div>
      <div class="quick-links">`;
    links.forEach(l => {
      html += `<a class="quick-link" href="${escapeAttr(l.url)}" target="_blank" rel="noopener">
        <span class="quick-link-icon">${l.icon || '🔗'}</span>
        <span>${escapeHtml(l.name)}</span>
      </a>`;
    });
    html += '</div>';
    el.innerHTML = html;
  },

  news(el) {
    el.innerHTML = `
      <div class="widget-header">
        <span class="widget-title">📰 ${t('widget.news')}</span>
        <button class="btn-icon" onclick="News.refresh()" title="${t('common.refresh')}">🔄</button>
      </div>
      <div id="news-widget-content" class="loading-state">${t('common.loading')}</div>`;
    News.renderWidget(document.getElementById('news-widget-content'));
  },

  system(el) {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    const online = navigator.onLine;
    el.innerHTML = `
      <div class="widget-header">
        <span class="widget-title">💻 ${t('widget.system')}</span>
      </div>
      <div class="sys-info-grid">
        <div class="sys-info-item"><span>${t('system.browser')}</span><span>${browser}</span></div>
        <div class="sys-info-item"><span>${t('system.screen')}</span><span>${screen.width}×${screen.height}</span></div>
        <div class="sys-info-item"><span>${t('system.online')}</span><span>${online ? t('system.online') : t('system.offline')}</span></div>
        <div class="sys-info-item"><span>${t('system.lang')}</span><span>${navigator.language}</span></div>
        <div class="sys-info-item"><span>${t('system.storage')}</span><span>${(Storage.getUsage() / 1024).toFixed(1)} KB</span></div>
      </div>`;
  },

  calendar(el) {
    el.innerHTML = `
      <div class="widget-header">
        <span class="widget-title">📅 ${t('widget.calendar')}</span>
        <button class="btn-text" onclick="navigateTo('calendar')">${t('calendar.today')}</button>
      </div>
      <div id="cal-widget-mini"></div>`;
    Calendar.renderMini(document.getElementById('cal-widget-mini'));
  },

  activity(el) {
    const acts = AppState.activity.slice(0, 5);
    let html = `
      <div class="widget-header">
        <span class="widget-title">📋 ${t('widget.activity')}</span>
      </div>`;
    if (acts.length === 0) {
      html += `<div class="empty-state">${t('activity.empty')}</div>`;
    } else {
      acts.forEach(a => {
        html += `<div style="padding:0.4rem 0;font-size:0.85rem;border-bottom:1px solid var(--border-color)">
          <div>${escapeHtml(a.text)}</div>
          <div style="font-size:0.7rem;color:var(--text-muted)">${formatRelative(a.time)}</div>
        </div>`;
      });
    }
    el.innerHTML = html;
  },

  music(el) {
    const services = [
      { name: 'Spotify', url: 'https://open.spotify.com', icon: '🎧' },
      { name: 'YouTube Music', url: 'https://music.youtube.com', icon: '🎵' },
      { name: 'SoundCloud', url: 'https://soundcloud.com', icon: '☁️' },
      { name: 'Apple Music', url: 'https://music.apple.com', icon: '🍎' }
    ];
    let html = `
      <div class="widget-header">
        <span class="widget-title">🎵 ${t('widget.music')}</span>
      </div>
      <div class="music-grid">`;
    services.forEach(s => {
      html += `<a class="music-link" href="${s.url}" target="_blank" rel="noopener">
        <span class="music-icon">${s.icon}</span>
        <span class="music-name">${s.name}</span>
      </a>`;
    });
    html += '</div>';
    el.innerHTML = html;
  },

  search(el) {
    el.innerHTML = `
      <div class="widget-header">
        <span class="widget-title">🔍 ${t('widget.search')}</span>
      </div>
      <form onsubmit="event.preventDefault(); const q=this.q.value.trim(); if(q) window.open('https://www.google.com/search?q='+encodeURIComponent(q),'_blank')">
        <input class="form-control" name="q" placeholder="${t('search.placeholder')}" style="margin-bottom:0.5rem">
        <button type="submit" class="btn btn-primary" style="width:100%">${t('common.search')}</button>
      </form>`;
  }
};

function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString(AppState.language === 'fa' ? 'fa-IR' : 'en-US');
  } catch { return d; }
}

function formatRelative(iso) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return AppState.language === 'fa' ? 'همین الان' : 'just now';
    if (mins < 60) return AppState.language === 'fa' ? `${mins} دقیقه پیش` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return AppState.language === 'fa' ? `${hours} ساعت پیش` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return AppState.language === 'fa' ? `${days} روز پیش` : `${days}d ago`;
  } catch { return ''; }
}
