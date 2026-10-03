/* کتابخانه پیام‌های متنوع — ترکیب ریشه‌های طبیعی، نه شماره‌گذاری */
const AssistantMessages = (() => {
  function expand(stems, middles, ends) {
    const out = [];
    stems.forEach(s => {
      (middles || ['']).forEach(m => {
        (ends || ['']).forEach(e => {
          const t = [s, m, e].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
          if (t.length > 8) out.push(t);
        });
      });
    });
    return out;
  }

  const fa = {};
  const en = {};

  // —— FA ——
  fa.dashboard = expand(
    ['نمای کلی آماده‌ست.', 'داشبورد اصلی اینجاست.', 'از اینجا همه چیز دم دستته.', 'ویجت‌ها منتظرتن.', 'مرکز کنترل باز شد.', 'خلاصه وضعیت اینجاست.', 'نگاه کلی به سیستم.', 'داشبورد زنده و آماده‌ست.', 'همه‌چیز در یک نما.', 'مرکز فرمان COMMANDER HUB.'],
    ['می‌تونی ویجت‌ها رو جابه‌جا کنی.', 'وضعیت کارها و بازار همین‌جاست.', 'هر فضای کاری لایه‌ی خودش رو داره.', 'اگر چیزی کم بود از سفارشی‌سازی اضافه کن.', 'یک نگاه سریع کافی‌ست برای شروع.', 'اطلاعات محلی‌ست و روی این دستگاه می‌مونه.'],
    ['بزن بریم.', 'هر وقت خواستی برگرد اینجا.', 'از منو هم می‌تونی جابه‌جا بشی.', '']
  );
  fa.crypto = expand(
    ['وارد بازار رمزارز شدی.', 'بخش قیمت‌ها اینجاست.', 'نگاهی به بازار بندازیم.', 'رمزارزها آماده‌ن.', 'لیست بازار باز شد.', 'قیمت‌ها بر اساس منبع زنده می‌آید.', 'بازار در دسترس است.'],
    ['دلار و تومان هر دو دیده می‌شن.', 'اگر API در دسترس نباشد خطا نشان داده می‌شود نه عدد ساختگی.', 'علاقه‌مندی‌ها رو ستاره بزن.', 'نوسان طبیعی است؛ پیش‌بینی قطعی نیست.'],
    ['منبع را در پایین لیست ببین.', 'تازه‌سازی را با دکمه انجام بده.', '']
  );
  fa.portfolio = expand(
    ['پورتفولیو اینجاست.', 'دارایی‌های ثبت‌شده رو می‌بینی.', 'وضعیت دارایی‌ها.', 'بخش پرتفوی باز شد.'],
    ['فقط اعداد واقعی از داده‌ی خودت نمایش داده می‌شه.', 'اگر خالی است اولین مورد را اضافه کن.', 'سود و زیان تقریبی بر اساس قیمت فعلی است.'],
    ['دقت کن داده محلی است.', '']
  );
  fa.tasks = expand(
    ['لیست کارها اینجاست.', 'بخش کارها باز شد.', 'ببینیم چی مونده.', 'کارهای امروز و بعد.'],
    ['اولویت و مهلت کمک می‌کنه مرتب بمونی.', 'تیک زدن حس پیشرفت می‌ده.', 'فیلترها رو امتحان کن.'],
    ['اگر چیزی عقب افتاده اول همان را بردار.', '']
  );
  fa.notes = expand(
    ['یادداشت‌ها اینجان.', 'بخش یادداشت باز شد.', 'جایی برای فکرهای سریع.'],
    ['برچسب و پین کمک می‌کنه پیدا کنی.', 'همه چیز روی این دستگاه می‌مونه.'],
    ['یادداشت جدید بساز اگر چیزی نوشتی.', '']
  );
  fa.news = expand(
    ['بخش اخبار.', 'آخرین عناوین.', 'خبرها از منابع ایرانی خوانده می‌شن.'],
    ['پیش‌نمایش کوتاه است؛ مشاهده بیشتر متن کامل را در منبع باز می‌کند.', 'اگر فید لود نشد دکمه تلاش مجدد را بزن.'],
    ['']
  );
  fa.calendar = expand(
    ['تقویم باز شد.', 'برنامه و مناسبت‌ها اینجان.', 'روزها را مرور کن.'],
    ['مناسبت‌های شمسی و جهانی ثابت‌اند؛ قمری تقریبی است.', 'رویداد شخصی‌ات را هم می‌توانی اضافه کنی.'],
    ['']
  );
  fa.settings = expand(
    ['مرکز کنترل تنظیمات.', 'اینجا ظاهر و امنیت را عوض می‌کنی.', 'تنظیمات COMMANDER HUB.'],
    ['تم، زبان، قفل و پشتیبان‌گیری اینجاست.', 'دستیار را هم از همین‌جا روشن و خاموش کن.'],
    ['قبل از پاک کردن داده یک خروجی JSON بگیر.', '']
  );
  fa.music = expand(
    ['بخش موسیقی.', 'سرویس موردعلاقه‌ات را باز کن.', 'وقت یک پلی‌لیست است.'],
    ['لینک‌ها بیرونی‌اند و HUB را ترک می‌کنی.'],
    ['']
  );
  fa.search = expand(
    ['دنبال چیزی می‌گردی؟', 'جست‌وجو باز شد.', 'اول داخل HUB می‌گردم.'],
    ['اگر چیزی نبود Google همیشه هست.', 'Ctrl+K میانبر همیشگی است.', 'نتایج واقعی از داده همین دستگاه ساخته می‌شوند.'],
    ['']
  );
  fa.firstVisit = expand(
    ['اولین باره اینجایی؟ خوش اومدی به COMMANDER HUB.', 'سلام Commander، اینجا داشبورد شخصی‌ته.', 'خوش اومدی؛ از منوی کناری شروع کن.'],
    ['ویجت‌ها، کارها و رمزارز از همین‌جا مدیریت می‌شن.', 'داده محلی است مگر اینکه خودت خروجی بگیری.'],
    ['اگر گیر کردی روی 🤖 بزن.', '']
  );
  fa.returningVisit = expand(
    ['خوش برگشتی.', 'دوباره اینجایی.', 'بالاخره برگشتی.', 'سلام دوباره Commander.'],
    ['وضعیت قبلی روی همین دستگاه حفظ شده.', 'ببینیم از آخرین بار چه تغییری بوده.'],
    ['']
  );
  fa.morning = expand(['صبح بخیر Commander.', 'صبح بخیر؛ روزت پرانرژی باشه.', 'صبحانه و بعد داشبورد.', 'روز تازه شروع شده.'], ['یک نگاه به کارها بد نیست.', 'بازار هم اگر خواستی چک کن.'], ['']);
  fa.afternoon = expand(['ظهر بخیر.', 'نیمه‌روز چطور پیش می‌رود؟', 'بعدازظهر خوبی.'], ['کارهای نیمه‌کاره را یک‌بار مرور کن.'], ['']);
  fa.evening = expand(['عصر بخیر Commander.', 'غروب نزدیک است.', 'عصر خوبی.'], ['باقی‌مانده‌های امروز را جمع کن.'], ['']);
  fa.night = expand(['شب بخیر.', 'دیر وقت است.', 'شبت آروم.'], ['استراحت هم مهم است.', 'کار ضروری مانده؟'], ['🌙']);

  // pad with more unique stems for volume
  const moreDash = [];
  const verbs = ['آماده‌ست', 'در دسترس است', 'باز شد', 'زنده‌ست', 'مرتب است', 'منتظرته'];
  const nouns = ['داشبورد', 'نمای کلی', 'مرکز فرمان', 'صفحه اصلی', 'میز کار', 'هاب شخصی'];
  nouns.forEach(n => verbs.forEach(v => moreDash.push(`${n} ${v}.`)));
  fa.dashboard = fa.dashboard.concat(moreDash, expand(
    ['همه‌چیز یک‌جا جمع شده.', 'از این نقطه می‌تونی به هر بخش بپری.', 'وضعیت سیستم همین‌جاست.'],
    ['فضای کاری فعلی را از پایین عوض کن.', 'جست‌وجو با Ctrl+K سریع‌تره.'],
    ['']
  ));

  // EN mirrors (shorter but still varied)
  en.dashboard = expand(
    ['Dashboard is ready.', 'Overview is live.', 'Your command center is here.', 'Widgets are waiting.', 'Main view loaded.'],
    ['Rearrange widgets anytime.', 'Each workspace keeps its layout.', 'Data stays on this device.'],
    ['']
  );
  en.crypto = expand(
    ['Crypto market opened.', 'Prices load from live sources.', 'Market section is ready.'],
    ['USD and Toman when available.', 'No fabricated numbers if the API fails.'],
    ['']
  );
  en.portfolio = expand(['Portfolio view.', 'Your recorded assets.', 'Holdings panel opened.'], ['Empty means add the first item.', 'PnL uses current prices only.'], ['']);
  en.tasks = expand(['Tasks list.', 'Work queue is here.', 'See what’s left.'], ['Due dates and priorities help.', 'Check overdue first.'], ['']);
  en.notes = expand(['Notes section.', 'Quick thoughts live here.'], ['Pin and tag to find later.'], ['']);
  en.news = expand(['News section.', 'Headlines from configured feeds.'], ['Open full story on the source site.'], ['']);
  en.calendar = expand(['Calendar opened.', 'Occasions and events.'], ['Jalali and fixed global days are exact; lunar is approximate.'], ['']);
  en.settings = expand(['Settings hub.', 'Theme, language, lock, backup.'], ['Toggle the assistant here too.'], ['']);
  en.music = expand(['Music links.', 'Pick a service.'], [''], ['']);
  en.search = expand(['Looking for something?', 'Search is open.', 'HUB first, Google if needed.'], ['Results come from real local data.'], ['']);
  en.firstVisit = expand(['Welcome to COMMANDER HUB.', 'First visit — start from the sidebar.'], ['Data stays local unless you export.'], ['']);
  en.returningVisit = expand(['Welcome back.', 'You’re here again.', 'Good to see you.'], ['Previous state is on this device.'], ['']);
  en.morning = expand(['Good morning, Commander.', 'Fresh start.'], [''], ['']);
  en.afternoon = expand(['Good afternoon.', 'Midday check-in.'], [''], ['']);
  en.evening = expand(['Good evening.', 'Wrap-up time.'], [''], ['']);
  en.night = expand(['Good night.', 'Late hours — rest matters.'], [''], ['']);

  // helpers for count
  function list(lang, key) {
    const pack = lang === 'en' ? en : fa;
    return pack[key] || pack.dashboard || [];
  }

  return { list, fa, en };
})();
