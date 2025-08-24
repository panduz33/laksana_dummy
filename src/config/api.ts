const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sqlite3-production-f657.up.railway.app';
console.log('API_BASE_URL:', API_BASE_URL); // Debug log

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/api/login`,
  logout: `${API_BASE_URL}/api/logout`,
  authStatus: `${API_BASE_URL}/api/auth/status`,
  komoditas: `${API_BASE_URL}/api/komoditas`,
  peminjaman: `${API_BASE_URL}/api/peminjaman`,
  deviceLoans: `${API_BASE_URL}/api/device-loans`,
};

export default API_BASE_URL;