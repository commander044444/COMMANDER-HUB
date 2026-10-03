/* COMMANDER HUB - Weather (Open-Meteo, no key) */
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
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=${AppState.language === 'fa' ? 'fa' : 'en'}`;
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
      0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
      61: 'Slight rain', 63: 'Rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Snow', 75: 'Heavy snow',
      80: 'Rain showers', 81: 'Rain showers', 82: 'Violent rain showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail'
    };
    return map[code] || 'Unknown';
  },

  async render(el) {
    if (!el) return;
    el.innerHTML = `<div class="loading-state">${t('common.loading')}</div>`;
    try {
      let loc = AppState.weatherLocation;
      if (!loc) {
        loc = { lat: 35.6892, lon: 51.3890, name: 'Tehran' };
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
          <span>💧 ${t('weather.humidity')}: ${cur.relative_humidity_2m}%</span>
          <span>💨 ${t('weather.wind')}: ${Math.round(cur.wind_speed_10m)} km/h</span>
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
    const city = prompt(t('weather.search'));
    if (!city) return;
    this.setCity(city);
  },

  async setCity(city) {
    try {
      const geo = await this.geocode(city);
      AppState.weatherLocation = {
        lat: geo.latitude,
        lon: geo.longitude,
        name: geo.name + (geo.country ? ', ' + geo.country : '')
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
          name: 'My Location'
        };
        AppState.save();
        this.refresh();
      },
      () => showToast(t('weather.permission'), 'error')
    );
  }
};
