/* COMMANDER HUB - Main Application */
function navigateTo(view) {
  AppState.currentView = view;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('visible');
  renderCurrentView();
  if (typeof Assistant !== 'undefined') Assistant.onPageChange(view);
}

function renderCurrentView() {
  const container = document.getElementById('main-content');
  if (!container) return;
  switch (AppState.currentView) {
    case 'dashboard': Dashboard.render(container); break;
    case 'notes': Notes.render(container); break;
    case 'tasks': Tasks.render(container); break;
    case 'calendar': Calendar.render(container); break;
    case 'crypto': CryptoMarket.render(container); break;
    case 'portfolio': Portfolio.render(container); break;
    case 'news': News.render(container); break;
    case 'music': renderMusic(container); break;
    case 'settings': Settings.render(container); break;
    default: Dashboard.render(container);
  }
}

function renderMusic(container) {
  const services = [
    { name: 'Spotify', url: 'https://open.spotify.com', icon: '🎧' },
    { name: 'YouTube Music', url: 'https://music.youtube.com', icon: '🎵' },
    { name: 'SoundCloud', url: 'https://soundcloud.com', icon: '☁️' },
    { name: 'Apple Music', url: 'https://music.apple.com', icon: '🍎' },
    { name: 'Deezer', url: 'https://www.deezer.com', icon: '🎶' },
    { name: 'Bandcamp', url: 'https://bandcamp.com', icon: '🎸' }
  ];
  container.innerHTML = `
    <div class="view-header"><h1>${t('music.title')}</h1></div>
    <h3 style="margin-bottom:1rem">${t('music.services')}</h3>
    <div class="music-grid">
      ${services.map(s => `
        <a class="music-link" href="${s.url}" target="_blank" rel="noopener">
          <span class="music-icon">${s.icon}</span>
          <span class="music-name">${s.name}</span>
        </a>`).join('')}
    </div>`;
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showModal(title, bodyHtml, footerHtml = '') {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="btn-icon" onclick="closeModal()" aria-label="${t('common.close')}">✕</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    </div>`;
}

function closeModal() {
  document.getElementById('modal-container').innerHTML = '';
}

function updateNotifBadge() {
  const unread = AppState.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notif-badge');
  if (unread > 0) {
    badge.textContent = unread > 9 ? '9+' : unread;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function renderNotifications() {
  const list = document.getElementById('notifications-list');
  if (!AppState.notifications.length) {
    list.innerHTML = `<div class="empty-state">${t('notifications.empty')}</div>`;
    return;
  }
  list.innerHTML = AppState.notifications.map(n => `
    <div class="notification-item">
      <div style="font-weight:500">${escapeHtml(n.title)}</div>
      <div style="font-size:0.85rem;color:var(--text-secondary)">${escapeHtml(n.body || '')}</div>
      <div class="notif-time">${formatRelative(n.time)}</div>
    </div>`).join('');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
  applyAppearance();
  setLanguage(AppState.language);
  Workspaces.initSelect();
  Security.initAutoLock();
  Security.checkOnLoad();
  updateNotifBadge();

  // Nav clicks
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });

  // Sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.querySelector('.app')?.classList.toggle('sidebar-collapsed');
  });

  // Mobile menu
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.onclick = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
      };
      document.body.appendChild(overlay);
    }
    overlay.classList.toggle('visible', sidebar.classList.contains('open'));
  });

  // Lang toggle
  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    setLanguage(AppState.language === 'fa' ? 'en' : 'fa');
  });

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Lock button
  document.getElementById('lock-btn')?.addEventListener('click', () => {
    if (AppState.lockEnabled) Security.lock();
    else {
      navigateTo('settings');
      showToast(AppState.language === 'fa' ? 'ابتدا قفل را در تنظیمات فعال کنید' : 'Enable lock in Settings first', 'info');
    }
  });

  // Unlock form
  document.getElementById('unlock-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = document.getElementById('unlock-input').value;
    await Security.unlock(pass);
  });

  // Profile menu
  document.getElementById('user-profile')?.addEventListener('click', (e) => {
    e.stopPropagation();
    let menu = document.getElementById('profile-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'profile-menu';
      menu.className = 'profile-menu hidden';
      menu.innerHTML = `
        <button type="button" data-act="settings">⚙️ ${AppState.language==='fa'?'تنظیمات':'Settings'}</button>
        <button type="button" data-act="workspace">🗂 ${AppState.language==='fa'?'فضای کاری':'Workspace'}</button>
        <button type="button" data-act="backup">💾 ${AppState.language==='fa'?'پشتیبان‌گیری':'Backup'}</button>
        <button type="button" data-act="assistant">🤖 ${AppState.language==='fa'?'دستیار':'Assistant'}</button>`;
      document.body.appendChild(menu);
      menu.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-act]');
        if (!btn) return;
        menu.classList.add('hidden');
        const a = btn.dataset.act;
        if (a === 'settings') navigateTo('settings');
        else if (a === 'workspace') navigateTo('dashboard');
        else if (a === 'backup') navigateTo('settings');
        else if (a === 'assistant' && typeof Assistant !== 'undefined') Assistant.openPanel();
      });
      document.addEventListener('click', () => menu.classList.add('hidden'));
    }
    const rect = document.getElementById('user-profile').getBoundingClientRect();
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.insetInlineEnd = Math.max(8, window.innerWidth - rect.right) + 'px';
    menu.classList.toggle('hidden');
  });

  // Notifications
  document.getElementById('notifications-btn')?.addEventListener('click', () => {
    const panel = document.getElementById('notifications-panel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      renderNotifications();
      AppState.notifications.forEach(n => n.read = true);
      AppState.save();
      updateNotifBadge();
    }
  });

  document.getElementById('clear-notifications')?.addEventListener('click', () => {
    AppState.notifications = [];
    AppState.save();
    renderNotifications();
    updateNotifBadge();
  });

  // Command palette
  document.getElementById('command-input')?.addEventListener('input', (e) => Search.handleInput(e));
  document.getElementById('command-input')?.addEventListener('keydown', (e) => Search.handleKeydown(e));
  document.querySelector('.command-overlay')?.addEventListener('click', () => Search.closeCommandPalette());

  // Global keyboard
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      Search.openCommandPalette();
    }
    if (e.key === 'Escape') {
      Search.closeCommandPalette();
      closeModal();
      document.getElementById('notifications-panel')?.classList.add('hidden');
    }
  });

  // Global search focus opens command palette
  document.getElementById('global-search')?.addEventListener('focus', () => {
    Search.openCommandPalette();
    document.getElementById('global-search').blur();
  });

  // Assistant
  if (typeof Assistant !== 'undefined') {
    Assistant.init();
  }

  // Initial render
  if (!AppState.isLocked) {
    renderCurrentView();
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
});
