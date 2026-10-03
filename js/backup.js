/* COMMANDER HUB - Backup & Restore */
const Backup = {
  export() {
    const data = Storage.exportAll();
    if (!data) {
      showToast(t('toast.error'), 'error');
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commander-hub-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('toast.exported'), 'success');
  },

  import() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data._exportMeta || data._exportMeta.app !== 'COMMANDER HUB') {
          showToast(AppState.language === 'fa' ? 'فایل نامعتبر است' : 'Invalid backup file', 'error');
          return;
        }
        if (!confirm(t('confirm.overwrite'))) return;
        const result = Storage.importAll(data);
        if (result.ok) {
          AppState.init();
          applyAppearance();
          setLanguage(AppState.language);
          Workspaces.initSelect();
          renderCurrentView();
          showToast(t('toast.imported'), 'success');
        } else {
          showToast(t('toast.error'), 'error');
        }
      } catch (err) {
        showToast(t('toast.error'), 'error');
      }
    };
    input.click();
  },

  reset() {
    if (!confirm(t('settings.resetConfirm'))) return;
    if (!confirm(t('confirm.delete'))) return;
    Storage.clear();
    AppState.init();
    applyAppearance();
    setLanguage('fa');
    Workspaces.initSelect();
    navigateTo('dashboard');
    showToast(t('toast.reset'), 'success');
  }
};
