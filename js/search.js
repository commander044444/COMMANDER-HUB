/* COMMANDER HUB — Search Center: HUB + Google */
const Search = {
  mode: 'hub', // hub | google
  _results: [],
  _selected: 0,
  recent: [],

  initCommands() {
    this.commands = [
      { id: 'dashboard', icon: '🏠', title: () => t('nav.dashboard'), type: 'page', keywords: 'dashboard home داشبورد خانه', desc: () => (AppState.language === 'fa' ? 'نمای کلی ویجت‌ها و وضعیت' : 'Overview widgets and status'), action: () => navigateTo('dashboard') },
      { id: 'notes', icon: '📝', title: () => t('nav.notes'), type: 'page', keywords: 'notes یادداشت', desc: () => (AppState.language === 'fa' ? 'یادداشت‌های محلی' : 'Local notes'), action: () => navigateTo('notes') },
      { id: 'tasks', icon: '✅', title: () => t('nav.tasks'), type: 'page', keywords: 'tasks todo کارها', desc: () => (AppState.language === 'fa' ? 'لیست کارها و مهلت‌ها' : 'Tasks and due dates'), action: () => navigateTo('tasks') },
      { id: 'calendar', icon: '📅', title: () => t('nav.calendar'), type: 'page', keywords: 'calendar تقویم مناسبت event', desc: () => (AppState.language === 'fa' ? 'تقویم و مناسبت‌ها' : 'Calendar and occasions'), action: () => navigateTo('calendar') },
      { id: 'crypto', icon: '💰', title: () => t('nav.crypto'), type: 'page', keywords: 'crypto bitcoin market رمزارز بازار', desc: () => (AppState.language === 'fa' ? 'قیمت رمزارز زنده' : 'Live crypto prices'), action: () => navigateTo('crypto') },
      { id: 'portfolio', icon: '📊', title: () => t('nav.portfolio'), type: 'page', keywords: 'portfolio دارایی پرتفوی', desc: () => (AppState.language === 'fa' ? 'دارایی‌های ثبت‌شده' : 'Recorded holdings'), action: () => navigateTo('portfolio') },
      { id: 'news', icon: '📰', title: () => t('nav.news'), type: 'page', keywords: 'news اخبار', desc: () => (AppState.language === 'fa' ? 'اخبار از منابع ایرانی' : 'News feeds'), action: () => navigateTo('news') },
      { id: 'music', icon: '🎵', title: () => t('nav.music'), type: 'page', keywords: 'music موسیقی', desc: () => (AppState.language === 'fa' ? 'میانبر سرویس‌های موسیقی' : 'Music service shortcuts'), action: () => navigateTo('music') },
      { id: 'settings', icon: '⚙️', title: () => t('nav.settings'), type: 'page', keywords: 'settings theme ظاهر تم language قفل lock backup پشتیبان', desc: () => (AppState.language === 'fa' ? 'تم، زبان، قفل و پشتیبان‌گیری' : 'Theme, language, lock, backup'), action: () => navigateTo('settings') },
      { id: 'new-note', icon: '➕', title: () => t('notes.new'), type: 'command', keywords: 'new note یادداشت جدید', desc: () => '', action: () => { navigateTo('notes'); setTimeout(() => Notes.showEditor(), 100); } },
      { id: 'new-task', icon: '➕', title: () => t('tasks.new'), type: 'command', keywords: 'new task کار جدید', desc: () => '', action: () => { navigateTo('tasks'); setTimeout(() => Tasks.showEditor(), 100); } },
      { id: 'theme', icon: '🎨', title: () => t('settings.theme'), type: 'command', keywords: 'theme dark light ظاهر dark mode', desc: () => (AppState.language === 'fa' ? 'تغییر تم روشن/تاریک' : 'Toggle light/dark theme'), action: () => toggleTheme() },
      { id: 'lang', icon: '🌐', title: () => 'Language / زبان', type: 'command', keywords: 'language fa en فارسی english', desc: () => '', action: () => setLanguage(AppState.language === 'fa' ? 'en' : 'fa') },
      { id: 'lock', icon: '🔒', title: () => t('lock.set'), type: 'command', keywords: 'lock قفل', desc: () => '', action: () => { if (AppState.lockEnabled) Security.lock(); else navigateTo('settings'); } },
      { id: 'assistant', icon: '🤖', title: () => (AppState.language === 'fa' ? 'دستیار' : 'Assistant'), type: 'feature', keywords: 'assistant help راهنما دستیار', desc: () => (AppState.language === 'fa' ? 'باز کردن پنل دستیار' : 'Open assistant panel'), action: () => { if (typeof Assistant !== 'undefined') { Assistant.openPanel(); } } }
    ];
  },

  loadRecent() {
    this.recent = Storage.load('searchRecent', []) || [];
  },
  saveRecent(entry) {
    this.loadRecent();
    this.recent = [entry, ...this.recent.filter(r => r !== entry)].slice(0, 8);
    Storage.save('searchRecent', this.recent);
  },

  openCommandPalette() {
    this.initCommands();
    this.loadRecent();
    const palette = document.getElementById('command-palette');
    palette.classList.remove('hidden');
    this.ensureChrome();
    const input = document.getElementById('command-input');
    input.value = '';
    input.focus();
    this.setMode(this.mode || 'hub');
    this.renderCommands('');
    if (typeof Assistant !== 'undefined' && Assistant.settings?.enabled) {
      const msg = Assistant.buildMessage({ fromPage: true, forceCategory: 'search' });
      if (msg) Assistant.show(msg, { open: false, toast: true });
    }
  },

  closeCommandPalette() {
    document.getElementById('command-palette')?.classList.add('hidden');
  },

  ensureChrome() {
    const box = document.querySelector('.command-box');
    if (!box || document.getElementById('search-mode-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'search-mode-bar';
    bar.className = 'search-mode-bar';
    bar.innerHTML = `
      <button type="button" class="search-mode-btn active" data-mode="hub">🧠 COMMANDER HUB</button>
      <button type="button" class="search-mode-btn" data-mode="google">🌐 Google</button>`;
    box.insertBefore(bar, box.firstChild);
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mode]');
      if (!btn) return;
      this.setMode(btn.dataset.mode);
      this.renderCommands(document.getElementById('command-input').value || '');
    });
    const input = document.getElementById('command-input');
    if (input) input.placeholder = AppState.language === 'fa' ? 'جست‌وجو در COMMANDER HUB...' : 'Search COMMANDER HUB...';
  },

  setMode(mode) {
    this.mode = mode === 'google' ? 'google' : 'hub';
    document.querySelectorAll('.search-mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === this.mode);
    });
    const input = document.getElementById('command-input');
    if (input) {
      input.placeholder = this.mode === 'google'
        ? (AppState.language === 'fa' ? 'عبارت دقیق برای Google...' : 'Exact Google query...')
        : (AppState.language === 'fa' ? 'جست‌وجو در COMMANDER HUB...' : 'Search COMMANDER HUB...');
    }
  },

  score(item, q) {
    if (!q) return 1;
    const hay = `${item.title?.() || ''} ${item.keywords || ''} ${item.desc?.() || ''} ${item.id || ''}`.toLowerCase();
    const parts = q.split(/\s+/).filter(Boolean);
    let s = 0;
    parts.forEach(p => {
      if (hay.includes(p)) s += 10;
      if ((item.id || '').includes(p)) s += 5;
      // soft synonyms
      if (p === 'theme' && /theme|ظاهر|تم|dark/.test(hay)) s += 8;
      if (p === 'ظاهر' && /theme|ظاهر|تم/.test(hay)) s += 8;
    });
    return s;
  },

  buildIndex(q) {
    this.initCommands();
    const results = [];
    this.commands.forEach(c => {
      const sc = this.score(c, q);
      if (!q || sc > 0) results.push({ ...c, _score: sc, label: c.title });
    });
    if (q) {
      (AppState.notes || []).forEach(n => {
        const hay = `${n.title || ''} ${n.content || ''}`.toLowerCase();
        if (hay.includes(q)) {
          results.push({
            id: 'note-' + n.id,
            icon: '📝',
            type: 'note',
            title: () => n.title || 'Untitled',
            label: () => n.title || 'Untitled',
            desc: () => (n.content || '').slice(0, 80),
            _score: 12,
            action: () => { navigateTo('notes'); setTimeout(() => Notes.showEditor(n.id), 100); }
          });
        }
      });
      (AppState.tasks || []).forEach(task => {
        if ((task.title || '').toLowerCase().includes(q)) {
          results.push({
            id: 'task-' + task.id,
            icon: '✅',
            type: 'task',
            title: () => task.title,
            label: () => task.title,
            desc: () => task.done ? (AppState.language === 'fa' ? 'انجام‌شده' : 'Done') : (AppState.language === 'fa' ? 'باز' : 'Open'),
            _score: 11,
            action: () => { navigateTo('tasks'); setTimeout(() => Tasks.showEditor(task.id), 100); }
          });
        }
      });
    }
    results.sort((a, b) => (b._score || 0) - (a._score || 0));
    return results.slice(0, 40);
  },

  renderCommands(query) {
    const list = document.getElementById('command-list');
    if (!list) return;
    const q = (query || '').trim().toLowerCase();

    if (this.mode === 'google') {
      const label = q
        ? (AppState.language === 'fa' ? `جست‌وجوی Google برای «${query.trim()}»` : `Google search for “${query.trim()}”`)
        : (AppState.language === 'fa' ? 'عبارت را بنویس و Enter بزن' : 'Type a query and press Enter');
      list.innerHTML = `<li class="command-item selected" data-idx="0">
        <span class="cmd-icon">🌐</span>
        <span><strong>${escapeHtml(label)}</strong><br><small class="cmd-desc">${AppState.language === 'fa' ? 'در تب جدید باز می‌شود' : 'Opens in a new tab'}</small></span>
      </li>`;
      this._results = [{ type: 'google', query: query.trim(), action: () => this.openGoogle(query.trim()) }];
      this._selected = 0;
      return;
    }

    const results = this.buildIndex(q);
    if (!results.length) {
      list.innerHTML = `<li class="command-item selected" data-idx="0">
        <span class="cmd-icon">🤔</span>
        <span><strong>${AppState.language === 'fa' ? 'نتیجه‌ای پیدا نشد' : 'No results found.'}</strong><br>
        <small class="cmd-desc">${AppState.language === 'fa' ? 'عبارت دیگری امتحان کن یا Google را انتخاب کن' : 'Try another keyword or switch to Google'}</small></span>
      </li>`;
      this._results = [{
        type: 'empty',
        action: () => { this.setMode('google'); this.renderCommands(query); }
      }];
      if (typeof Assistant !== 'undefined' && q) {
        Assistant.show({
          message: AppState.language === 'fa'
            ? '🤔 چیزی داخل HUB پیدا نکردم. شاید Google جوابش را داشته باشد.'
            : 'Nothing in HUB — try Google.',
          category: 'search', facts: [], actions: []
        }, { open: false, toast: true });
      }
      return;
    }

    if (!q && this.recent.length) {
      const recentHtml = this.recent.slice(0, 5).map((r, i) =>
        `<li class="command-item" data-idx="recent-${i}" data-recent="${escapeAttr(r)}">
          <span class="cmd-icon">🕒</span><span>${escapeHtml(r)}</span></li>`).join('');
      list.innerHTML = `<li class="command-group">${AppState.language === 'fa' ? 'اخیر' : 'Recent'}</li>${recentHtml}
        <li class="command-group">${AppState.language === 'fa' ? 'صفحات و دستورات' : 'Pages & commands'}</li>` +
        results.map((r, i) => this.rowHtml(r, i)).join('');
      list.querySelectorAll('[data-recent]').forEach(el => {
        el.onclick = () => {
          document.getElementById('command-input').value = el.dataset.recent;
          this.renderCommands(el.dataset.recent);
        };
      });
    } else {
      list.innerHTML = results.map((r, i) => this.rowHtml(r, i)).join('');
    }
    this._results = results;
    this._selected = 0;
  },

  rowHtml(r, i) {
    const title = r.title ? r.title() : (r.label ? r.label() : r.id);
    const desc = r.desc ? r.desc() : '';
    return `<li class="command-item ${i === 0 ? 'selected' : ''}" data-idx="${i}" onclick="Search.execute(${i})">
      <span class="cmd-icon">${r.icon || '•'}</span>
      <span><strong>${escapeHtml(title)}</strong>${desc ? `<br><small class="cmd-desc">${escapeHtml(desc)}</small>` : ''}</span>
      <span class="cmd-type">${escapeHtml(r.type || '')}</span>
    </li>`;
  },

  openGoogle(q) {
    if (!q) return;
    this.saveRecent(q);
    window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank', 'noopener');
    this.closeCommandPalette();
  },

  execute(idx) {
    const r = this._results[idx];
    if (!r) return;
    if (r.type === 'google') {
      this.openGoogle(r.query || document.getElementById('command-input')?.value || '');
      return;
    }
    if (r.type === 'empty') {
      r.action();
      return;
    }
    this.closeCommandPalette();
    const title = r.title ? r.title() : r.id;
    if (title) this.saveRecent(title);
    r.action && r.action();
  },

  handleInput(e) {
    this.renderCommands(e.target.value);
  },

  handleKeydown(e) {
    const items = [...document.querySelectorAll('#command-list .command-item')];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._selected = Math.min(this._selected + 1, Math.max(items.length - 1, 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._selected = Math.max(this._selected - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.mode === 'google') {
        this.openGoogle(document.getElementById('command-input')?.value || '');
        return;
      }
      const el = items[this._selected];
      if (el && el.dataset.recent) {
        document.getElementById('command-input').value = el.dataset.recent;
        this.renderCommands(el.dataset.recent);
        return;
      }
      this.execute(this._selected);
      return;
    } else if (e.key === 'Escape') {
      this.closeCommandPalette();
      return;
    } else return;
    items.forEach(i => i.classList.remove('selected'));
    if (items[this._selected]) {
      items[this._selected].classList.add('selected');
      items[this._selected].scrollIntoView({ block: 'nearest' });
    }
  }
};
