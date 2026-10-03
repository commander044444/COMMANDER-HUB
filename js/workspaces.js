/* COMMANDER HUB - Workspaces */
const Workspaces = {
  initSelect() {
    const select = document.getElementById('workspace-select');
    if (!select) return;
    select.innerHTML = '';
    Object.values(AppState.workspaces).forEach(ws => {
      const opt = document.createElement('option');
      opt.value = ws.id;
      opt.textContent = ws.name || t(ws.nameKey) || ws.id;
      if (ws.id === AppState.currentWorkspace) opt.selected = true;
      select.appendChild(opt);
    });
    select.onchange = () => {
      AppState.currentWorkspace = select.value;
      AppState.save();
      if (AppState.currentView === 'dashboard') renderCurrentView();
      showToast((AppState.language === 'fa' ? 'فضای کاری: ' : 'Workspace: ') + (select.options[select.selectedIndex].text), 'info');
    };
  },

  create(name) {
    if (!name || !name.trim()) return false;
    const id = 'ws_' + Date.now();
    AppState.workspaces[id] = {
      id,
      name: name.trim(),
      widgets: AppState.defaultWidgets()
    };
    AppState.currentWorkspace = id;
    AppState.save();
    this.initSelect();
    AppState.addActivity((AppState.language === 'fa' ? 'فضای کاری ایجاد شد: ' : 'Workspace created: ') + name);
    return true;
  },

  rename(id, newName) {
    if (AppState.workspaces[id] && newName.trim()) {
      AppState.workspaces[id].name = newName.trim();
      AppState.save();
      this.initSelect();
      return true;
    }
    return false;
  },

  delete(id) {
    if (Object.keys(AppState.workspaces).length <= 1) {
      showToast(AppState.language === 'fa' ? 'حداقل یک فضای کاری لازم است' : 'At least one workspace required', 'error');
      return false;
    }
    if (!confirm(t('confirm.delete'))) return false;
    delete AppState.workspaces[id];
    if (AppState.currentWorkspace === id) {
      AppState.currentWorkspace = Object.keys(AppState.workspaces)[0];
    }
    AppState.save();
    this.initSelect();
    if (AppState.currentView === 'dashboard') renderCurrentView();
    return true;
  }
};
