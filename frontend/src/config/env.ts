export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8081',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};
