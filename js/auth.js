export const Auth = {
  goStaff: () => window.App?.goStaff?.(),
  staffLogin: () => window.App?.staffLogin?.(),
  logout: () => window.App?.show?.('s-portal'),
  validateAccess: password => String(password || '').trim() === 'piromagu2026'
};
