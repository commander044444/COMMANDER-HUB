/* COMMANDER HUB - Portfolio */
const Portfolio = {
  async render(container) {
    // Ensure prices
    try { await CryptoMarket.fetchData(); } catch(e) {}

    let totalValue = 0;
    let totalCost = 0;
    const items = AppState.portfolio.map(p => {
      const price = CryptoMarket.getPrice(p.coinId) || p.buyPrice || 0;
      const value = price * p.amount;
      const cost = (p.buyPrice || 0) * p.amount;
      totalValue += value;
      totalCost += cost;
      return { ...p, price, value, cost, pnl: value - cost };
    });

    const totalPnl = totalValue - totalCost;
    const pnlPct = totalCost ? ((totalPnl / totalCost) * 100) : 0;

    const tomanTotal = CryptoMarket.toToman ? CryptoMarket.toToman(totalValue) : '—';
    const tomanPnl = CryptoMarket.toToman ? CryptoMarket.toToman(Math.abs(totalPnl)) : '—';

    let html = `
      <div class="view-header">
        <h1>${t('portfolio.title')}</h1>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="Portfolio.showEditor()">${t('portfolio.add')}</button>
        </div>
      </div>
      <div class="portfolio-summary">
        <div class="portfolio-stat">
          <div class="portfolio-stat-value">$${totalValue.toLocaleString('en-US', {maximumFractionDigits: 2})}</div>
          <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:0.2rem">${tomanTotal} تومان</div>
          <div class="portfolio-stat-label">${t('portfolio.total')}</div>
        </div>
        <div class="portfolio-stat ${totalPnl >= 0 ? 'profit' : 'loss'}">
          <div class="portfolio-stat-value">${totalPnl >= 0 ? '+' : ''}$${totalPnl.toLocaleString('en-US', {maximumFractionDigits: 2})} (${pnlPct.toFixed(1)}%)</div>
          <div style="font-size:0.85rem;margin-top:0.2rem">${totalPnl >= 0 ? '+' : '−'}${tomanPnl} تومان</div>
          <div class="portfolio-stat-label">${t('portfolio.pnl')}</div>
        </div>
      </div>
      <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem">${t('portfolio.estimate')}</p>`;

    if (items.length === 0) {
      html += `<div class="empty-state">${t('portfolio.empty')}</div>`;
    } else {
      html += '<div class="portfolio-assets">';
      items.forEach(item => {
        const tomanVal = CryptoMarket.toToman ? CryptoMarket.toToman(item.value) : '—';
        html += `
          <div class="portfolio-asset">
            <div>
              <div style="font-weight:600">${escapeHtml(item.symbol || item.coinId)}</div>
              <div style="font-size:0.8rem;color:var(--text-muted)">${item.amount} × $${(item.price||0).toLocaleString()}</div>
            </div>
            <div style="text-align:end">
              <div style="font-weight:600">$${item.value.toLocaleString('en-US', {maximumFractionDigits: 2})}</div>
              <div style="font-size:0.75rem;color:var(--text-secondary)">${tomanVal} تومان</div>
              <div style="font-size:0.8rem;color:${item.pnl >= 0 ? 'var(--success)' : 'var(--danger)'}">
                ${item.pnl >= 0 ? '+' : ''}$${item.pnl.toLocaleString('en-US', {maximumFractionDigits: 2})}
              </div>
            </div>
            <div style="display:flex;gap:0.25rem">
              <button class="btn-icon" onclick="Portfolio.showEditor('${item.id}')">✏️</button>
              <button class="btn-icon" onclick="Portfolio.remove('${item.id}')">🗑️</button>
            </div>
          </div>`;
      });
      html += '</div>';
    }
    container.innerHTML = html;
  },

  renderWidget(el) {
    if (!el) return;
    try {
      let total = 0;
      AppState.portfolio.forEach(p => {
        const price = CryptoMarket.getPrice(p.coinId) || p.buyPrice || 0;
        total += price * p.amount;
      });
      const toman = CryptoMarket.toToman ? CryptoMarket.toToman(total) : '—';
      el.innerHTML = `
        <div style="text-align:center;padding:1rem">
          <div style="font-size:1.6rem;font-weight:700">$${total.toLocaleString('en-US', {maximumFractionDigits: 2})}</div>
          <div style="font-size:0.9rem;color:var(--text-secondary)">${toman} تومان</div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.35rem">${t('portfolio.total')}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.35rem">${AppState.portfolio.length} دارایی</div>
        </div>`;
    } catch {
      el.innerHTML = `<div class="empty-state">${t('portfolio.empty')}</div>`;
    }
  },

  showEditor(id) {
    const item = id ? AppState.portfolio.find(p => p.id === id) : null;
    const coins = (CryptoMarket.coins.length ? CryptoMarket.coins : AppState.cryptoCache || []).slice(0, 30);
    let options = coins.map(c => `<option value="${c.id}" data-symbol="${c.symbol}" ${item?.coinId===c.id?'selected':''}>${c.name} (${c.symbol.toUpperCase()})</option>`).join('');
    if (!options) options = `
      <option value="bitcoin">Bitcoin (BTC)</option>
      <option value="ethereum">Ethereum (ETH)</option>
      <option value="tether">Tether (USDT)</option>
      <option value="binancecoin">BNB</option>
      <option value="solana">Solana (SOL)</option>`;

    const body = `
      <div class="form-group">
        <label>${t('portfolio.coin')}</label>
        <select class="form-control" id="pf-coin">${options}</select>
      </div>
      <div class="form-group">
        <label>${t('portfolio.amount')}</label>
        <input type="number" class="form-control" id="pf-amount" value="${item?.amount || ''}" step="any" min="0">
      </div>
      <div class="form-group">
        <label>${t('portfolio.buyPrice')} (USD)</label>
        <input type="number" class="form-control" id="pf-buy" value="${item?.buyPrice || ''}" step="any" min="0">
      </div>`;

    const footer = `
      ${item ? `<button class="btn btn-danger" onclick="Portfolio.remove('${id}'); closeModal()">${t('common.delete')}</button>` : ''}
      <button class="btn btn-secondary" onclick="closeModal()">${t('common.cancel')}</button>
      <button class="btn btn-primary" onclick="Portfolio.save('${id || ''}')">${t('common.save')}</button>`;

    showModal(item ? t('portfolio.edit') : t('portfolio.add'), body, footer);
  },

  save(id) {
    const coinSelect = document.getElementById('pf-coin');
    const coinId = coinSelect.value;
    const symbol = coinSelect.selectedOptions[0]?.dataset?.symbol || coinId;
    const amount = parseFloat(document.getElementById('pf-amount').value);
    const buyPrice = parseFloat(document.getElementById('pf-buy').value);
    if (!coinId || isNaN(amount) || amount <= 0) {
      showToast(t('common.error'), 'error');
      return;
    }
    if (id) {
      const item = AppState.portfolio.find(p => p.id === id);
      if (item) {
        item.coinId = coinId;
        item.symbol = symbol.toUpperCase();
        item.amount = amount;
        item.buyPrice = isNaN(buyPrice) ? 0 : buyPrice;
      }
    } else {
      AppState.portfolio.push({
        id: Date.now().toString(),
        coinId,
        symbol: symbol.toUpperCase(),
        amount,
        buyPrice: isNaN(buyPrice) ? 0 : buyPrice,
        createdAt: new Date().toISOString()
      });
    }
    AppState.save();
    closeModal();
    this.render(document.getElementById('main-content'));
    showToast(t('toast.saved'), 'success');
  },

  remove(id) {
    if (!confirm(t('portfolio.deleteConfirm'))) return;
    AppState.portfolio = AppState.portfolio.filter(p => p.id !== id);
    AppState.save();
    this.render(document.getElementById('main-content'));
    showToast(t('toast.deleted'), 'success');
  }
};
