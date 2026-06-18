const localApiHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? `http://${localApiHost}:8080`,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};
