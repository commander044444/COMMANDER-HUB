/* COMMANDER HUB - Global Search & Command Palette */
const Search = {
  commands: [],

  initCommands() {
    this.commands = [
      { id: 'dashboard', icon: '🏠', label: () => t('nav.dashboard'), action: () => navigateTo('dashboard') },
      { id: 'notes', icon: '📝', label: () => t('nav.notes'), action: () => navigateTo('notes') },
      { id: 'tasks', icon: '✅', label: () => t('nav.tasks'), action: () => navigateTo('tasks') },
      { id: 'calendar', icon: '📅', label: () => t('nav.calendar'), action: () => navigateTo('calendar') },
      { id: 'crypto', icon: '💰', label: () => t('nav.crypto'), action: () => navigateTo('crypto') },
      { id: 'portfolio', icon: '📊', label: () => t('nav.portfolio'), action: () => navigateTo('portfolio') },
      { id: 'news', icon: '📰', label: () => t('nav.news'), action: () => navigateTo('news') },
      { id: 'music', icon: '🎵', label: () => t('nav.music'), action: () => navigateTo('music') },
      { id: 'settings', icon: '⚙️', label: () => t('nav.settings'), action: () => navigateTo('settings') },
      { id: 'new-note', icon: '➕', label: () => t('notes.new'), action: () => { navigateTo('notes'); setTimeout(() => Notes.showEditor(), 100); } },
      { id: 'new-task', icon: '➕', label: () => t('tasks.new'), action: () => { navigateTo('tasks'); setTimeout(() => Tasks.showEditor(), 100); } },
      { id: 'theme', icon: '🎨', label: () => t('settings.theme'), action: () => toggleTheme() },
      { id: 'lock', icon: '🔒', label: () => t('lock.set'), action: () => { if (AppState.lockEnabled) Security.lock(); else navigateTo('settings'); } },
      { id: 'lang', icon: '🌐', label: () => 'Language / زبان', action: () => setLanguage(AppState.language === 'fa' ? 'en' : 'fa') },
    ];
  },

  openCommandPalette() {
    this.initCommands();
    const palette = document.getElementById('command-palette');
    palette.classList.remove('hidden');
    const input = document.getElementById('command-input');
    input.value = '';
    input.focus();
    this.renderCommands('');
  },

  closeCommandPalette() {
    document.getElementById('command-palette').classList.add('hidden');
  },

  renderCommands(query) {
    const list = document.getElementById('command-list');
    const q = query.toLowerCase();
    const filtered = this.commands.filter(c => c.label().toLowerCase().includes(q) || c.id.includes(q));
    
    // Also search notes and tasks
    const results = [...filtered.map(c => ({ type: 'cmd', ...c }))];
    
    if (q) {
      AppState.notes.filter(n => (n.title||'').toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q))
        .slice(0, 5).forEach(n => {
          results.push({
            type: 'note',
            icon: '📝',
            label: () => n.title || 'Untitled',
            action: () => { navigateTo('notes'); setTimeout(() => Notes.showEditor(n.id), 100); }
          });
        });
      AppState.tasks.filter(t => (t.title||'').toLowerCase().includes(q))
        .slice(0, 5).forEach(task => {
          results.push({
            type: 'task',
            icon: '✅',
            label: () => task.title,
            action: () => { navigateTo('tasks'); setTimeout(() => Tasks.showEditor(task.id), 100); }
          });
        });
    }

    list.innerHTML = results.map((r, i) => `
      <li class="command-item ${i===0?'selected':''}" data-idx="${i}" onclick="Search.execute(${i})">
        <span class="cmd-icon">${r.icon}</span>
        <span>${escapeHtml(r.label())}</span>
      </li>`).join('');
    
    this._results = results;
  },

  execute(idx) {
    const r = this._results[idx];
    if (r) {
      this.closeCommandPalette();
      r.action();
    }
  },

  handleInput(e) {
    this.renderCommands(e.target.value);
  },

  handleKeydown(e) {
    const items = document.querySelectorAll('.command-item');
    let selected = document.querySelector('.command-item.selected');
    let idx = selected ? parseInt(selected.dataset.idx) : 0;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      idx = Math.min(idx + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      idx = Math.max(idx - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.execute(idx);
      return;
    } else if (e.key === 'Escape') {
      this.closeCommandPalette();
      return;
    } else return;

    items.forEach(i => i.classList.remove('selected'));
    if (items[idx]) items[idx].classList.add('selected');
  }
};
