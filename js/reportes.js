export const Reportes = {
  exportCSV: () => window.Dash?.exportCSV?.(),
  updateKPIs: () => window.Dash?.updatePanelKPIs?.(),
  analytics: () => window.Dash?.initAnalytics?.()
};
