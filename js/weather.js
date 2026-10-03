/* COMMANDER HUB - آب و هوا (Open-Meteo + توضیحات فارسی) */
const Weather = {
  data: null,
  location: null,

  async fetchByCoords(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');
    return res.json();
  },

  async geocode(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fa`;
    const res = await fetch(url);
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
      0: 'آفتابی و صاف',
      1: 'عمدتاً صاف',
      2: 'نیمه‌ابری',
      3: 'ابری',
      45: 'مه',
      48: 'مه یخ‌زده',
      51: 'نم‌نم باران خفیف',
      53: 'نم‌نم باران',
      55: 'نم‌نم باران شدید',
      61: 'باران خفیف',
      63: 'باران',
      65: 'باران شدید',
      66: 'باران یخ‌زده خفیف',
      67: 'باران یخ‌زده',
      71: 'برف خفیف',
      73: 'برف',
      75: 'برف شدید',
      77: 'دانه‌های برف',
      80: 'رگبار خفیف',
      81: 'رگبار',
      82: 'رگبار شدید',
      85: 'رگبار برف خفیف',
      86: 'رگبار برف شدید',
      95: 'رعد و برق',
      96: 'رعد و برق با تگرگ خفیف',
      99: 'رعد و برق با تگرگ شدید'
    };
    return map[code] || 'نامشخص';
  },

  async render(el) {
    if (!el) return;
    el.innerHTML = `<div class="loading-state">${t('common.loading')}</div>`;
    try {
      let loc = AppState.weatherLocation;
      if (!loc) {
        loc = { lat: 35.6892, lon: 51.3890, name: 'تهران' };
      }
      const data = await this.fetchByCoords(loc.lat, loc.lon);
      this.data = data;
      this.location = loc;
      const cur = data.current;
      const icon = this.weatherCodeToIcon(cur.weather_code);
      el.innerHTML = `
        <div class="weather-main">
          <div class="weather-icon">${icon}</div>
          <div>
            <div class="weather-temp">${Math.round(cur.temperature_2m)}°C</div>
            <div class="weather-desc">${this.weatherCodeToText(cur.weather_code)}</div>
          </div>
        </div>
        <div class="weather-details">
          <span>💧 ${t('weather.humidity')}: ${cur.relative_humidity_2m}٪</span>
          <span>💨 ${t('weather.wind')}: ${Math.round(cur.wind_speed_10m)} کیلومتر/ساعت</span>
        </div>
        <div class="weather-location">
          📍 ${escapeHtml(loc.name || '—')}
          <button class="btn-text" onclick="Weather.promptLocation()">${t('weather.location')}</button>
        </div>`;
    } catch (e) {
      el.innerHTML = `<div class="error-state">${t('weather.error')}<br>
        <button class="btn btn-secondary" style="margin-top:0.5rem" onclick="Weather.promptLocation()">${t('weather.search')}</button>
        <button class="btn btn-secondary" style="margin-top:0.5rem" onclick="Weather.useGeo()">${t('weather.useLocation')}</button>
      </div>`;
    }
  },

  async refresh() {
    if (AppState.currentView === 'dashboard') renderCurrentView();
  },

  promptLocation() {
    const city = prompt(t('weather.search') || 'نام شهر را وارد کنید (مثلاً تهران، اصفهان، مشهد)');
    if (!city) return;
    this.setCity(city);
  },

  async setCity(city) {
    try {
      const geo = await this.geocode(city);
      AppState.weatherLocation = {
        lat: geo.latitude,
        lon: geo.longitude,
        name: geo.name + (geo.country ? '، ' + geo.country : '')
      };
      AppState.save();
      this.refresh();
      showToast(t('toast.saved'), 'success');
    } catch (e) {
      showToast(t('weather.error'), 'error');
    }
  },

  useGeo() {
    if (!navigator.geolocation) {
      showToast(t('weather.permission'), 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        AppState.weatherLocation = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          name: 'موقعیت من'
        };
        AppState.save();
        this.refresh();
      },
      () => showToast(t('weather.permission'), 'error')
    );
  }
};
