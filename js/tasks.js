/* COMMANDER HUB - Tasks */
const Tasks = {
  filter: 'all',
  searchQuery: '',

  render(container) {
    let tasks = [...AppState.tasks];
    const now = new Date();
    now.setHours(0,0,0,0);

    if (this.filter === 'active') tasks = tasks.filter(t => !t.completed);
    else if (this.filter === 'completed') tasks = tasks.filter(t => t.completed);
    else if (this.filter === 'overdue') {
      tasks = tasks.filter(t => !t.completed && t.due && new Date(t.due) < now);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      tasks = tasks.filter(t => (t.title || '').toLowerCase().includes(q));
    }

    const total = AppState.tasks.length;
    const done = AppState.tasks.filter(t => t.completed).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    let html = `
      <div class="view-header">
        <h1>${t('tasks.title')}</h1>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="Tasks.showEditor()">${t('tasks.new')}</button>
        </div>
      </div>
      <div class="task-progress">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-text">${t('tasks.progress')}: ${done}/${total} (${pct}%)</div>
      </div>
      <div class="tasks-toolbar">
        <input type="search" class="form-control" style="max-width:200px" placeholder="${t('common.search')}"
          value="${escapeAttr(this.searchQuery)}" oninput="Tasks.searchQuery=this.value; Tasks.render(document.getElementById('main-content'))">
        <div class="task-filters">
          <button class="filter-btn ${this.filter==='all'?'active':''}" onclick="Tasks.setFilter('all')">${t('tasks.filter.all')}</button>
          <button class="filter-btn ${this.filter==='active'?'active':''}" onclick="Tasks.setFilter('active')">${t('tasks.filter.active')}</button>
          <button class="filter-btn ${this.filter==='completed'?'active':''}" onclick="Tasks.setFilter('completed')">${t('tasks.filter.completed')}</button>
          <button class="filter-btn ${this.filter==='overdue'?'active':''}" onclick="Tasks.setFilter('overdue')">${t('tasks.filter.overdue')}</button>
        </div>
      </div>`;

    if (tasks.length === 0) {
      html += `<div class="empty-state">${t('tasks.empty')}</div>`;
    } else {
      html += '<div class="task-list">';
      tasks.forEach(task => {
        const overdue = !task.completed && task.due && new Date(task.due) < now;
        html += `
          <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-check ${task.completed ? 'checked' : ''}" onclick="Tasks.toggle('${task.id}')">${task.completed ? '✓' : ''}</div>
            <div class="task-content" onclick="Tasks.showEditor('${task.id}')" style="cursor:pointer">
              <div class="task-title">${escapeHtml(task.title)}</div>
              <div class="task-meta">
                ${task.priority ? `<span class="task-priority ${task.priority}">${t('tasks.priority.' + task.priority)}</span>` : ''}
                ${task.due ? `<span style="${overdue ? 'color:var(--danger)' : ''}">📅 ${formatDate(task.due)}</span>` : ''}
              </div>
            </div>
            <button class="btn-icon" onclick="Tasks.remove('${task.id}')" title="${t('common.delete')}">🗑️</button>
          </div>`;
      });
      html += '</div>';
    }
    container.innerHTML = html;
  },

  setFilter(f) {
    this.filter = f;
    this.render(document.getElementById('main-content'));
  },

  showEditor(id) {
    const task = id ? AppState.tasks.find(t => t.id === id) : null;
    const isNew = !task;
    const body = `
      <div class="form-group">
        <label>${t('tasks.placeholder')}</label>
        <input class="form-control" id="task-title" value="${escapeAttr(task?.title || '')}" placeholder="${t('tasks.placeholder')}">
      </div>
      <div class="form-group">
        <label>${t('tasks.due')}</label>
        <input type="date" class="form-control" id="task-due" value="${task?.due || ''}">
      </div>
      <div class="form-group">
        <label>${t('tasks.priority')}</label>
        <select class="form-control" id="task-priority">
          <option value="low" ${task?.priority==='low'?'selected':''}>${t('tasks.priority.low')}</option>
          <option value="medium" ${task?.priority==='medium'||!task?'selected':''}>${t('tasks.priority.medium')}</option>
          <option value="high" ${task?.priority==='high'?'selected':''}>${t('tasks.priority.high')}</option>
        </select>
      </div>`;

    const footer = `
      ${!isNew ? `<button class="btn btn-danger" onclick="Tasks.remove('${id}'); closeModal()">${t('common.delete')}</button>` : ''}
      <button class="btn btn-secondary" onclick="closeModal()">${t('common.cancel')}</button>
      <button class="btn btn-primary" onclick="Tasks.save('${id || ''}')">${t('common.save')}</button>`;

    showModal(isNew ? t('tasks.new') : t('tasks.edit'), body, footer);
  },

  save(id) {
    const title = document.getElementById('task-title').value.trim();
    if (!title) { showToast(t('common.error'), 'error'); return; }
    const due = document.getElementById('task-due').value || null;
    const priority = document.getElementById('task-priority').value;

    if (id) {
      const task = AppState.tasks.find(t => t.id === id);
      if (task) {
        task.title = title;
        task.due = due;
        task.priority = priority;
      }
    } else {
      AppState.tasks.unshift({
        id: Date.now().toString(),
        title,
        due,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
      });
      AppState.addActivity((AppState.language === 'fa' ? 'کار جدید: ' : 'New task: ') + title);
    }
    AppState.save();
    closeModal();
    renderCurrentView();
    showToast(t('toast.saved'), 'success');
  },

  toggle(id) {
    const task = AppState.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      AppState.save();
      if (AppState.currentView === 'tasks') this.render(document.getElementById('main-content'));
      else if (AppState.currentView === 'dashboard') renderCurrentView();
    }
  },

  remove(id) {
    if (!confirm(t('tasks.deleteConfirm'))) return;
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    AppState.save();
    renderCurrentView();
    showToast(t('toast.deleted'), 'success');
  }
};

const Goals = {
  add() {
    const text = prompt(t('goals.add'));
    if (!text || !text.trim()) return;
    AppState.goals.push({ id: Date.now().toString(), text: text.trim(), done: false });
    AppState.save();
    renderCurrentView();
  },
  toggle(id) {
    const g = AppState.goals.find(x => x.id === id);
    if (g) {
      g.done = !g.done;
      AppState.save();
      renderCurrentView();
    }
  }
};
