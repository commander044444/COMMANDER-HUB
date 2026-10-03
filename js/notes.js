/* COMMANDER HUB - Notes */
const Notes = {
  filter: 'all',
  searchQuery: '',

  render(container) {
    let notes = [...AppState.notes];
    if (this.filter === 'pinned') notes = notes.filter(n => n.pinned);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      notes = notes.filter(n => 
        (n.title || '').toLowerCase().includes(q) || 
        (n.content || '').toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    let html = `
      <div class="view-header">
        <h1>${t('notes.title')}</h1>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="Notes.showEditor()">${t('notes.new')}</button>
        </div>
      </div>
      <div class="notes-toolbar">
        <input type="search" class="form-control" style="max-width:240px" placeholder="${t('notes.search')}" 
          value="${escapeAttr(this.searchQuery)}" oninput="Notes.searchQuery=this.value; Notes.render(document.getElementById('main-content'))">
        <div class="task-filters">
          <button class="filter-btn ${this.filter==='all'?'active':''}" onclick="Notes.filter='all';Notes.render(document.getElementById('main-content'))">${t('notes.all')}</button>
          <button class="filter-btn ${this.filter==='pinned'?'active':''}" onclick="Notes.filter='pinned';Notes.render(document.getElementById('main-content'))">${t('notes.pinned')}</button>
        </div>
      </div>`;

    if (notes.length === 0) {
      html += `<div class="empty-state">${t('notes.empty')}</div>`;
    } else {
      html += '<div class="notes-list">';
      notes.forEach(n => {
        html += `
          <div class="note-card ${n.pinned ? 'pinned' : ''}" onclick="Notes.showEditor('${n.id}')">
            <div class="note-title">${escapeHtml(n.title || 'Untitled')}</div>
            <div class="note-preview">${escapeHtml((n.content || '').slice(0, 120))}</div>
            ${n.tags && n.tags.length ? `<div class="note-tags">${n.tags.map(tg => `<span class="tag">${escapeHtml(tg)}</span>`).join('')}</div>` : ''}
            <div class="note-meta">
              <span>${formatRelative(n.updatedAt || n.createdAt)}</span>
              <span>${(n.content || '').length} ${t('notes.chars')}</span>
            </div>
          </div>`;
      });
      html += '</div>';
    }
    container.innerHTML = html;
  },

  showEditor(id) {
    const note = id ? AppState.notes.find(n => n.id === id) : null;
    const isNew = !note;
    const title = isNew ? t('notes.new') : t('notes.edit');
    
    const body = `
      <div class="form-group">
        <label>${t('notes.placeholder')}</label>
        <input class="form-control" id="note-title" value="${escapeAttr(note?.title || '')}" placeholder="${t('notes.placeholder')}">
      </div>
      <div class="form-group">
        <label>${t('notes.content')}</label>
        <textarea class="form-control" id="note-content" rows="8" placeholder="${t('notes.content')}">${escapeHtml(note?.content || '')}</textarea>
        <div style="text-align:end;font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem">
          <span id="note-char-count">${(note?.content || '').length}</span> ${t('notes.chars')}
        </div>
      </div>
      <div class="form-group">
        <label>${t('notes.tags')}</label>
        <input class="form-control" id="note-tags" value="${escapeAttr((note?.tags || []).join(', '))}" placeholder="${t('notes.tags')}">
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="note-pinned" ${note?.pinned ? 'checked' : ''}>
          ${t('notes.pin')}
        </label>
      </div>`;

    const footer = `
      ${!isNew ? `<button class="btn btn-danger" onclick="Notes.remove('${id}'); closeModal()">${t('common.delete')}</button>` : ''}
      <button class="btn btn-secondary" onclick="closeModal()">${t('common.cancel')}</button>
      <button class="btn btn-primary" onclick="Notes.save('${id || ''}')">${t('common.save')}</button>`;

    showModal(title, body, footer);

    document.getElementById('note-content').addEventListener('input', function() {
      document.getElementById('note-char-count').textContent = this.value.length;
    });
  },

  save(id) {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value;
    const tagsStr = document.getElementById('note-tags').value;
    const pinned = document.getElementById('note-pinned').checked;
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    if (!title && !content) {
      showToast(t('common.error'), 'error');
      return;
    }

    const now = new Date().toISOString();
    if (id) {
      const note = AppState.notes.find(n => n.id === id);
      if (note) {
        note.title = title;
        note.content = content;
        note.tags = tags;
        note.pinned = pinned;
        note.updatedAt = now;
      }
    } else {
      AppState.notes.unshift({
        id: Date.now().toString(),
        title,
        content,
        tags,
        pinned,
        createdAt: now,
        updatedAt: now
      });
      AppState.addActivity((AppState.language === 'fa' ? 'یادداشت جدید: ' : 'New note: ') + (title || 'Untitled'));
    }
    AppState.save();
    closeModal();
    renderCurrentView();
    showToast(t('toast.saved'), 'success');
  },

  remove(id) {
    if (!confirm(t('notes.deleteConfirm'))) return;
    AppState.notes = AppState.notes.filter(n => n.id !== id);
    AppState.save();
    renderCurrentView();
    showToast(t('toast.deleted'), 'success');
  }
};
