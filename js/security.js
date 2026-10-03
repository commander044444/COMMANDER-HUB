/* COMMANDER HUB - Security / Lock */
const Security = {
  async hash(str) {
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(str + 'commander_hub_salt_v1');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback simple hash
    let h = 0;
    const s = str + 'commander_hub_salt_v1';
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return 'fallback_' + Math.abs(h).toString(16);
  },

  async setPassword(password) {
    if (!password || password.length < 4) return false;
    const hash = await this.hash(password);
    AppState.lockHash = hash;
    AppState.lockEnabled = true;
    AppState.save();
    return true;
  },

  async verify(password) {
    if (!AppState.lockHash) return true;
    const hash = await this.hash(password);
    return hash === AppState.lockHash;
  },

  async changePassword(oldPass, newPass) {
    if (!(await this.verify(oldPass))) return false;
    return this.setPassword(newPass);
  },

  removeLock(password) {
    return this.verify(password).then(ok => {
      if (ok) {
        AppState.lockEnabled = false;
        AppState.lockHash = null;
        AppState.isLocked = false;
        AppState.save();
        return true;
      }
      return false;
    });
  },

  lock() {
    if (!AppState.lockEnabled) return;
    AppState.isLocked = true;
    document.getElementById('lock-screen').classList.remove('hidden');
    document.getElementById('lock-screen').setAttribute('aria-hidden', 'false');
    document.getElementById('app').style.display = 'none';
    document.getElementById('unlock-input').value = '';
    document.getElementById('lock-error').classList.add('hidden');
    setTimeout(() => document.getElementById('unlock-input').focus(), 100);
  },

  async unlock(password) {
    const ok = await this.verify(password);
    if (ok) {
      AppState.isLocked = false;
      AppState.lastActivity = Date.now();
      document.getElementById('lock-screen').classList.add('hidden');
      document.getElementById('lock-screen').setAttribute('aria-hidden', 'true');
      document.getElementById('app').style.display = '';
      showToast(t('toast.unlocked'), 'success');
      return true;
    }
    document.getElementById('lock-error').classList.remove('hidden');
    return false;
  },

  initAutoLock() {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => {
      document.addEventListener(e, () => {
        AppState.lastActivity = Date.now();
      }, { passive: true });
    });

    setInterval(() => {
      if (!AppState.lockEnabled || AppState.isLocked || AppState.autoLockMinutes <= 0) return;
      const idle = (Date.now() - AppState.lastActivity) / 60000;
      if (idle >= AppState.autoLockMinutes) {
        this.lock();
        showToast(t('toast.locked'), 'info');
      }
    }, 15000);
  },

  checkOnLoad() {
    if (AppState.lockEnabled && AppState.lockHash) {
      this.lock();
    }
  }
};
