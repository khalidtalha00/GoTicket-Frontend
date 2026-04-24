export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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
