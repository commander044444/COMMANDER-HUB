/* COMMANDER HUB - Dashboard */
const Dashboard = {
  render(container) {
    const widgets = AppState.getWorkspaceWidgets()
      .filter(w => w.visible)
      .sort((a, b) => a.order - b.order);

    let html = `
      <div class="view-header">
        <h1>${t('dashboard.title')}</h1>
        <div class="view-actions">
          <button class="btn btn-secondary" onclick="Dashboard.toggleEdit()">${AppState.editMode ? t('dashboard.done') : t('dashboard.customize')}</button>
          ${AppState.editMode ? `<button class="btn btn-secondary" onclick="Dashboard.showAddWidget()">${t('dashboard.addWidget')}</button>
          <button class="btn btn-danger" onclick="Dashboard.resetLayout()">${t('dashboard.reset')}</button>` : ''}
        </div>
      </div>
      <div class="dashboard-grid" id="dashboard-grid">`;

    widgets.forEach(w => {
      html += `<div class="widget ${AppState.editMode ? 'edit-mode' : ''}" data-id="${w.id}" data-type="${w.type}" data-size="${w.size}">
        <div id="widget-body-${w.id}"></div>
        ${AppState.editMode ? `<div class="widget-actions" style="margin-top:0.5rem;justify-content:flex-end">
          <button class="btn-icon" onclick="Dashboard.hideWidget('${w.id}')" title="Hide">👁️</button>
          <button class="btn-icon" onclick="Dashboard.removeWidget('${w.id}')" title="Remove">🗑️</button>
        </div>` : ''}
      </div>`;
    });

    html += '</div>';
    container.innerHTML = html;

    widgets.forEach(w => {
      const body = document.getElementById('widget-body-' + w.id);
      if (body) Widgets.render(w.type, body);
    });
  },

  toggleEdit() {
    AppState.editMode = !AppState.editMode;
    renderCurrentView();
  },

  hideWidget(id) {
    const widgets = AppState.getWorkspaceWidgets();
    const w = widgets.find(x => x.id === id);
    if (w) {
      w.visible = false;
      AppState.setWorkspaceWidgets(widgets);
      renderCurrentView();
    }
  },

  removeWidget(id) {
    let widgets = AppState.getWorkspaceWidgets().filter(x => x.id !== id);
    AppState.setWorkspaceWidgets(widgets);
    renderCurrentView();
  },

  showAddWidget() {
    const existing = AppState.getWorkspaceWidgets().map(w => w.type);
    const allTypes = ['clock','weather','tasks','notes','crypto','portfolio','goals','quicklinks','news','system','calendar','activity','music','search'];
    const available = allTypes.filter(t => !existing.includes(t));
    
    if (available.length === 0) {
      showToast(AppState.language === 'fa' ? 'همه ویجت‌ها اضافه شده‌اند' : 'All widgets already added', 'info');
      return;
    }

    let options = available.map(type => 
      `<button class="btn btn-secondary" style="margin:0.25rem" onclick="Dashboard.addWidget('${type}'); closeModal()">${t('widget.' + type)}</button>`
    ).join('');

    showModal(t('dashboard.addWidget'), `<div style="display:flex;flex-wrap:wrap;gap:0.5rem">${options}</div>`);
  },

  addWidget(type) {
    const widgets = AppState.getWorkspaceWidgets();
    const maxOrder = widgets.reduce((m, w) => Math.max(m, w.order), 0);
    widgets.push({
      id: type + '_' + Date.now(),
      type,
      size: 'medium',
      visible: true,
      order: maxOrder + 1
    });
    AppState.setWorkspaceWidgets(widgets);
    renderCurrentView();
    showToast(t('toast.saved'), 'success');
  },

  resetLayout() {
    if (!confirm(t('confirm.delete'))) return;
    const ws = AppState.workspaces[AppState.currentWorkspace];
    if (ws) {
      ws.widgets = AppState.defaultWidgets();
      AppState.setWorkspaceWidgets(ws.widgets);
      AppState.editMode = false;
      renderCurrentView();
      showToast(t('toast.saved'), 'success');
    }
  }
};
