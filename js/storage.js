/* COMMANDER HUB - Storage Layer */
const Storage = {
  PREFIX: 'commander_hub_',

  save(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage save error:', e);
      return false;
    }
  },

  load(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Storage load error:', e);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (e) {
      return false;
    }
  },

  clear() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.PREFIX)) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (e) {
      return false;
    }
  },

  exportAll() {
    const data = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.PREFIX)) {
          data[k.replace(this.PREFIX, '')] = JSON.parse(localStorage.getItem(k));
        }
      }
      data._exportMeta = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        app: 'COMMANDER HUB'
      };
      return data;
    } catch (e) {
      console.error('Export error:', e);
      return null;
    }
  },

  importAll(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data._exportMeta || data._exportMeta.app !== 'COMMANDER HUB') {
      return { ok: false, error: 'invalid' };
    }
    try {
      Object.keys(data).forEach(key => {
        if (key === '_exportMeta') return;
        this.save(key, data[key]);
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  getUsage() {
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.PREFIX)) {
          total += (localStorage.getItem(k) || '').length;
        }
      }
    } catch (e) {}
    return total;
  }
};
