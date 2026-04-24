const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const DEFAULT_API_BASE_URL = import.meta.env.PROD ? '' : 'https://go-t-icket-backend.vercel.app';

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// import.meta.env.VITE_API_BASE_URL
//   ? trimTrailingSlash(import.meta.env.VITE_API_BASE_URL)
//   : DEFAULT_API_BASE_URL;

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const buildAssetUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
