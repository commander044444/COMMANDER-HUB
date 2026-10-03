/* COMMANDER HUB - Application State */
const AppState = {
  language: 'fa',
  theme: 'dark',
  accent: 'blue',
  density: 'comfortable',
  radius: 'rounded',
  fontSize: 16,
  reducedMotion: false,
  currentView: 'dashboard',
  currentWorkspace: 'personal',
  workspaces: {},
  notes: [],
  tasks: [],
  events: [],
  portfolio: [],
  goals: [],
  activity: [],
  notifications: [],
  favorites: { crypto: [], music: [] },
  quickLinks: [],
  lockEnabled: false,
  lockHash: null,
  autoLockMinutes: 0,
  lastActivity: Date.now(),
  isLocked: false,
  editMode: false,
  weatherLocation: null,
  cryptoCache: null,
  cryptoCacheTime: 0,

  init() {
    this.language = Storage.load('language', 'fa');
    this.theme = Storage.load('theme', 'dark');
    this.accent = Storage.load('accent', 'blue');
    this.density = Storage.load('density', 'comfortable');
    this.radius = Storage.load('radius', 'rounded');
    this.fontSize = Storage.load('fontSize', 16);
    this.reducedMotion = Storage.load('reducedMotion', false);
    this.currentWorkspace = Storage.load('currentWorkspace', 'personal');
    this.workspaces = Storage.load('workspaces', this.defaultWorkspaces());
    this.notes = Storage.load('notes', []);
    this.tasks = Storage.load('tasks', []);
    this.events = Storage.load('events', []);
    this.portfolio = Storage.load('portfolio', []);
    this.goals = Storage.load('goals', []);
    this.activity = Storage.load('activity', []);
    this.notifications = Storage.load('notifications', []);
    this.favorites = Storage.load('favorites', { crypto: ['bitcoin', 'ethereum'], music: [] });
    this.quickLinks = Storage.load('quickLinks', this.defaultQuickLinks());
    this.lockEnabled = Storage.load('lockEnabled', false);
    this.lockHash = Storage.load('lockHash', null);
    this.autoLockMinutes = Storage.load('autoLockMinutes', 0);
    this.weatherLocation = Storage.load('weatherLocation', null);

    // Ensure default workspace layouts exist
    Object.keys(this.workspaces).forEach(id => {
      if (!this.workspaces[id].widgets) {
        this.workspaces[id].widgets = this.defaultWidgets();
      }
    });
  },

  defaultWorkspaces() {
    return {
      personal: { id: 'personal', nameKey: 'workspace.personal', widgets: this.defaultWidgets() },
      programming: { id: 'programming', nameKey: 'workspace.programming', widgets: this.defaultWidgets() },
      gaming: { id: 'gaming', nameKey: 'workspace.gaming', widgets: this.defaultWidgets() },
      finance: { id: 'finance', nameKey: 'workspace.finance', widgets: this.defaultWidgets() },
      study: { id: 'study', nameKey: 'workspace.study', widgets: this.defaultWidgets() }
    };
  },

  defaultWidgets() {
    return [
      { id: 'clock', type: 'clock', size: 'small', visible: true, order: 0 },
      { id: 'weather', type: 'weather', size: 'small', visible: true, order: 1 },
      { id: 'tasks', type: 'tasks', size: 'medium', visible: true, order: 2 },
      { id: 'crypto', type: 'crypto', size: 'medium', visible: true, order: 3 },
      { id: 'notes', type: 'notes', size: 'medium', visible: true, order: 4 },
      { id: 'goals', type: 'goals', size: 'small', visible: true, order: 5 },
      { id: 'quicklinks', type: 'quicklinks', size: 'small', visible: true, order: 6 },
      { id: 'news', type: 'news', size: 'medium', visible: true, order: 7 },
      { id: 'system', type: 'system', size: 'small', visible: true, order: 8 }
    ];
  },

  defaultQuickLinks() {
    return [
      { id: '1', name: 'Google', url: 'https://google.com', icon: '🔍' },
      { id: '2', name: 'GitHub', url: 'https://github.com', icon: '🐙' },
      { id: '3', name: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
      { id: '4', name: 'Twitter/X', url: 'https://x.com', icon: '🐦' },
      { id: '5', name: 'Wikipedia', url: 'https://wikipedia.org', icon: '📚' },
      { id: '6', name: 'Reddit', url: 'https://reddit.com', icon: '🤖' }
    ];
  },

  save() {
    Storage.save('language', this.language);
    Storage.save('theme', this.theme);
    Storage.save('accent', this.accent);
    Storage.save('density', this.density);
    Storage.save('radius', this.radius);
    Storage.save('fontSize', this.fontSize);
    Storage.save('reducedMotion', this.reducedMotion);
    Storage.save('currentWorkspace', this.currentWorkspace);
    Storage.save('workspaces', this.workspaces);
    Storage.save('notes', this.notes);
    Storage.save('tasks', this.tasks);
    Storage.save('events', this.events);
    Storage.save('portfolio', this.portfolio);
    Storage.save('goals', this.goals);
    Storage.save('activity', this.activity);
    Storage.save('notifications', this.notifications);
    Storage.save('favorites', this.favorites);
    Storage.save('quickLinks', this.quickLinks);
    Storage.save('lockEnabled', this.lockEnabled);
    Storage.save('lockHash', this.lockHash);
    Storage.save('autoLockMinutes', this.autoLockMinutes);
    Storage.save('weatherLocation', this.weatherLocation);
  },

  addActivity(text) {
    this.activity.unshift({
      id: Date.now().toString(),
      text,
      time: new Date().toISOString()
    });
    if (this.activity.length > 50) this.activity = this.activity.slice(0, 50);
    Storage.save('activity', this.activity);
  },

  addNotification(title, body) {
    this.notifications.unshift({
      id: Date.now().toString(),
      title,
      body,
      time: new Date().toISOString(),
      read: false
    });
    if (this.notifications.length > 30) this.notifications = this.notifications.slice(0, 30);
    Storage.save('notifications', this.notifications);
    updateNotifBadge();
  },

  getWorkspaceWidgets() {
    const ws = this.workspaces[this.currentWorkspace];
    return ws ? (ws.widgets || this.defaultWidgets()) : this.defaultWidgets();
  },

  setWorkspaceWidgets(widgets) {
    if (this.workspaces[this.currentWorkspace]) {
      this.workspaces[this.currentWorkspace].widgets = widgets;
      Storage.save('workspaces', this.workspaces);
    }
  }
};
