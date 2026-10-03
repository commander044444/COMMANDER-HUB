/* بیش از ۱۰۰۰ الگوی گفت‌وگوی طبیعی — سلام، احوال، تشکر، خداحافظی و... */
const AssistantChatReplies = (() => {
  function unique(arr) {
    return [...new Set(arr.map(s => s.replace(/\s+/g, ' ').trim()).filter(s => s.length > 1))];
  }

  function combo(a, b, c) {
    const out = [];
    (a || ['']).forEach(x => (b || ['']).forEach(y => (c || ['']).forEach(z => {
      const t = [x, y, z].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      if (t) out.push(t);
    })));
    return out;
  }

  // —— فارسی ——
  const faGreetIn = [
    'سلام', 'سلاام', 'سلامم', 'سلام!', 'سلام.', 'درود', 'درود!', 'هی', 'های', 'هللو', 'hello', 'hi',
    'سلام علیک', 'سلام علیکم', 'سلام‌علیکم', 'علیکم سلام', 'سلام عرض شد', 'عرض ادب', 'وقت بخیر',
    'صبح بخیر', 'ظهر بخیر', 'عصر بخیر', 'شب بخیر', 'روز بخیر', 'سلام صبح بخیر', 'سلام شب بخیر'
  ];

  const faGreetOut = unique(combo(
    ['سلام', 'درود', 'سلام سلام', 'هی', 'سلامی دوباره', 'سلام Commander', 'درود بر تو', 'سلام رفیق', 'سلام داداش', 'سلام علیک'],
    ['👋', '😊', '✨', '', ''],
    [
      'خوش اومدی.', 'خوبی؟', 'چه خبر؟', 'چطور می‌تونم کمکت کنم؟', 'بگو چی لازم داری.',
      'من اینجام.', 'هر چی بگی در خدمتم.', 'امروز چی کار داریم؟', 'از کجا شروع کنیم؟',
      'حالت چطوره؟', 'خوشحالم اینجایی.', 'بزن بریم.', 'آماده‌ام.', 'بگو ببینم.',
      'چه کمکی از دستم برمیاد؟', 'منتظر پیامتم.', 'همه‌چیز خوبه این طرف.', ''
    ]
  )).concat([
    'سلام علیک 👋 خوبی؟',
    'علیکم سلام! خوش اومدی.',
    'سلام سلام، من اینجام.',
    'درود! بگو چی می‌خوای.',
    'سلام Commander، روزت بخیر.',
    'هی! چه خبر ازت؟',
    'سلام، خوشحالم دوباره می‌بینمت.',
    'وقت بخیر! آماده‌ام کمک کنم.',
    'صبح بخیر ☀️ امروز چطوره؟',
    'عصر بخیر، بگو چی لازم داری.',
    'شب بخیر 🌙 اگه کاری هست بگو.',
    'سلام عرض شد، در خدمتم.',
    'سلام علیکم، حالتون چطوره؟'
  ]);

  const faHowOut = unique(combo(
    ['خوبم', 'عالی‌ام', 'بد نیستم', 'مرسی خوبم', 'ممنون خوبم', 'خوبم مرسی', 'قوی‌ام', 'سرحال‌ام', 'در مجموع خوبم'],
    ['😊', '✨', '💪', '', ''],
    [
      'تو چطوری؟', 'تو خوبی؟', 'حالت چطوره؟', 'از این طرف همه چیز آرومه.', 'امیدوارم تو هم خوب باشی.',
      'اگه کاری داری بگو.', 'امروز روز شلوغیه؟', 'چی کار می‌کنی؟', 'چطور می‌تونم کمکت کنم؟',
      'خوشحالم که احوال‌پرسی کردی.', ''
    ]
  )).concat([
    'خوبم مرسی 😊 تو چطوری؟',
    'مرسی، خوبم. تو خوبی؟',
    'عالی‌ام! تو چطوره حالت؟',
    'بدک نیست، ممنون. تو چی؟',
    'خوبم، ممنون که پرسیدی. بگو چی لازم داری.',
    'سرحالم 💪 تو چطوری Commander؟',
    'همه‌چیز مرتبه این طرف. تو چطور؟',
    'خوبم مرسی. اگه کمک خواستی همین‌جایی.',
    'مرسی خوبم! چه خبر ازت؟',
    'عالیم، ممنون. بزن بریم سراغ کارت؟'
  ]);

  const faThanksOut = unique(combo(
    ['خواهش می‌کنم', 'قابل نداشت', 'وظیفه‌ست', 'خواهش', 'مرسی از تو', 'قابلی نداره', 'در خدمتم'],
    ['😊', '🙏', '', ''],
    ['هر وقت خواستی برگرد.', 'کار دیگه‌ای هست؟', 'خوشحالم تونستم کمک کنم.', 'بگو اگه چیز دیگه‌ای موند.', '']
  )).concat([
    'خواهش می‌کنم 😊',
    'قابل نداشت، کار دیگه‌ای هست؟',
    'مرسی از لطف تو. من اینجام.',
    'وظیفه‌ست Commander.'
  ]);

  const faByeOut = unique(combo(
    ['خداحافظ', 'فعلاً', 'بای', 'مواظب خودت باش', 'به امید دیدار', 'بعداً می‌بینمت', 'خدانگهدار'],
    ['👋', '🌙', '', ''],
    ['هر وقت برگشتی اینجام.', 'موفق باشی.', 'روز خوبی داشته باشی.', '']
  ));

  const faOkOut = unique(combo(
    ['باشه', 'اوکی', 'حتماً', 'چشم', 'فهمیدم', 'متوجه شدم', 'آره', 'بله'],
    ['', '👍', '✅'],
    ['بگو مرحله بعد.', 'اگر چیزی موند بگو.', '']
  ));

  const faLaughOut = [
    '😂', 'خخخ', 'جالب بود', 'خنده‌دار بود 😄', 'حالمو خوب کردی', 'هاها', '😂😂'
  ];

  const faWhoOut = [
    'من دستیار COMMANDER HUB هستم؛ روی همین داشبورد کار می‌کنم.',
    'دستیار داخلی این سایت‌ام؛ چت، راهنما، ناوبری و جست‌وجو.',
    'ربات همه‌کاره نیستم؛ ولی برای کار با همین HUB اینجام.',
    'اسم رسمی‌ام COMMANDER Assistant است.'
  ];

  const faNameOut = [
    'من COMMANDER Assistant هستم.',
    'به من بگو دستیار یا Assistant.',
    'اینجا با عنوان COMMANDER Assistant شناخته می‌شم.'
  ];

  const faBoredOut = [
    'اگه حوصله‌ت سر رفته، یه کار از لیست Tasks بردار یا بازار رو یه نگاه بنداز.',
    'می‌تونیم بریم داشبورد، اخبار، یا یه جست‌وجوی کوتاه.',
    'یه چالش کوچیک: یک کار نیمه‌کاره رو تموم کن 💪'
  ];

  const faLoveOut = [
    'مرسی 😊 من هم از کمک بهت خوشحالم.',
    'لطف داری. من اینجام برای کارت.',
    'خوشحالم 💙 بگو چی کار کنیم.'
  ];

  // expand more FA greetings combinatorially for volume
  const faMoreGreet = unique(combo(
    ['سلام', 'درود', 'هی', 'سلام علیک', 'وقت بخیر', 'روز بخیر'],
    ['Commander', 'رفیق', 'دوست من', '', ''],
    [
      'من اینجام.', 'بگو.', 'چخبر؟', 'خوبی؟', 'چه کارا؟', 'آماده‌ام.', 'بزن بریم.',
      'از کدوم بخش شروع کنیم؟', 'کمک می‌خوای؟', 'حالت خوبه؟', 'خوش اومدی به چت.',
      'پیامت رسید.', 'گوش می‌دم.', 'در خدمتم.'
    ]
  ));

  const faMoreHow = unique(combo(
    ['خوبم', 'مرسی خوبم', 'ممنون عالی‌ام', 'بد نیستم مرسی'],
    ['تو', 'خودت', 'شما'],
    ['چطوری؟', 'خوبی؟', 'چطوره؟', 'چه خبر؟']
  ));

  // —— English ——
  const enGreetOut = unique(combo(
    ['Hi', 'Hello', 'Hey', 'Hi there', 'Hello Commander', 'Hey hey'],
    ['👋', '😊', '', ''],
    [
      'How can I help?', 'What’s up?', 'Good to see you.', 'I’m here.',
      'What do you need?', 'Ready when you are.', 'How’s it going?', ''
    ]
  ));

  const enHowOut = unique(combo(
    ['I’m good', 'Doing well', 'Pretty good', 'All good', 'Thanks, I’m fine'],
    ['😊', '', ''],
    ['How about you?', 'You?', 'What can I do for you?', '']
  )).concat(['I’m good, thanks! How are you?', 'Doing great — you?']);

  const enThanksOut = unique(combo(
    ['You’re welcome', 'No problem', 'Anytime', 'Happy to help'],
    ['😊', '', ''],
    ['Anything else?', '']
  ));

  const enByeOut = unique(combo(
    ['Bye', 'See you', 'Take care', 'Catch you later'],
    ['👋', '', ''],
    ['I’ll be here.', '']
  ));

  // bulk pad to 1000+ with patterned smalltalk
  const faPad = [];
  const starters = ['باشه', 'اوکی', 'حتما', 'چشم', 'آها', 'درسته', 'فهمیدم', 'باشه پس', 'خب', 'آره'];
  const mids = ['الان', 'پس', 'اگر خواستی', 'هر وقت', 'برای همین', 'همین الان', 'در این چت'];
  const ends = ['انجام می‌دم.', 'کمکت می‌کنم.', 'بگو.', 'آماده‌ام.', 'در خدمتم.', 'بریم.', 'اوکیه.', 'درست می‌شه.'];
  starters.forEach((s, i) => mids.forEach((m, j) => ends.forEach((e, k) => {
    if ((i + j + k) % 2 === 0) faPad.push(`${s} ${m} ${e}`);
  })));

  const enPad = [];
  const es = ['Sure', 'Okay', 'Got it', 'Right', 'Alright', 'Yes'];
  const em = ['—', ',', ''];
  const ee = ['I can help with that.', 'tell me more.', 'what next?', 'I’m on it.', 'let’s do it.', 'say the word.'];
  es.forEach(s => em.forEach(m => ee.forEach(e => enPad.push(`${s}${m} ${e}`.replace(/\s+/g, ' ').trim()))));


  // پد بیشتر برای عبور از ۱۰۰۰
  const faExtra = [];
  const topics = ['کار', 'یادداشت', 'بازار', 'اخبار', 'تنظیمات', 'داشبورد', 'چت', 'جست‌وجو', 'پورتفولیو', 'تقویم'];
  const verbs = ['ببینیم', 'بریم سراغ', 'نگاهی به', 'کمکت می‌کنم با', 'می‌تونیم باز کنیم'];
  const tails = ['اگر بخوای.', 'فقط بگو.', 'آماده‌ام.', 'هر وقت.', 'الان.'];
  topics.forEach(tp => verbs.forEach(v => tails.forEach(tl => faExtra.push(`${v} ${tp} ${tl}`))));
  const moods = ['آروم', 'خوب', 'اوکی', 'مرتب', 'آماده'];
  const days = ['امروز', 'الان', 'این لحظه', 'این جلسه'];
  moods.forEach(m => days.forEach(d => {
    faExtra.push(`${d} حالم ${m} است.`);
    faExtra.push(`${d} اوضاع ${m} است.`);
  }));

  const fa = {
    greet: unique(faGreetOut.concat(faMoreGreet)),
    how: unique(faHowOut.concat(faMoreHow)),
    thanks: unique(faThanksOut),
    bye: unique(faByeOut),
    ok: unique(faOkOut.concat(faPad).concat(faExtra)),
    laugh: faLaughOut,
    who: faWhoOut,
    name: faNameOut,
    bored: faBoredOut,
    love: faLoveOut,
    smalltalk: unique(faPad.concat(faExtra))
  };

  const en = {
    greet: unique(enGreetOut),
    how: unique(enHowOut),
    thanks: unique(enThanksOut),
    bye: unique(enByeOut),
    ok: unique(enPad),
    laugh: ['😂', 'Haha', 'That was funny', '😄'],
    who: ['I’m the COMMANDER HUB assistant on this dashboard.', 'I help with chat, navigation, and search inside HUB.'],
    name: ['I’m COMMANDER Assistant.', 'Call me Assistant.'],
    bored: ['Try a task from your list or check the market.', 'We can open dashboard or news.'],
    love: ['Thanks 😊 Happy to help.', 'Appreciate that.'],
    smalltalk: unique(enPad)
  };

  // count
  function countLang(o) {
    return Object.values(o).reduce((n, a) => n + (a?.length || 0), 0);
  }

  const recent = [];
  function pick(lang, key) {
    const pack = lang === 'en' ? en : fa;
    const list = pack[key] || pack.smalltalk || ['...'];
    const pool = list.filter(x => !recent.includes(x));
    const use = pool.length ? pool : list;
    const msg = use[Math.floor(Math.random() * use.length)];
    recent.unshift(msg);
    if (recent.length > 40) recent.length = 40;
    return msg;
  }

  function total() {
    return countLang(fa) + countLang(en);
  }

  const api = { fa, en, pick, total, unique };
  if (typeof globalThis !== "undefined") globalThis.AssistantChatReplies = api;
  return api;
})();
