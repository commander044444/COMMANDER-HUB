/* COMMANDER HUB — Smart Personal Assistant */
const Assistant = {
  history: [],
  lastVisit: null,
  lastMarketSnapshot: null,
  lastPortfolioSnapshot: null,
  dismissed: {},
  stats: { messagesShown: 0, helpClicks: 0 },
  cooldownUntil: 0,
  panelOpen: false,
  currentMessage: null,

  settings: {
    enabled: true,
    autoGreet: true,
    marketInsights: true,
    portfolioInsights: true,
    newsInsights: true,
    taskInsights: true,
    focusMessages: true,
    returnSummary: true,
    priceAlerts: true,
    frequency: 'normal', // low | normal | high
    position: 'right',   // left | right
    autoOpen: false,
    animations: true
  },

  FREQ_MS: { low: 120000, normal: 60000, high: 30000 },
  HISTORY_MAX: 40,

  // ─── Templates (many variations per category) ───
  templates: {
    fa: {
      welcome: [
        'خوش اومدی Commander 👋 داشبورد آماده‌ست.',
        'سلام Commander، ببینیم امروز چه خبره.',
        'دوباره اینجایی؛ همه‌چیز سر جاشه.',
        'خوش برگشتی. آماده‌ای شروع کنیم؟',
        'سلام! سیستم آنلاین و آماده‌ست.',
        'خوش اومدی؛ یک نگاه سریع به وضعیت بنداز.',
        'Commander، داشبورد منتظرته.',
        'سلام دوباره. بزن بریم سراغ کارها.'
      ],
      firstVisit: [
        'اولین باره اینجایی؟ خوش اومدی به COMMANDER HUB 🚀',
        'سلام! اینجا داشبورد شخصی‌ته. از منوی کناری شروع کن.',
        'خوش اومدی. می‌تونی ویجت‌ها، کارها و رمزارزها رو از همین‌جا مدیریت کنی.'
      ],
      returningShort: [
        'دوباره برگشتی؟ خوبه.',
        'سریع برگشتی. چیزی تغییر خاصی نکرده.',
        'دوباره اینجایی. ادامه می‌دیم؟'
      ],
      returningDay: [
        'یک روز گذشته. بذار ببینیم چه خبری بوده.',
        'دیروز نبودی. چند تا تغییر ممکنه رخ داده باشه.',
        'یه روز فاصله افتاد. خلاصه‌ای برات آماده می‌کنم.'
      ],
      returningLong: [
        'چند روز نبودی Commander. بذار ببینیم تو این مدت چه تغییراتی بوده.',
        'مدت‌ها بود پیدات نبود. وقت یه مرور سریعه.',
        'خوش برگشتی بعد از چند روز. وضعیت رو برات خلاصه می‌کنم.'
      ],
      morning: [
        'صبح بخیر Commander ☀️',
        'صبح بخیر؛ روزت پرانرژی باشه.',
        'صبحونه خوردی؟ بریم سراغ داشبورد.'
      ],
      afternoon: [
        'ظهر بخیر. نیمه‌روز چطور پیش می‌ره؟',
        'بعدازظهر خوبی داشته باشی.',
        'وسط روزه؛ یه چک سریع بد نیست.'
      ],
      evening: [
        'عصر بخیر Commander.',
        'غروب نزدیکه؛ کارهای باقی‌مونده رو چک کن.',
        'عصر خوبی. چیز خاصی مونده؟'
      ],
      night: [
        'شب بخیر. دیر وقته؛ قبل از خواب یه نگاه بنداز.',
        'شبت آروم. کارهای ضروری رو تموم کردی؟',
        'دیر شده؛ استراحت هم مهمه 🌙'
      ],
      crypto: [
        'آها، رفتیم سراغ بازار 📊',
        'بازار رمزارز رو باز کردی. ببینیم چه خبره.',
        'نگاهی به قیمت‌ها بندازیم.',
        'وارد بخش رمزارز شدی.'
      ],
      portfolio: [
        'خب، بریم سراغ دارایی‌ها.',
        'پورتفولیو رو باز کردی. وضعیت رو چک می‌کنم.',
        'دارایی‌هات اینجان.'
      ],
      portfolioEmpty: [
        'هنوز دارایی‌ای ثبت نکردی. اگر خواستی از همین‌جا شروع کن.',
        'پورتفولیو خالیه. می‌تونی اولین دارایی رو اضافه کنی.'
      ],
      tasks: [
        'بخش کارها رو باز کردی.',
        'لیست کارها اینجاست.',
        'ببینیم چی مونده انجام بدی.'
      ],
      tasksOverdue: [
        'چند کار عقب‌افتاده داری.',
        'بعضی کارها از مهلت گذشته‌ان.',
        'کارهای عقب‌افتاده نیاز به توجه دارن.'
      ],
      tasksClear: [
        'فعلاً چیزی عقب نیفتاده؛ اوضاع مرتبه.',
        'همه کارها سر وقتن. عالی.',
        'لیست کارها تمیزه.'
      ],
      notes: [
        'یادداشت‌ها آماده‌ان.',
        'بخش یادداشت رو باز کردی.',
        'اگر چیزی نوشتی، اینجاست.'
      ],
      news: [
        'بریم ببینیم امروز چه خبرهایی هست.',
        'بخش اخبار رو باز کردی.',
        'آخرین عناوین رو چک می‌کنم.'
      ],
      music: [
        'وقت یه پلی‌لیست خوبه 🎵',
        'بخش موسیقی. سرویس موردعلاقه‌ت رو انتخاب کن.',
        'موسیقی همیشه کمک‌کننده‌ست.'
      ],
      calendar: [
        'تقویم رو باز کردی.',
        'رویدادهای پیش‌رو رو ببین.',
        'برنامه‌ت اینجاست.'
      ],
      settings: [
        'تنظیمات. اینجا ظاهر و امنیت رو عوض می‌کنی.',
        'بخش تنظیمات باز شد.',
        'هر چیزی که بخوای شخصی‌سازی کنی اینجاست.'
      ],
      dashboard: [
        'داشبورد اصلی. ویجت‌ها اینجان.',
        'نمای کلی آماده‌ست.',
        'از اینجا همه چیز دم دستته.'
      ],
      profit: [
        'ارزش پرتفوی نسبت به قبل تغییر مثبتی داشته.',
        'پورتفولیو در وضعیت سبز قرار داره.',
        'سود نسبی دیده می‌شه.'
      ],
      loss: [
        'امروز پرتفوی کمی تحت فشار بوده.',
        'تغییر منفی در ارزش دارایی‌ها ثبت شده.',
        'پورتفولیو فعلاً قرمز است.'
      ],
      volatility: [
        'نوسان این دارایی امروز بالاست.',
        'بازار امروز آروم نیست.',
        'حرکت قیمت نسبت به معمول بیشتره.'
      ],
      positiveMomentum: [
        'مومنتوم کوتاه‌مدت مثبت دیده می‌شه.',
        'تغییر ۲۴ساعته مثبت و روند نسبتاً مساعده.',
        'فشار خرید در بازه کوتاه‌مدت بیشتره.'
      ],
      negativeMomentum: [
        'مومنتوم کوتاه‌مدت منفی است.',
        'فشار فروش در ۲۴ ساعت اخیر بیشتر بوده.',
        'روند کوتاه‌مدت نزولی به نظر می‌رسه.'
      ],
      neutral: [
        'سیگنال‌ها مخلوط‌ان؛ وضعیت خنثی.',
        'داده‌ها سیگنال خیلی واضحی نمی‌دن.',
        'فعلاً بازار در محدوده خنثی حرکت می‌کنه.'
      ],
      insufficient: [
        'داده کافی برای تحلیل قابل اتکا ندارم.',
        'اطلاعات فعلی برای نتیجه‌گیری کمه.',
        'اتصال یا داده کافی نیست.'
      ],
      apiError: [
        'اتصال به منبع داده برقرار نشد.',
        'فعلاً نمی‌تونم داده بازار رو بگیرم.',
        'خطا در دریافت اطلاعات. بعداً دوباره امتحان کن.'
      ],
      offline: [
        'آفلاین هستی. بعضی داده‌ها در دسترس نیستن.',
        'اتصال اینترنت قطع به نظر می‌رسه.'
      ],
      focus: [
        'حالت تمرکز فعاله؛ مزاحمت نمی‌شم 💪',
        'Focus Mode روشن است. پیام‌های غیرضروری خاموش شدن.'
      ],
      achievement: [
        'امروز همه کارهای برنامه‌ریزی‌شده رو انجام دادی 👏',
        'آفرین؛ لیست کارها تموم شد.',
        'یک دستاورد ثبت شد.'
      ],
      idle: [
        'اگر کمکی لازم داری، روی راهنمایی بزن.',
        'من اینجام اگر چیزی خواستی.',
        'هر وقت آماده بودی، بگو.'
      ],
      helpCrypto: [
        'اینجا قیمت زنده رمزارزهاست. علاقه‌مندی‌ها رو ستاره بزن.',
        'می‌تونی کوین جستجو کنی و تغییرات ۲۴ساعته رو ببینی.',
        'قیمت‌ها هم به دلار و هم تومان نشون داده می‌شن.'
      ],
      helpPortfolio: [
        'دارایی‌هات رو با مقدار و قیمت خرید ثبت کن تا سود/زیان حساب بشه.',
        'این بخش دستی است و به صرافی وصل نیست.',
        'ارزش تقریبی بر اساس قیمت بازار محاسبه می‌شه.'
      ],
      helpTasks: [
        'کار جدید اضافه کن، مهلت و اولویت بذار، و وقتی تموم شد تیک بزن.',
        'فیلترها کمک می‌کنن کارهای عقب‌افتاده رو ببینی.',
        'پیشرفت روزانه این پایین نشون داده می‌شه.'
      ],
      helpNotes: [
        'یادداشت بساز، برچسب بزن و سنجاق کن.',
        'جستجو و فیلتر بر اساس برچسب کار می‌کنه.',
        'همه چیز فقط روی همین دستگاه ذخیره می‌شه.'
      ],
      helpDashboard: [
        'ویجت‌ها رو می‌تونی اضافه، حذف و جابه‌جا کنی.',
        'از دکمه سفارشی‌سازی برای تغییر چیدمان استفاده کن.',
        'هر فضای کاری چیدمان جدا داره.'
      ],
      helpSettings: [
        'تم، زبان، قفل و پشتیبان‌گیری اینجان.',
        'دستیار رو از همین بخش روشن/خاموش کن.',
        'خروجی JSON برای پشتیبان توصیه می‌شه.'
      ],
      helpGeneric: [
        'روی بخش‌های منو کلیک کن تا جابه‌جا شی.',
        'Ctrl+K پالت فرمان رو باز می‌کنه.',
        'اگر سوالی داری بپرس؛ من بر اساس صفحه فعلی راهنمایی می‌کنم.'
      ]
    },
    en: {
      welcome: [
        'Welcome back, Commander 👋 Dashboard is ready.',
        'Hello Commander, let’s see what’s up today.',
        'You’re back; everything is in place.',
        'Welcome. Ready to get started?',
        'Hi! System is online and ready.',
        'Welcome; take a quick look at the status.',
        'Commander, the dashboard is waiting.',
        'Hello again. Let’s get to work.'
      ],
      firstVisit: [
        'First time here? Welcome to COMMANDER HUB 🚀',
        'Hi! This is your personal dashboard. Start from the sidebar.',
        'Welcome. Manage widgets, tasks and crypto from here.'
      ],
      returningShort: [
        'Back so soon? Nice.',
        'Quick return. Nothing major changed.',
        'You’re back. Shall we continue?'
      ],
      returningDay: [
        'A day has passed. Let’s see what happened.',
        'You were away yesterday. Some changes may have occurred.',
        'One day gap. I’ll prepare a short summary.'
      ],
      returningLong: [
        'You were away for several days, Commander. Let’s review what changed.',
        'It’s been a while. Time for a quick overview.',
        'Welcome back after a few days. Here’s a summary.'
      ],
      morning: ['Good morning, Commander ☀️', 'Morning; have an energetic day.', 'Breakfast done? Let’s check the dashboard.'],
      afternoon: ['Good afternoon. How’s the day going?', 'Have a nice afternoon.', 'Midday; a quick check wouldn’t hurt.'],
      evening: ['Good evening, Commander.', 'Evening is near; check remaining tasks.', 'Good evening. Anything left?'],
      night: ['Good night. It’s late; take a quick look before sleep.', 'Rest matters too 🌙', 'Late hour; finish essentials.'],
      crypto: ['Looking at the market 📊', 'Crypto section opened. Let’s check prices.', 'Time to review the market.'],
      portfolio: ['Let’s check your assets.', 'Portfolio opened. Reviewing status.', 'Your holdings are here.'],
      portfolioEmpty: ['No assets yet. You can start from here.', 'Portfolio is empty. Add your first asset.'],
      tasks: ['Tasks section opened.', 'Here’s your task list.', 'Let’s see what’s left.'],
      tasksOverdue: ['You have overdue tasks.', 'Some tasks passed their due date.', 'Overdue items need attention.'],
      tasksClear: ['Nothing overdue; all good.', 'Tasks are on track. Great.', 'Task list is clean.'],
      notes: ['Notes are ready.', 'Notes section opened.', 'Your notes live here.'],
      news: ['Let’s see today’s headlines.', 'News section opened.', 'Checking latest titles.'],
      music: ['Time for a good playlist 🎵', 'Music section. Pick your service.', 'Music always helps.'],
      calendar: ['Calendar opened.', 'Check upcoming events.', 'Your schedule is here.'],
      settings: ['Settings. Appearance and security live here.', 'Settings opened.', 'Customize anything here.'],
      dashboard: ['Main dashboard. Widgets are here.', 'Overview is ready.', 'Everything at your fingertips.'],
      profit: ['Portfolio value moved up since last check.', 'Portfolio is in the green.', 'Relative gain observed.'],
      loss: ['Portfolio is under some pressure today.', 'Negative change in asset value.', 'Portfolio is currently red.'],
      volatility: ['This asset is quite volatile today.', 'Market is not calm today.', 'Price move is larger than usual.'],
      positiveMomentum: ['Short-term momentum looks positive.', '24h change positive with a favorable tone.', 'Buying pressure is higher short-term.'],
      negativeMomentum: ['Short-term momentum is negative.', 'Selling pressure was higher in the last 24h.', 'Short-term trend looks downward.'],
      neutral: ['Signals are mixed; neutral stance.', 'Data does not give a clear signal.', 'Market is moving in a neutral range.'],
      insufficient: ['Not enough data for reliable analysis.', 'Current info is too limited.', 'Connection or data is insufficient.'],
      apiError: ['Could not reach the data source.', 'Unable to fetch market data right now.', 'Data error. Try again later.'],
      offline: ['You appear offline. Some data is unavailable.', 'Internet connection seems down.'],
      focus: ['Focus Mode is on; I’ll stay quiet 💪', 'Focus Mode enabled. Non-critical messages muted.'],
      achievement: ['You completed all planned tasks today 👏', 'Well done; task list is done.', 'An achievement was recorded.'],
      idle: ['If you need help, press Help.', 'I’m here if you need anything.', 'Whenever you’re ready, ask.'],
      helpCrypto: ['Live crypto prices. Star your favorites.', 'Search coins and check 24h change.', 'Prices show both USD and Toman.'],
      helpPortfolio: ['Log amount and buy price to track P&L.', 'This is manual; not linked to an exchange.', 'Value is estimated from market prices.'],
      helpTasks: ['Add tasks with due date and priority; tick when done.', 'Filters help you see overdue items.', 'Daily progress is shown below.'],
      helpNotes: ['Create notes, add tags and pin important ones.', 'Search and filter by tag.', 'Everything stays on this device only.'],
      helpDashboard: ['Add, remove and rearrange widgets.', 'Use Customize to change the layout.', 'Each workspace has its own layout.'],
      helpSettings: ['Theme, language, lock and backup are here.', 'Turn the Assistant on/off in this section.', 'JSON export is recommended for backup.'],
      helpGeneric: ['Use the sidebar to navigate.', 'Ctrl+K opens the command palette.', 'Ask me; I guide based on the current page.']
    }
  },

  init() {
    this.load();
    this.injectUI();
    this.bindEvents();
    this.updateOrbPosition();
    if (!this.settings.enabled) {
      document.getElementById('assistant-orb')?.classList.add('hidden');
      return;
    }
    // Welcome / return after short delay
    setTimeout(() => this.onAppReady(), 800);
  },

  load() {
    const s = Storage.load('assistantSettings', null);
    if (s) Object.assign(this.settings, s);
    this.history = Storage.load('assistantHistory', []);
    this.lastVisit = Storage.load('assistantLastVisit', null);
    this.lastMarketSnapshot = Storage.load('assistantMarketSnap', null);
    this.lastPortfolioSnapshot = Storage.load('assistantPortfolioSnap', null);
    this.dismissed = Storage.load('assistantDismissed', {});
    this.stats = Storage.load('assistantStats', this.stats);
  },

  save() {
    Storage.save('assistantSettings', this.settings);
    Storage.save('assistantHistory', this.history.slice(0, this.HISTORY_MAX));
    Storage.save('assistantLastVisit', this.lastVisit);
    Storage.save('assistantMarketSnap', this.lastMarketSnapshot);
    Storage.save('assistantPortfolioSnap', this.lastPortfolioSnapshot);
    Storage.save('assistantDismissed', this.dismissed);
    Storage.save('assistantStats', this.stats);
  },

  injectUI() {
    if (document.getElementById('assistant-orb')) return;

    const orb = document.createElement('button');
    orb.id = 'assistant-orb';
    orb.className = 'assistant-orb';
    orb.setAttribute('aria-label', 'COMMANDER Assistant');
    orb.innerHTML = '🤖';
    document.body.appendChild(orb);

    const panel = document.createElement('div');
    panel.id = 'assistant-panel';
    panel.className = 'assistant-panel hidden';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'COMMANDER Assistant');
    panel.innerHTML = `
      <div class="assistant-header">
        <span class="assistant-title">🤖 COMMANDER ASSISTANT</span>
        <button class="btn-icon assistant-close" aria-label="Close">✕</button>
      </div>
      <div class="assistant-body" id="assistant-body">
        <div class="assistant-msg" id="assistant-msg"></div>
        <div class="assistant-facts" id="assistant-facts"></div>
        <div class="assistant-actions" id="assistant-actions"></div>
      </div>
      <div class="assistant-footer">
        <button class="btn btn-primary assistant-help-btn" id="assistant-help-btn">راهنمایی</button>
        <button class="btn btn-secondary assistant-dismiss-btn" id="assistant-dismiss-btn">متوجه شدم</button>
      </div>`;
    document.body.appendChild(panel);
  },

  bindEvents() {
    document.getElementById('assistant-orb')?.addEventListener('click', () => this.togglePanel());
    document.getElementById('assistant-panel')?.querySelector('.assistant-close')?.addEventListener('click', () => this.closePanel());
    document.getElementById('assistant-help-btn')?.addEventListener('click', () => this.onHelp());
    document.getElementById('assistant-dismiss-btn')?.addEventListener('click', () => this.dismiss());
  },

  updateOrbPosition() {
    const orb = document.getElementById('assistant-orb');
    if (!orb) return;
    orb.classList.toggle('orb-left', this.settings.position === 'left');
    orb.classList.toggle('orb-right', this.settings.position !== 'left');
    orb.classList.toggle('no-anim', !this.settings.animations);
  },

  lang() {
    return (AppState && AppState.language) || 'fa';
  },

  pick(category) {
    const lang = this.lang();
    const pool = (this.templates[lang] && this.templates[lang][category]) || (this.templates.fa[category]) || ['...'];
    const recent = this.history.slice(0, 12).map(h => h.text);
    const candidates = pool.filter(t => !recent.includes(t));
    const list = candidates.length ? candidates : pool;
    return list[Math.floor(Math.random() * list.length)];
  },

  pushHistory(text, category) {
    this.history.unshift({ text, category, ts: Date.now() });
    if (this.history.length > this.HISTORY_MAX) this.history.length = this.HISTORY_MAX;
    this.stats.messagesShown++;
    this.save();
  },

  canAutoSpeak() {
    if (!this.settings.enabled) return false;
    if (Date.now() < this.cooldownUntil) return false;
    if (AppState.focusMode && this.settings.focusMessages === false) return false;
    return true;
  },

  setCooldown() {
    const ms = this.FREQ_MS[this.settings.frequency] || 60000;
    this.cooldownUntil = Date.now() + ms;
  },

  // ─── Context Engine ───
  getContext() {
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay = 'afternoon';
    if (hour < 6 || hour >= 22) timeOfDay = 'night';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 17) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    const absenceMs = this.lastVisit ? (Date.now() - this.lastVisit) : null;
    const absenceHours = absenceMs != null ? absenceMs / 3600000 : null;

    const tasks = AppState.tasks || [];
    const overdue = tasks.filter(t => !t.completed && t.due && new Date(t.due) < new Date(now.toDateString()));
    const doneToday = tasks.filter(t => t.completed).length;

    let portfolioValue = 0;
    let portfolioCost = 0;
    (AppState.portfolio || []).forEach(p => {
      const price = (typeof Crypto !== 'undefined' && Crypto.getPrice) ? (Crypto.getPrice(p.coinId) || p.buyPrice || 0) : (p.buyPrice || 0);
      portfolioValue += price * p.amount;
      portfolioCost += (p.buyPrice || 0) * p.amount;
    });
    const pnl = portfolioValue - portfolioCost;
    const pnlPct = portfolioCost ? (pnl / portfolioCost) * 100 : 0;

    let topCoins = [];
    if (typeof Crypto !== 'undefined' && Crypto.coins && Crypto.coins.length) {
      topCoins = Crypto.coins.slice(0, 5).map(c => ({
        id: c.id,
        symbol: c.symbol,
        price: c.current_price,
        change: c.price_change_percentage_24h
      }));
    }

    return {
      currentPage: AppState.currentView || 'dashboard',
      currentWorkspace: AppState.currentWorkspace,
      currentTime: now.toISOString(),
      timeOfDay,
      language: this.lang(),
      isFirstVisit: !this.lastVisit,
      absenceHours,
      absenceMs,
      online: navigator.onLine,
      tasksCount: tasks.length,
      overdueCount: overdue.length,
      completedCount: doneToday,
      notesCount: (AppState.notes || []).length,
      portfolioCount: (AppState.portfolio || []).length,
      portfolioValue,
      portfolioCost,
      pnl,
      pnlPct,
      topCoins,
      favorites: (AppState.favorites && AppState.favorites.crypto) || [],
      eventsUpcoming: (AppState.events || []).filter(e => e.date >= now.toISOString().slice(0, 10)).length,
      weather: (typeof Weather !== 'undefined' && Weather.location) ? Weather.location.name : null
    };
  },

  // ─── Signal from real data ───
  analyzeCoin(coin) {
    if (!coin || coin.price_change_percentage_24h == null) {
      return { label: 'insufficient', emoji: '⚪', reason: this.lang() === 'fa' ? 'داده کافی نیست' : 'Insufficient data' };
    }
    const ch = coin.price_change_percentage_24h;
    if (Math.abs(ch) >= 8) {
      return { label: 'volatility', emoji: '🟠', reason: this.lang() === 'fa' ? `نوسان بالا: ${ch.toFixed(1)}٪ در ۲۴س` : `High volatility: ${ch.toFixed(1)}% 24h` };
    }
    if (ch >= 3) {
      return { label: 'positive', emoji: '🟢', reason: this.lang() === 'fa' ? `تغییر ۲۴س +${ch.toFixed(1)}٪` : `24h +${ch.toFixed(1)}%` };
    }
    if (ch <= -3) {
      return { label: 'negative', emoji: '🔴', reason: this.lang() === 'fa' ? `تغییر ۲۴س ${ch.toFixed(1)}٪` : `24h ${ch.toFixed(1)}%` };
    }
    return { label: 'neutral', emoji: '🟡', reason: this.lang() === 'fa' ? `تغییر محدود: ${ch.toFixed(1)}٪` : `Limited move: ${ch.toFixed(1)}%` };
  },

  // ─── Message builder ───
  buildMessage(opts = {}) {
    const ctx = this.getContext();
    const lang = this.lang();
    let category = opts.category || 'idle';
    let priority = opts.priority || 20;
    let facts = [];
    let actions = [];
    let title = '';
    let confidence = 'data';

    // Priority engine
    if (!navigator.onLine) {
      category = 'offline';
      priority = 85;
    } else if (opts.forceCategory) {
      category = opts.forceCategory;
    } else if (ctx.overdueCount > 0 && this.settings.taskInsights) {
      category = 'tasksOverdue';
      priority = 50;
      facts.push(lang === 'fa' ? `${ctx.overdueCount} کار عقب‌افتاده` : `${ctx.overdueCount} overdue task(s)`);
      actions.push({ label: lang === 'fa' ? 'مشاهده کارها' : 'View Tasks', action: 'openTasks' });
    }

    // Page-specific
    if (opts.fromHelp || opts.fromPage) {
      const page = ctx.currentPage;
      if (page === 'crypto') {
        category = opts.fromHelp ? 'helpCrypto' : 'crypto';
        if (ctx.topCoins.length) {
          const btc = ctx.topCoins.find(c => c.id === 'bitcoin') || ctx.topCoins[0];
          const sig = this.analyzeCoin(typeof Crypto !== 'undefined' ? Crypto.coins.find(x => x.id === btc.id) : null);
          facts.push(`${(btc.symbol || '').toUpperCase()}: $${btc.price != null ? Number(btc.price).toLocaleString() : '—'} (${btc.change != null ? (btc.change >= 0 ? '+' : '') + btc.change.toFixed(2) + '%' : '—'})`);
          if (sig.label !== 'insufficient') {
            facts.push(`${sig.emoji} ${sig.reason}`);
            if (sig.label === 'positive') category = opts.fromHelp ? category : 'positiveMomentum';
            else if (sig.label === 'negative') category = opts.fromHelp ? category : 'negativeMomentum';
            else if (sig.label === 'volatility') category = opts.fromHelp ? category : 'volatility';
            else if (!opts.fromHelp) category = 'neutral';
          }
          actions.push({ label: lang === 'fa' ? 'بازار رمزارز' : 'Crypto Market', action: 'openCrypto' });
        } else {
          facts.push(lang === 'fa' ? 'داده بازار در دسترس نیست' : 'Market data unavailable');
          category = opts.fromHelp ? 'helpCrypto' : 'insufficient';
        }
        confidence = 'data';
      } else if (page === 'portfolio') {
        if (ctx.portfolioCount === 0) {
          category = opts.fromHelp ? 'helpPortfolio' : 'portfolioEmpty';
        } else {
          category = opts.fromHelp ? 'helpPortfolio' : (ctx.pnl >= 0 ? 'profit' : 'loss');
          facts.push(lang === 'fa'
            ? `ارزش تقریبی: $${ctx.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
            : `Est. value: $${ctx.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
          facts.push(lang === 'fa'
            ? `سود/زیان: ${ctx.pnl >= 0 ? '+' : ''}$${ctx.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${ctx.pnlPct.toFixed(1)}٪)`
            : `P&L: ${ctx.pnl >= 0 ? '+' : ''}$${ctx.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${ctx.pnlPct.toFixed(1)}%)`);
          actions.push({ label: lang === 'fa' ? 'پورتفولیو' : 'Portfolio', action: 'openPortfolio' });
        }
        confidence = 'estimate';
      } else if (page === 'tasks') {
        category = opts.fromHelp ? 'helpTasks' : (ctx.overdueCount > 0 ? 'tasksOverdue' : 'tasksClear');
        facts.push(lang === 'fa' ? `کل کارها: ${ctx.tasksCount}` : `Total tasks: ${ctx.tasksCount}`);
        if (ctx.overdueCount) facts.push(lang === 'fa' ? `عقب‌افتاده: ${ctx.overdueCount}` : `Overdue: ${ctx.overdueCount}`);
        actions.push({ label: lang === 'fa' ? 'کارها' : 'Tasks', action: 'openTasks' });
      } else if (page === 'notes') {
        category = opts.fromHelp ? 'helpNotes' : 'notes';
        facts.push(lang === 'fa' ? `تعداد یادداشت: ${ctx.notesCount}` : `Notes: ${ctx.notesCount}`);
      } else if (page === 'news') {
        category = opts.fromHelp ? 'helpGeneric' : 'news';
      } else if (page === 'music') {
        category = 'music';
      } else if (page === 'calendar') {
        category = 'calendar';
        if (ctx.eventsUpcoming) facts.push(lang === 'fa' ? `رویداد پیش‌رو: ${ctx.eventsUpcoming}` : `Upcoming: ${ctx.eventsUpcoming}`);
      } else if (page === 'settings') {
        category = opts.fromHelp ? 'helpSettings' : 'settings';
      } else if (page === 'dashboard') {
        category = opts.fromHelp ? 'helpDashboard' : 'dashboard';
      } else {
        category = opts.fromHelp ? 'helpGeneric' : category;
      }
    }

    // Time of day for greetings
    if (opts.greeting) {
      if (ctx.isFirstVisit) category = 'firstVisit';
      else if (ctx.absenceHours != null && ctx.absenceHours >= 48) category = 'returningLong';
      else if (ctx.absenceHours != null && ctx.absenceHours >= 20) category = 'returningDay';
      else if (ctx.absenceHours != null && ctx.absenceHours < 1) category = 'returningShort';
      else category = ctx.timeOfDay; // morning/afternoon/evening/night
      // Mix with welcome sometimes
      if (!ctx.isFirstVisit && Math.random() > 0.5 && ctx.absenceHours > 2) {
        // keep time or returning
      } else if (ctx.isFirstVisit) {
        // firstVisit
      } else if (opts.greeting && category !== 'returningLong' && category !== 'returningDay') {
        if (Math.random() > 0.4) category = 'welcome';
      }
    }

    let text = this.pick(category);
    // Return summary
    if (opts.returnSummary && ctx.absenceHours != null && ctx.absenceHours >= 12 && this.settings.returnSummary) {
      const lines = [];
      if (ctx.topCoins.length) {
        const btc = ctx.topCoins.find(c => c.id === 'bitcoin');
        if (btc && btc.change != null) lines.push(`BTC: ${btc.change >= 0 ? '+' : ''}${btc.change.toFixed(1)}%`);
      }
      if (ctx.portfolioCount) lines.push(lang === 'fa' ? `پورتفولیو: ${ctx.pnl >= 0 ? '+' : ''}${ctx.pnlPct.toFixed(1)}٪` : `Portfolio: ${ctx.pnl >= 0 ? '+' : ''}${ctx.pnlPct.toFixed(1)}%`);
      if (ctx.overdueCount) lines.push(lang === 'fa' ? `${ctx.overdueCount} کار عقب‌افتاده` : `${ctx.overdueCount} overdue`);
      if (lines.length) {
        text += '\n\n' + (lang === 'fa' ? 'از آخرین ورود:\n' : 'Since last visit:\n') + lines.map(l => '• ' + l).join('\n');
        actions.push(
          { label: lang === 'fa' ? 'بازار' : 'Market', action: 'openCrypto' },
          { label: lang === 'fa' ? 'پورتفولیو' : 'Portfolio', action: 'openPortfolio' },
          { label: lang === 'fa' ? 'کارها' : 'Tasks', action: 'openTasks' }
        );
      }
    }

    // Safety disclaimer for market analysis
    if (['positiveMomentum', 'negativeMomentum', 'volatility', 'neutral', 'profit', 'loss'].includes(category)) {
      facts.push(lang === 'fa'
        ? '⚠️ این تحلیل بر اساس داده فعلی است و پیش‌بینی قطعی نیست.'
        : '⚠️ Based on current data only — not a prediction.');
      confidence = 'analysis';
    }

    return {
      category,
      priority,
      title,
      message: text,
      facts,
      confidence,
      actions,
      timestamp: Date.now()
    };
  },

  show(msg, { open = true } = {}) {
    if (!this.settings.enabled) return;
    this.currentMessage = msg;
    this.pushHistory(msg.message.split('\n')[0], msg.category);

    const msgEl = document.getElementById('assistant-msg');
    const factsEl = document.getElementById('assistant-facts');
    const actionsEl = document.getElementById('assistant-actions');
    const helpBtn = document.getElementById('assistant-help-btn');

    if (msgEl) msgEl.textContent = msg.message;
    if (factsEl) {
      factsEl.innerHTML = (msg.facts || []).map(f => `<div class="assistant-fact">${escapeHtml(f)}</div>`).join('');
    }
    if (actionsEl) {
      actionsEl.innerHTML = (msg.actions || []).map(a =>
        `<button class="btn btn-secondary btn-sm" data-assistant-action="${a.action}">${escapeHtml(a.label)}</button>`
      ).join('');
      actionsEl.querySelectorAll('[data-assistant-action]').forEach(btn => {
        btn.addEventListener('click', () => this.runAction(btn.dataset.assistantAction));
      });
    }
    if (helpBtn) helpBtn.textContent = this.lang() === 'fa' ? 'راهنمایی' : 'Help Me';

    // Update panel dir
    const panel = document.getElementById('assistant-panel');
    if (panel) panel.setAttribute('dir', this.lang() === 'fa' ? 'rtl' : 'ltr');

    if (open || this.settings.autoOpen) this.openPanel();
    this.setCooldown();
  },

  openPanel() {
    const panel = document.getElementById('assistant-panel');
    if (!panel) return;
    panel.classList.remove('hidden');
    this.panelOpen = true;
  },

  closePanel() {
    document.getElementById('assistant-panel')?.classList.add('hidden');
    this.panelOpen = false;
  },

  togglePanel() {
    if (this.panelOpen) this.closePanel();
    else {
      // If no message yet, generate contextual one
      if (!this.currentMessage) {
        const msg = this.buildMessage({ fromPage: true });
        this.show(msg, { open: true });
      } else {
        this.openPanel();
      }
    }
  },

  dismiss() {
    this.closePanel();
    if (this.currentMessage) {
      this.dismissed[this.currentMessage.category] = Date.now();
      this.save();
    }
  },

  onHelp() {
    this.stats.helpClicks++;
    const msg = this.buildMessage({ fromHelp: true, fromPage: true, priority: 70 });
    this.show(msg, { open: true });
    this.save();
  },

  onAppReady() {
    const now = Date.now();
    const wasFirst = !this.lastVisit;
    const absence = this.lastVisit ? (now - this.lastVisit) : 0;

    if (this.settings.autoGreet && this.canAutoSpeak()) {
      const msg = this.buildMessage({
        greeting: true,
        returnSummary: absence > 12 * 3600000,
        priority: wasFirst ? 40 : 30
      });
      this.show(msg, { open: this.settings.autoOpen });
    }

    this.lastVisit = now;
    this.snapshotMarket();
    this.snapshotPortfolio();
    this.save();
  },

  onPageChange(view) {
    if (!this.settings.enabled || !this.canAutoSpeak()) return;
    // Only gentle page reactions when frequency allows
    if (this.settings.frequency === 'low') return;
    const key = 'page_' + view;
    if (this.dismissed[key] && Date.now() - this.dismissed[key] < 300000) return;

    let allow = false;
    if (view === 'crypto' && this.settings.marketInsights) allow = true;
    if (view === 'portfolio' && this.settings.portfolioInsights) allow = true;
    if (view === 'news' && this.settings.newsInsights) allow = true;
    if (view === 'tasks' && this.settings.taskInsights) allow = true;
    if (['music', 'calendar', 'notes'].includes(view) && this.settings.frequency === 'high') allow = true;

    if (!allow) return;
    const msg = this.buildMessage({ fromPage: true, priority: 35 });
    this.show(msg, { open: false }); // update content but don't force open
    // Soft notify via orb pulse
    document.getElementById('assistant-orb')?.classList.add('orb-pulse');
    setTimeout(() => document.getElementById('assistant-orb')?.classList.remove('orb-pulse'), 2000);
  },

  snapshotMarket() {
    if (typeof Crypto === 'undefined' || !Crypto.coins) return;
    const btc = Crypto.coins.find(c => c.id === 'bitcoin');
    if (btc) {
      this.lastMarketSnapshot = {
        ts: Date.now(),
        btcPrice: btc.current_price,
        btcChange: btc.price_change_percentage_24h
      };
    }
  },

  snapshotPortfolio() {
    const ctx = this.getContext();
    this.lastPortfolioSnapshot = {
      ts: Date.now(),
      value: ctx.portfolioValue,
      pnl: ctx.pnl
    };
  },

  runAction(name) {
    const map = {
      openCrypto: () => navigateTo('crypto'),
      openPortfolio: () => navigateTo('portfolio'),
      openTasks: () => navigateTo('tasks'),
      openNotes: () => navigateTo('notes'),
      openNews: () => navigateTo('news'),
      openCalendar: () => navigateTo('calendar'),
      openSettings: () => navigateTo('settings'),
      openDashboard: () => navigateTo('dashboard'),
      dismissAssistant: () => this.dismiss()
    };
    if (map[name]) map[name]();
  },

  applySettings(partial) {
    Object.assign(this.settings, partial);
    this.save();
    this.updateOrbPosition();
    const orb = document.getElementById('assistant-orb');
    if (orb) {
      if (this.settings.enabled) orb.classList.remove('hidden');
      else orb.classList.add('hidden');
    }
  },

  // Called when language changes
  onLanguageChange() {
    const helpBtn = document.getElementById('assistant-help-btn');
    if (helpBtn) helpBtn.textContent = this.lang() === 'fa' ? 'راهنمایی' : 'Help Me';
    const panel = document.getElementById('assistant-panel');
    if (panel) panel.setAttribute('dir', this.lang() === 'fa' ? 'rtl' : 'ltr');
    if (this.currentMessage) {
      // Rebuild current in new language if panel open
      const msg = this.buildMessage({ fromPage: true });
      this.show(msg, { open: this.panelOpen });
    }
  }
};
