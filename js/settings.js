/* COMMANDER HUB - Settings */
const Settings = {
  render(container) {
    const themes = ['dark','light','midnight','ocean','sunset','forest'];
    const accents = ['blue','purple','green','orange','pink','cyan'];

    container.innerHTML = `
      <div class="view-header">
        <h1>${t('settings.title')}</h1>
      </div>

      <div class="settings-section">
        <h3>${t('settings.appearance')}</h3>
        <div class="settings-row">
          <div>
            <div class="settings-label">${t('settings.theme')}</div>
          </div>
          <div class="theme-options">
            ${themes.map(th => `
              <button class="theme-swatch ${AppState.theme===th?'active':''}" 
                style="background: ${this.themeColor(th)}" 
                title="${t('settings.theme.'+th)}"
                onclick="Settings.setTheme('${th}')"></button>
            `).join('')}
          </div>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-label">${t('settings.accent')}</div>
          </div>
          <div class="accent-options">
            ${accents.map(a => `
              <button class="accent-swatch ${AppState.accent===a?'active':''}" 
                style="background: var(--accent)" 
                data-accent-preview="${a}"
                onclick="Settings.setAccent('${a}')"></button>
            `).join('')}
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-label">${t('settings.density')}</div>
          <select class="form-control" style="width:auto" onchange="Settings.setDensity(this.value)">
            <option value="compact" ${AppState.density==='compact'?'selected':''}>${t('settings.density.compact')}</option>
            <option value="comfortable" ${AppState.density==='comfortable'?'selected':''}>${t('settings.density.comfortable')}</option>
            <option value="spacious" ${AppState.density==='spacious'?'selected':''}>${t('settings.density.spacious')}</option>
          </select>
        </div>
        <div class="settings-row">
          <div class="settings-label">${t('settings.radius')}</div>
          <select class="form-control" style="width:auto" onchange="Settings.setRadius(this.value)">
            <option value="sharp" ${AppState.radius==='sharp'?'selected':''}>${t('settings.radius.sharp')}</option>
            <option value="rounded" ${AppState.radius==='rounded'?'selected':''}>${t('settings.radius.rounded')}</option>
            <option value="pill" ${AppState.radius==='pill'?'selected':''}>${t('settings.radius.pill')}</option>
          </select>
        </div>
        <div class="settings-row">
          <div class="settings-label">${t('settings.fontSize')}</div>
          <input type="range" min="12" max="20" value="${AppState.fontSize}" 
            oninput="Settings.setFontSize(this.value); this.nextElementSibling.textContent=this.value+'px'">
          <span style="min-width:40px">${AppState.fontSize}px</span>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-label">${t('settings.reducedMotion')}</div>
          </div>
          <input type="checkbox" ${AppState.reducedMotion?'checked':''} onchange="Settings.setReducedMotion(this.checked)">
        </div>
      </div>

      <div class="settings-section">
        <h3>${t('settings.language')}</h3>
        <div class="settings-row">
          <div class="settings-label">${t('settings.language')}</div>
          <div>
            <button class="btn ${AppState.language==='fa'?'btn-primary':'btn-secondary'}" onclick="setLanguage('fa')">فارسی</button>
            <button class="btn ${AppState.language==='en'?'btn-primary':'btn-secondary'}" onclick="setLanguage('en')">English</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>${t('settings.security')}</h3>
        <div class="settings-row">
          <div>
            <div class="settings-label">${t('settings.lock')}</div>
            <div class="settings-desc">${AppState.lockEnabled ? t('lock.enabled') : t('lock.disabled')}</div>
          </div>
          <div>
            ${AppState.lockEnabled 
              ? `<button class="btn btn-secondary" onclick="Settings.changePassword()">${t('lock.change')}</button>
                 <button class="btn btn-danger" onclick="Settings.removeLock()">${t('lock.remove')}</button>`
              : `<button class="btn btn-primary" onclick="Settings.setLock()">${t('lock.set')}</button>`}
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-label">${t('settings.autoLock')}</div>
          <input type="number" class="form-control" style="width:80px" min="0" max="120" value="${AppState.autoLockMinutes}"
            onchange="Settings.setAutoLock(this.value)">
        </div>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem">${t('settings.securityNote')}</p>
      </div>

      <div class="settings-section">
        <h3>${t('settings.data')}</h3>
        <div class="settings-row">
          <div class="settings-label">${t('settings.backup')}</div>
          <div>
            <button class="btn btn-secondary" onclick="Backup.export()">${t('settings.export')}</button>
            <button class="btn btn-secondary" onclick="Backup.import()">${t('settings.import')}</button>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-label">${t('settings.reset')}</div>
          <button class="btn btn-danger" onclick="Backup.reset()">${t('settings.reset')}</button>
        </div>
      </div>

      <div class="settings-section">
        <h3>${t('settings.about')}</h3>
        <div class="settings-row">
          <div class="settings-label">${t('settings.version')}</div>
          <div>1.0.0</div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.75rem">${t('settings.privacy')}</p>
      </div>
    `;

    // Fix accent swatch colors
    document.querySelectorAll('[data-accent-preview]').forEach(btn => {
      const a = btn.dataset.accentPreview;
      const colors = { blue:'#38bdf8', purple:'#a78bfa', green:'#34d399', orange:'#fb923c', pink:'#f472b6', cyan:'#22d3ee' };
      btn.style.background = colors[a] || '#38bdf8';
    });
  },

  themeColor(th) {
    const map = { dark:'#0b1120', light:'#f8fafc', midnight:'#020617', ocean:'#0c1929', sunset:'#1a0f0a', forest:'#0a1a0f' };
    return map[th] || '#0b1120';
  },

  setTheme(th) {
    AppState.theme = th;
    AppState.save();
    applyAppearance();
    this.render(document.getElementById('main-content'));
  },

  setAccent(a) {
    AppState.accent = a;
    AppState.save();
    applyAppearance();
    this.render(document.getElementById('main-content'));
  },

  setDensity(d) {
    AppState.density = d;
    AppState.save();
    applyAppearance();
  },

  setRadius(r) {
    AppState.radius = r;
    AppState.save();
    applyAppearance();
  },

  setFontSize(s) {
    AppState.fontSize = parseInt(s);
    AppState.save();
    document.documentElement.style.fontSize = s + 'px';
  },

  setReducedMotion(v) {
    AppState.reducedMotion = v;
    AppState.save();
    document.body.classList.toggle('reduced-motion', v);
  },

  setAutoLock(v) {
    AppState.autoLockMinutes = parseInt(v) || 0;
    AppState.save();
  },

  setLock() {
    const pass = prompt(t('lock.placeholder') + ' (min 4 chars)');
    if (!pass || pass.length < 4) {
      showToast(t('common.error'), 'error');
      return;
    }
    Security.setPassword(pass).then(ok => {
      if (ok) {
        showToast(t('lock.enabled'), 'success');
        this.render(document.getElementById('main-content'));
      }
    });
  },

  changePassword() {
    const oldP = prompt(t('lock.placeholder') + ' (current)');
    if (!oldP) return;
    const newP = prompt(t('lock.placeholder') + ' (new, min 4)');
    if (!newP || newP.length < 4) return;
    Security.changePassword(oldP, newP).then(ok => {
      showToast(ok ? t('toast.saved') : t('lock.error'), ok ? 'success' : 'error');
    });
  },

  removeLock() {
    const pass = prompt(t('lock.placeholder'));
    if (!pass) return;
    Security.removeLock(pass).then(ok => {
      if (ok) {
        showToast(t('lock.disabled'), 'success');
        this.render(document.getElementById('main-content'));
      } else showToast(t('lock.error'), 'error');
    });
  }
};

function applyAppearance() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  document.documentElement.setAttribute('data-accent', AppState.accent);
  document.documentElement.setAttribute('data-density', AppState.density);
  document.documentElement.setAttribute('data-radius', AppState.radius);
  document.documentElement.style.fontSize = AppState.fontSize + 'px';
  document.body.classList.toggle('reduced-motion', AppState.reducedMotion);
  document.getElementById('theme-icon').textContent = AppState.theme === 'light' ? '☀️' : '🌙';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', 
    AppState.theme === 'light' ? '#f8fafc' : '#0b1120');
}

function toggleTheme() {
  const themes = ['dark','light','midnight','ocean','sunset','forest'];
  const idx = themes.indexOf(AppState.theme);
  Settings.setTheme(themes[(idx + 1) % themes.length]);
}
