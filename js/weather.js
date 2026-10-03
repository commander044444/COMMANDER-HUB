/* COMMANDER HUB - آب‌وهوا (ایموجی محلی، بدون عکس خارجی) */
const Weather = {
  data: null,
  location: null,

  async fetchTimeout(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms || 6000);
    try {
      const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  },

  async fetchByCoords(lat, lon) {
    // 1) Open-Meteo اول (سبک، بدون عکس)
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
      const res = await this.fetchTimeout(url, 6000);
      if (!res.ok) throw new Error('open-meteo');
      const data = await res.json();
      if (!data.current) throw new Error('no current');
      data.source = 'Open-Meteo';
      return data;
    } catch (e1) {
      // 2) wttr.in پشتیبان
      try {
        const url = `https://wttr.in/${lat},${lon}?format=j1`;
        const res = await this.fetchTimeout(url, 6000);
        if (!res.ok) throw new Error('wttr');
        const data = await res.json();
        const c = (data.current_condition && data.current_condition[0]) || {};
        const desc = (c.lang_fa && c.lang_fa[0] && c.lang_fa[0].value) ||
          (c.weatherDesc && c.weatherDesc[0] && c.weatherDesc[0].value) || '';
        return {
          source: 'wttr.in',
          current: {
            temperature_2m: Number(c.temp_C),
            relative_humidity_2m: Number(c.humidity),
            wind_speed_10m: Number(c.windspeedKmph),
            weather_code: Number(c.weatherCode || 0),
            description_fa: desc
          }
        };
      } catch (e2) {
        throw new Error('weather unavailable');
      }
    }
  },

  async geocode(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fa`;
    const res = await this.fetchTimeout(url, 6000);
    if (!res.ok) throw new Error('Geocode error');
    const data = await res.json();
    if (!data.results || !data.results.length) throw new Error('City not found');
    return data.results[0];
  },

  weatherCodeToIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '🌨️';
    if (code <= 82) return '🌦️';
    if (code <= 99) return '⛈️';
    return '🌡️';
  },

  weatherCodeToText(code) {
    const map = {
      0: 'آفتابی و صاف', 1: 'عمدتاً صاف', 2: 'نیمه‌ابری', 3: 'ابری',
      45: 'مه', 48: 'مه یخ‌زده', 51: 'نم‌نم خفیف', 53: 'نم‌نم', 55: 'نم‌نم شدید',
      61: 'باران خفیف', 63: 'باران', 65: 'باران شدید', 71: 'برف خفیف', 73: 'برف', 75: 'برف شدید',
      80: 'رگبار خفیف', 81: 'رگبار', 82: 'رگبار شدید', 95: 'رعد و برق', 96: 'رعد و تگرگ', 99: 'رعد و تگرگ شدید'
    };
    return map[code] || 'نامشخص';
  },

  async render(el) {
    if (!el) return;
    el.innerHTML = `<div class="loading-state">${t('common.loading')}</div>`;
    try {
      let loc = AppState.weatherLocation;
      if (!loc) loc = { lat: 35.6892, lon: 51.3890, name: 'تهران' };
      const data = await this.fetchByCoords(loc.lat, loc.lon);
      this.data = data;
      this.location = loc;
      const cur = data.current;
      if (!cur || cur.temperature_2m == null || Number.isNaN(Number(cur.temperature_2m))) {
        throw new Error('bad data');
      }
      const icon = this.weatherCodeToIcon(Number(cur.weather_code) || 0);
      el.innerHTML = `
        <div class="weather-main">
          <div class="weather-icon" aria-hidden="true">${icon}</div>
          <div>
            <div class="weather-temp">${Math.round(Number(cur.temperature_2m))}°C</div>
            <div class="weather-desc">${escapeHtml(cur.description_fa || this.weatherCodeToText(Number(cur.weather_code) || 0))}</div>
          </div>
        </div>
        <div class="weather-details">
          <span>💧 ${t('weather.humidity')}: ${cur.relative_humidity_2m != null ? cur.relative_humidity_2m : '—'}٪</span>
          <span>💨 ${t('weather.wind')}: ${cur.wind_speed_10m != null ? Math.round(Number(cur.wind_speed_10m)) : '—'} کیلومتر/ساعت</span>
        </div>
        <div class="weather-location">
          <span>📍 ${escapeHtml(loc.name || '')}${data.source ? ' · ' + escapeHtml(data.source) : ''}</span>
          <button class="btn-text" onclick="Weather.promptLocation()">${t('weather.location')}</button>
        </div>`;
    } catch (e) {
      el.innerHTML = `<div class="error-state">${t('weather.error')}<br>
        <button class="btn btn-secondary" style="margin-top:0.5rem" onclick="Weather.promptLocation()">${t('weather.search')}</button>
        <button class="btn btn-secondary" style="margin-top:0.5rem" onclick="Weather.useGeo()">${t('weather.useLocation')}</button>
        <button class="btn btn-secondary" style="margin-top:0.5rem" onclick="Weather.refresh()">${t('common.retry')}</button>
      </div>`;
    }
  },

  async promptLocation() {
    const city = prompt(t('weather.search') || 'نام شهر را وارد کنید (مثلاً تهران)');
    if (!city) return;
    try {
      const r = await this.geocode(city.trim());
      AppState.weatherLocation = {
        lat: r.latitude, lon: r.longitude,
        name: r.name + (r.admin1 ? '، ' + r.admin1 : '')
      };
      Storage.save('weatherLocation', AppState.weatherLocation);
      this.refresh();
    } catch (e) {
      if (typeof showToast === 'function') showToast(t('weather.error'), 'error');
    }
  },

  useGeo() {
    if (!navigator.geolocation) {
      if (typeof showToast === 'function') showToast(t('weather.permission'), 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        AppState.weatherLocation = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          name: AppState.language === 'fa' ? 'موقعیت من' : 'My location'
        };
        Storage.save('weatherLocation', AppState.weatherLocation);
        this.refresh();
      },
      () => { if (typeof showToast === 'function') showToast(t('weather.permission'), 'error'); },
      { timeout: 8000 }
    );
  },

  refresh() {
    const el = document.getElementById('weather-content');
    if (el) this.render(el);
    else if (AppState.currentView === 'dashboard') renderCurrentView();
  }
};
