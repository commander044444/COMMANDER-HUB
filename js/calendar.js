/* COMMANDER HUB - Calendar */
const Calendar = {
  currentDate: new Date(),
  selectedDate: null,

  render(container) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const lang = AppState.language;
    const monthNames = t('calendar.monthsGreg');
    const dayNames = t('calendar.daysGreg');

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    let html = `
      <div class="view-header">
        <h1>${t('calendar.title')}</h1>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="Calendar.showEventEditor()">${t('calendar.newEvent')}</button>
        </div>
      </div>
      <div class="card" style="margin-bottom:1.5rem">
        <div class="calendar-header">
          <div class="calendar-nav">
            <button class="btn-icon" onclick="Calendar.prevMonth()">◀</button>
            <strong style="min-width:140px;text-align:center">${monthNames[month]} ${year}</strong>
            <button class="btn-icon" onclick="Calendar.nextMonth()">▶</button>
          </div>
          <button class="btn btn-secondary" onclick="Calendar.goToday()">${t('calendar.today')}</button>
        </div>
        <div class="calendar-grid">
          ${dayNames.map(d => `<div class="calendar-day-name">${d}</div>`).join('')}`;

    for (let i = 0; i < firstDay; i++) {
      const prevDate = new Date(year, month, -firstDay + i + 1);
      html += `<div class="calendar-day other-month">${prevDate.getDate()}</div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = date.toISOString().slice(0, 10);
      const isToday = date.getTime() === today.getTime();
      const isSelected = this.selectedDate === iso;
      const hasEvent = AppState.events.some(e => e.date === iso);
      html += `<div class="calendar-day ${isToday?'today':''} ${isSelected?'selected':''} ${hasEvent?'has-event':''}" 
        onclick="Calendar.selectDate('${iso}')">${d}</div>`;
    }

    html += `</div></div>
      <div class="card">
        <h3 style="margin-bottom:1rem">${t('calendar.upcoming')}</h3>
        <div id="events-list">${this.renderEventsList()}</div>
      </div>`;

    container.innerHTML = html;
  },

  renderEventsList() {
    const upcoming = AppState.events
      .filter(e => e.date >= new Date().toISOString().slice(0, 10))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
      .slice(0, 10);

    if (upcoming.length === 0) return `<div class="empty-state">${t('calendar.noEvents')}</div>`;
    return upcoming.map(e => `
      <div class="event-item" onclick="Calendar.showEventEditor('${e.id}')" style="cursor:pointer">
        <div class="event-time">${e.time || '—'}</div>
        <div>
          <div style="font-weight:500">${escapeHtml(e.title)}</div>
          <div style="font-size:0.8rem;color:var(--text-muted)">${formatDate(e.date)}</div>
        </div>
      </div>`).join('');
  },

  renderMini(el) {
    if (!el) return;
    const now = new Date();
    const events = AppState.events
      .filter(e => e.date >= now.toISOString().slice(0, 10))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
    if (events.length === 0) {
      el.innerHTML = `<div class="empty-state" style="padding:1rem">${t('calendar.noEvents')}</div>`;
      return;
    }
    el.innerHTML = events.map(e => `
      <div style="padding:0.4rem 0;font-size:0.85rem;border-bottom:1px solid var(--border-color)">
        <strong>${escapeHtml(e.title)}</strong>
        <div style="font-size:0.75rem;color:var(--text-muted)">${formatDate(e.date)} ${e.time || ''}</div>
      </div>`).join('');
  },

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render(document.getElementById('main-content'));
  },
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render(document.getElementById('main-content'));
  },
  goToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date().toISOString().slice(0, 10);
    this.render(document.getElementById('main-content'));
  },
  selectDate(iso) {
    this.selectedDate = iso;
    this.render(document.getElementById('main-content'));
  },

  showEventEditor(id) {
    const event = id ? AppState.events.find(e => e.id === id) : null;
    const isNew = !event;
    const body = `
      <div class="form-group">
        <label>${t('calendar.eventTitle')}</label>
        <input class="form-control" id="event-title" value="${escapeAttr(event?.title || '')}">
      </div>
      <div class="form-group">
        <label>${t('calendar.eventDesc')}</label>
        <textarea class="form-control" id="event-desc" rows="3">${escapeHtml(event?.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label>${t('calendar.eventDate')}</label>
        <input type="date" class="form-control" id="event-date" value="${event?.date || this.selectedDate || new Date().toISOString().slice(0,10)}">
      </div>
      <div class="form-group">
        <label>${t('calendar.eventTime')}</label>
        <input type="time" class="form-control" id="event-time" value="${event?.time || ''}">
      </div>`;

    const footer = `
      ${!isNew ? `<button class="btn btn-danger" onclick="Calendar.remove('${id}'); closeModal()">${t('common.delete')}</button>` : ''}
      <button class="btn btn-secondary" onclick="closeModal()">${t('common.cancel')}</button>
      <button class="btn btn-primary" onclick="Calendar.save('${id || ''}')">${t('common.save')}</button>`;

    showModal(isNew ? t('calendar.newEvent') : t('calendar.editEvent'), body, footer);
  },

  save(id) {
    const title = document.getElementById('event-title').value.trim();
    if (!title) { showToast(t('common.error'), 'error'); return; }
    const description = document.getElementById('event-desc').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;

    if (id) {
      const e = AppState.events.find(x => x.id === id);
      if (e) { e.title = title; e.description = description; e.date = date; e.time = time; }
    } else {
      AppState.events.push({
        id: Date.now().toString(),
        title, description, date, time,
        createdAt: new Date().toISOString()
      });
      AppState.addActivity((AppState.language === 'fa' ? 'رویداد جدید: ' : 'New event: ') + title);
    }
    AppState.save();
    closeModal();
    this.render(document.getElementById('main-content'));
    showToast(t('toast.saved'), 'success');
  },

  remove(id) {
    if (!confirm(t('calendar.deleteConfirm'))) return;
    AppState.events = AppState.events.filter(e => e.id !== id);
    AppState.save();
    this.render(document.getElementById('main-content'));
    showToast(t('toast.deleted'), 'success');
  }
};
