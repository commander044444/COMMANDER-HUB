/* COMMANDER HUB — Full-screen interactive chat for Assistant */
const AssistantChat = {
  open: false,
  messages: [],
  typing: false,
  memory: {},
  sessionId: null,
  lastIntent: null,
  _typeTimer: null,
  _returnView: null,

  init() {
    this.sessionId = Storage.load('assistantChatSession', null) || ('s' + Date.now());
    Storage.save('assistantChatSession', this.sessionId);
    this.messages = Storage.load('assistantChatMessages', []) || [];
    this.memory = Storage.load('assistantChatMemory', {}) || {};
    if (!document.getElementById('assistant-chat')) this.inject();
    this.bind();
  },

  inject() {
    const el = document.createElement('div');
    el.id = 'assistant-chat';
    el.className = 'assistant-chat hidden';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'COMMANDER Assistant Chat');
    el.innerHTML = `
      <div class="achat-shell">
        <header class="achat-header">
          <button type="button" class="achat-back btn-icon" id="achat-back" aria-label="Back">←</button>
          <div class="achat-avatar" aria-hidden="true">🤖</div>
          <div class="achat-meta">
            <div class="achat-name">COMMANDER Assistant</div>
            <div class="achat-status"><span class="achat-dot"></span> Online</div>
          </div>
          <button type="button" class="btn-icon" id="achat-prefs" title="Settings">⚙️</button>
        </header>
        <div class="achat-messages" id="achat-messages"></div>
        <div class="achat-suggestions" id="achat-suggestions"></div>
        <form class="achat-inputbar" id="achat-form">
          <button type="button" class="btn-icon" id="achat-plus" title="Actions">+</button>
          <input type="text" id="achat-input" autocomplete="off" placeholder="پیام بنویس..." maxlength="800">
          <button type="submit" class="achat-send" id="achat-send" aria-label="Send">➤</button>
        </form>
      </div>`;
    document.body.appendChild(el);
  },

  bind() {
    document.getElementById('achat-back')?.addEventListener('click', () => this.close());
    document.getElementById('achat-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendUser();
    });
    document.getElementById('achat-prefs')?.addEventListener('click', () => this.showPrefs());
    document.getElementById('achat-plus')?.addEventListener('click', () => this.showQuickActions());
  },

  openChat(opts = {}) {
    if (typeof Assistant !== 'undefined' && Assistant.settings && !Assistant.settings.enabled) return;
    this._returnView = AppState.currentView || 'dashboard';
    this.open = true;
    const root = document.getElementById('assistant-chat');
    root.classList.remove('hidden');
    document.body.classList.add('achat-open');
    this.renderAll();
    const input = document.getElementById('achat-input');
    if (input) {
      input.placeholder = (AppState.language === 'fa') ? 'پیام بنویس...' : 'Type a message...';
      setTimeout(() => input.focus(), 200);
    }
    if (!this.messages.length) {
      this.greetFirst();
    } else if (opts.fresh) {
      this.pushAssistant(this.pick('returning'), { suggestions: this.defaultSuggestions() });
    }
  },

  close() {
    this.open = false;
    document.getElementById('assistant-chat')?.classList.add('hidden');
    document.body.classList.remove('achat-open');
    this.save();
  },

  save() {
    const keep = (this.messages || []).slice(-80);
    Storage.save('assistantChatMessages', keep);
    Storage.save('assistantChatMemory', this.memory);
  },

  lang() {
    return (AppState && AppState.language) || 'fa';
  },

  pick(cat) {
    if (typeof Assistant !== 'undefined' && Assistant.pick) {
      try { return Assistant.pick(cat); } catch (e) {}
    }
    if (typeof AssistantMessages !== 'undefined') {
      const list = AssistantMessages.list(this.lang(), cat);
      if (list && list.length) return list[Math.floor(Math.random() * list.length)];
    }
    const fa = {
      welcome: 'سلام Commander 👋 من اینجام. چه کمکی از دستم برمیاد؟',
      returning: 'دوباره اینجایی. بگو چی لازم داری.',
      greeting: 'سلام! خوبم، تو چطوری؟',
      help: 'بگو کجا گیر کردی تا راهنمایی کنم.',
      nav: 'حتماً، الان می‌برم.',
      searchAsk: 'می‌خوای خلاصه کنم یا ببرمت Google؟',
      noWeb: 'در این محیط جست‌وجوی وب واقعی ندارم؛ می‌تونم Google را برات باز کنم یا داخل HUB راهنمایی کنم.',
      location: 'موقعیت جعلی نمی‌سازم. اگر اجازهٔ موقعیت بدهی، برای آب‌وهوا استفاده می‌شود؛ برای مکان‌های نزدیک Google Maps را باز می‌کنم.',
      unknown: 'متوجه نشدم. می‌تونی ساده‌تر بگی یا از دکمه‌های زیر استفاده کنی.'
    };
    const en = {
      welcome: 'Hi Commander 👋 I’m here. How can I help?',
      returning: 'Welcome back. What do you need?',
      greeting: 'Hey! I’m good — how are you?',
      help: 'Tell me where you’re stuck and I’ll guide you.',
      nav: 'Sure — opening that now.',
      searchAsk: 'Summarize here or open Google?',
      noWeb: 'No live web search here. I can open Google or guide you inside HUB.',
      location: 'I won’t invent places. Grant location for weather, or I’ll open Google Maps for a query.',
      unknown: 'Didn’t catch that. Try simpler wording or use the suggestions.'
    };
    return (this.lang() === 'fa' ? fa : en)[cat] || (this.lang() === 'fa' ? fa.unknown : en.unknown);
  },

  defaultSuggestions() {
    const fa = this.lang() === 'fa';
    return [
      { label: fa ? '🔎 جستجو در Google' : '🔎 Google search', action: 'google' },
      { label: fa ? '🧭 راهنمایی سایت' : '🧭 Site help', action: 'help' },
      { label: fa ? '⚙️ تنظیمات دستیار' : '⚙️ Assistant settings', action: 'prefs' },
      { label: fa ? '🏠 داشبورد' : '🏠 Dashboard', action: 'nav:dashboard' }
    ];
  },

  greetFirst() {
    this.pushAssistant(this.pick('welcome'), {
      suggestions: this.defaultSuggestions(),
      animate: true
    });
  },

  pushUser(text) {
    const id = 'u' + Date.now() + Math.random().toString(36).slice(2, 6);
    const msg = { id, role: 'user', text, ts: Date.now(), status: 'sent' };
    this.messages.push(msg);
    this.renderAll();
    this.scrollBottom();
    // tick to read after process starts
    setTimeout(() => {
      const m = this.messages.find(x => x.id === id);
      if (m) { m.status = 'read'; this.renderAll(); }
    }, 400);
    this.save();
    return msg;
  },

  pushAssistant(text, opts = {}) {
    const id = 'a' + Date.now() + Math.random().toString(36).slice(2, 6);
    const msg = {
      id, role: 'assistant', text: opts.animate ? '' : text, fullText: text,
      ts: Date.now(), suggestions: opts.suggestions || null, meta: opts.meta || null
    };
    this.messages.push(msg);
    this.renderAll();
    this.scrollBottom();
    if (opts.animate && (typeof Assistant === 'undefined' || (Assistant.settings?.animations !== false && Assistant.settings?.typingAnimation !== false))) {
      this.typeOut(msg, text);
    } else {
      msg.text = text;
      this.renderAll();
    }
    this.save();
    return msg;
  },

  typeOut(msg, full) {
    this.typing = false;
    this.hideTyping();
    let i = 0;
    const step = () => {
      i += Math.max(1, Math.floor(full.length / 40));
      if (i >= full.length) {
        msg.text = full;
        this.renderAll();
        this.scrollBottom();
        return;
      }
      msg.text = full.slice(0, i);
      this.renderAll(true);
      this.scrollBottom();
      this._typeTimer = setTimeout(step, 18);
    };
    step();
  },

  showTyping() {
    this.typing = true;
    const box = document.getElementById('achat-messages');
    if (!box) return;
    if (document.getElementById('achat-typing')) return;
    const d = document.createElement('div');
    d.id = 'achat-typing';
    d.className = 'achat-row assistant';
    d.innerHTML = `<div class="achat-bubble typing"><span></span><span></span><span></span></div>`;
    box.appendChild(d);
    this.scrollBottom();
  },

  hideTyping() {
    this.typing = false;
    document.getElementById('achat-typing')?.remove();
  },

  renderAll(partial) {
    const box = document.getElementById('achat-messages');
    if (!box) return;
    const fa = this.lang() === 'fa';
    box.innerHTML = this.messages.map(m => {
      if (m.role === 'user') {
        const ticks = m.status === 'read' ? '✓✓' : '✓';
        return `<div class="achat-row user" data-id="${m.id}">
          <div class="achat-bubble user">${escapeHtml(m.text)}
            <div class="achat-meta-line"><span>${this.fmtTime(m.ts)}</span><span class="achat-ticks">${ticks}</span></div>
          </div></div>`;
      }
      let actions = '';
      if (m.suggestions && m.suggestions.length) {
        actions = `<div class="achat-actions">${m.suggestions.map(s =>
          `<button type="button" class="achat-chip" data-act="${escapeAttr(s.action)}">${escapeHtml(s.label)}</button>`
        ).join('')}</div>`;
      }
      const meta = m.meta ? `<div class="achat-footnote">${escapeHtml(m.meta)}</div>` : '';
      return `<div class="achat-row assistant" data-id="${m.id}">
        <div class="achat-bubble assistant">${escapeHtml(m.text)}${meta}
          <div class="achat-meta-line"><span>${this.fmtTime(m.ts)}</span></div>
        </div>${actions}</div>`;
    }).join('');
    box.querySelectorAll('.achat-chip').forEach(btn => {
      btn.addEventListener('click', () => this.runChip(btn.dataset.act));
    });
    if (this.typing) this.showTyping();
  },

  fmtTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString(this.lang() === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  },

  scrollBottom() {
    const box = document.getElementById('achat-messages');
    if (box) box.scrollTop = box.scrollHeight;
  },

  sendUser() {
    const input = document.getElementById('achat-input');
    if (!input) return;
    const text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    this.pushUser(text);
    this.rememberFromUser(text);
    this.respond(text);
  },

  rememberFromUser(text) {
    // simple memory: "اسم ... X هست"
    const faName = text.match(/اسم(?:\s+این)?\s*(?:پروژه|پروژه‌)?\s*(?:را\s*)?(?:هست|است|:)?\s*([^\n]{2,40})/i);
    const enName = text.match(/(?:project\s+name|name\s+is|called)\s+([^\n.]{2,40})/i);
    if (faName) this.memory.projectName = faName[1].replace(/[؟?!.]/g, '').trim();
    if (enName) this.memory.projectName = enName[1].replace(/[؟?!.]/g, '').trim();
    if (/اسم پروژه چی بود|what.*(project)?\s*name/i.test(text) && this.memory.projectName) {
      /* handled in respond */
    }
    this.save();
  },

  classify(text) {
    const t = text.trim();
    const low = t.toLowerCase();
    if (/^(سلام|درود|هی|hello|hi|hey)\b/i.test(t) || /خوبی\??|how are you/i.test(t)) return 'greeting';
    if (/اسم پروژه چی بود|what was the (project )?name/i.test(t)) return 'memory';
    if (/منو ببر|باز کن|برو به|open |go to |navigate/i.test(t)) return 'navigate';
    if (/google|گوگل|سرچ کن|search for/i.test(t)) return 'google';
    if (/رستوران|نزدیک من|موقعیت|location|maps|مکان/i.test(t)) return 'location';
    if (/راهنما|کمک|help|چطور|how (do|to)|settings دستیار/i.test(t)) return 'help';
    if (/هوا|آب\s*و\s*هوا|weather/i.test(t)) return 'weather';
    if (t.length > 12 && !/^(ممنون|مرسی|ok|باشه|thanks)/i.test(t)) return 'search';
    return 'chat';
  },

  async respond(text) {
    const intent = this.classify(text);
    this.lastIntent = intent;
    this.showTyping();
    await this.wait(500 + Math.random() * 400);

    if (intent === 'greeting') {
      this.hideTyping();
      this.pushAssistant(this.pick('greeting'), { animate: true, suggestions: this.defaultSuggestions() });
      return;
    }
    if (intent === 'memory') {
      this.hideTyping();
      const name = this.memory.projectName;
      const msg = name
        ? (this.lang() === 'fa' ? name : name)
        : (this.lang() === 'fa' ? 'هنوز اسمی در این نشست ذخیره نشده.' : 'No name saved in this session yet.');
      this.pushAssistant(msg, { animate: true });
      return;
    }
    if (intent === 'navigate') {
      const view = this.parseNav(text);
      this.hideTyping();
      if (view) {
        this.pushAssistant(this.pick('nav'), { animate: true });
        setTimeout(() => {
          this.close();
          if (view === 'profile') document.getElementById('user-profile')?.click();
          else navigateTo(view);
        }, 600);
      } else {
        this.pushAssistant(this.lang() === 'fa'
          ? 'کدوم بخش؟ داشبورد، کارها، یادداشت، رمزارز، اخبار، تقویم، تنظیمات…'
          : 'Which section? dashboard, tasks, notes, crypto, news, calendar, settings…',
          { animate: true, suggestions: [
            { label: '🏠 Dashboard', action: 'nav:dashboard' },
            { label: '✅ Tasks', action: 'nav:tasks' },
            { label: '⚙️ Settings', action: 'nav:settings' }
          ]});
      }
      return;
    }
    if (intent === 'google') {
      const q = text.replace(/google|گوگل|سرچ کن|search for|جستجو کن/gi, '').trim() || text;
      await this.handleSearch(q, true);
      return;
    }
    if (intent === 'location') {
      this.hideTyping();
      this.pushAssistant(this.pick('location'), {
        animate: true,
        suggestions: [
          { label: this.lang() === 'fa' ? '🌐 Google Maps' : '🌐 Google Maps', action: 'maps:' + encodeURIComponent(text) },
          { label: this.lang() === 'fa' ? '🌤️ آب‌وهوا' : '🌤️ Weather', action: 'nav:dashboard' }
        ]
      });
      return;
    }
    if (intent === 'weather') {
      this.hideTyping();
      this.pushAssistant(this.lang() === 'fa'
        ? 'برای هوا از ویجت آب‌وهوا استفاده کن؛ عدد جعلی نمی‌سازم. الان می‌برم داشبورد.'
        : 'Use the weather widget — I won’t invent numbers. Opening dashboard.',
        { animate: true });
      setTimeout(() => { this.close(); navigateTo('dashboard'); }, 700);
      return;
    }
    if (intent === 'help') {
      this.hideTyping();
      this.pushAssistant(this.helpText(), { animate: true, suggestions: this.defaultSuggestions() });
      return;
    }
    if (intent === 'search') {
      await this.handleSearch(text, false);
      return;
    }
    this.hideTyping();
    this.pushAssistant(this.pick('unknown'), { animate: true, suggestions: this.defaultSuggestions() });
  },

  parseNav(text) {
    const map = [
      [/داشبورد|dashboard|خانه|home/i, 'dashboard'],
      [/تنظیمات|settings/i, 'settings'],
      [/کارها|tasks|todo/i, 'tasks'],
      [/یادداشت|notes/i, 'notes'],
      [/رمزارز|crypto|bitcoin/i, 'crypto'],
      [/پورتفولیو|portfolio/i, 'portfolio'],
      [/اخبار|news/i, 'news'],
      [/تقویم|calendar/i, 'calendar'],
      [/موسیقی|music/i, 'music'],
      [/پروفایل|profile/i, 'profile']
    ];
    for (const [re, v] of map) if (re.test(text)) return v;
    return null;
  },

  helpText() {
    if (this.lang() === 'fa') {
      return 'از منو جابه‌جا شو، Ctrl+K برای جست‌وجو، 🤖 برای همین چت. می‌تونم ببرمت بخش‌ها، Google را باز کنم، یا داخل HUB راهنمایی کنم. داده حساس را نگه نمی‌دارم مگر چیزی که خودت در این نشست بگی.';
    }
    return 'Use the sidebar, Ctrl+K to search, 🤖 for this chat. I can open sections, Google, or guide you inside HUB. I only remember what you tell me this session.';
  },

  searchPref() {
    return (typeof Assistant !== 'undefined' && Assistant.settings?.searchBehavior) || 'ask';
  },

  async handleSearch(query, forceGoogle) {
    const pref = this.searchPref();
    const q = (query || '').trim();
    if (!q) {
      this.hideTyping();
      this.pushAssistant(this.lang() === 'fa' ? 'چی را جست‌وجو کنم؟' : 'What should I search?', { animate: true });
      return;
    }

    if (forceGoogle || pref === 'google') {
      this.hideTyping();
      this.pushAssistant(this.lang() === 'fa' ? `🌐 Google را برای «${q}» باز می‌کنم.` : `Opening Google for “${q}”.`, { animate: true });
      window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank', 'noopener');
      return;
    }

    if (pref === 'ask') {
      this.hideTyping();
      this.pushAssistant(this.pick('searchAsk'), {
        animate: true,
        suggestions: [
          { label: this.lang() === 'fa' ? '🧠 خلاصه در HUB' : '🧠 Summarize in HUB', action: 'summarize:' + encodeURIComponent(q) },
          { label: '🌐 Google', action: 'googleq:' + encodeURIComponent(q) }
        ]
      });
      return;
    }

    // always summarize — honest: no fake web crawl
    this.hideTyping();
    this.pushAssistant(this.lang() === 'fa' ? `🔎 Search:\n«${q}»` : `🔎 Search:\n“${q}”`, { animate: false });
    this.showTyping();
    await this.wait(600);
    this.hideTyping();
    this.pushAssistant(this.pick('noWeb'), {
      animate: true,
      suggestions: [
        { label: '🌐 Google', action: 'googleq:' + encodeURIComponent(q) },
        { label: this.lang() === 'fa' ? '🔎 جست‌وجو در HUB' : '🔎 Search HUB', action: 'hubsearch:' + encodeURIComponent(q) }
      ]
    });
  },

  runChip(act) {
    if (!act) return;
    if (act === 'google') {
      document.getElementById('achat-input').value = '';
      document.getElementById('achat-input').placeholder = this.lang() === 'fa' ? 'عبارت Google را بنویس...' : 'Type Google query...';
      document.getElementById('achat-input').focus();
      this.lastIntent = 'google_pending';
      return;
    }
    if (act === 'help') {
      this.pushUser(this.lang() === 'fa' ? 'راهنمایی می‌خوام' : 'I need help');
      this.respond(this.lang() === 'fa' ? 'راهنمایی می‌خوام' : 'I need help');
      return;
    }
    if (act === 'prefs') { this.showPrefs(); return; }
    if (act.startsWith('nav:')) {
      const v = act.slice(4);
      this.close();
      navigateTo(v);
      return;
    }
    if (act.startsWith('googleq:')) {
      const q = decodeURIComponent(act.slice(8));
      window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank', 'noopener');
      this.pushAssistant(this.lang() === 'fa' ? 'Google باز شد.' : 'Google opened.', { animate: true });
      return;
    }
    if (act.startsWith('summarize:')) {
      const q = decodeURIComponent(act.slice(10));
      const prev = (typeof Assistant !== 'undefined') ? Assistant.settings.searchBehavior : 'ask';
      if (typeof Assistant !== 'undefined') Assistant.settings.searchBehavior = 'summarize';
      this.handleSearch(q, false).finally(() => {
        if (typeof Assistant !== 'undefined') Assistant.settings.searchBehavior = prev;
      });
      return;
    }
    if (act.startsWith('hubsearch:')) {
      const q = decodeURIComponent(act.slice(10));
      this.close();
      Search.openCommandPalette();
      setTimeout(() => {
        const input = document.getElementById('command-input');
        if (input) { input.value = q; Search.renderCommands(q); }
      }, 100);
      return;
    }
    if (act.startsWith('maps:')) {
      const q = decodeURIComponent(act.slice(5));
      window.open('https://www.google.com/maps/search/' + encodeURIComponent(q), '_blank', 'noopener');
      this.pushAssistant(this.lang() === 'fa' ? 'Google Maps باز شد (جست‌وجوی واقعی در تب جدید).' : 'Google Maps opened in a new tab.', { animate: true });
      return;
    }
  },

  showPrefs() {
    const fa = this.lang() === 'fa';
    const cur = this.searchPref();
    this.pushAssistant(fa ? 'رفتار جست‌وجو را انتخاب کن:' : 'Choose search behavior:', {
      animate: true,
      suggestions: [
        { label: (cur === 'ask' ? '✓ ' : '') + (fa ? 'هر بار بپرس' : 'Ask every time'), action: 'setpref:ask' },
        { label: (cur === 'summarize' ? '✓ ' : '') + (fa ? 'همیشه خلاصه' : 'Always summarize'), action: 'setpref:summarize' },
        { label: (cur === 'google' ? '✓ ' : '') + (fa ? 'همیشه Google' : 'Always Google'), action: 'setpref:google' }
      ]
    });
    // extend runChip for setpref
    const orig = this.runChip.bind(this);
    this.runChip = (act) => {
      if (act && act.startsWith('setpref:')) {
        const v = act.slice(8);
        if (typeof Assistant !== 'undefined') {
          Assistant.applySettings({ searchBehavior: v });
        }
        this.pushAssistant(fa ? 'ذخیره شد.' : 'Saved.', { animate: true });
        this.runChip = orig;
        return;
      }
      return orig(act);
    };
  },

  showQuickActions() {
    this.pushAssistant(this.lang() === 'fa' ? 'میانبر:' : 'Shortcuts:', {
      animate: false,
      suggestions: this.defaultSuggestions().concat([
        { label: this.lang() === 'fa' ? '✅ کارها' : '✅ Tasks', action: 'nav:tasks' },
        { label: this.lang() === 'fa' ? '💰 رمزارز' : '💰 Crypto', action: 'nav:crypto' }
      ])
    });
  },

  wait(ms) { return new Promise(r => setTimeout(r, ms)); }
};
