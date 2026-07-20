import { API_BASE_URL } from '../config/env.js';

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i;

export function resolveApiAssetUrl(value) {
  const rawValue = typeof value === 'string' ? value.trim() : '';

  if (!rawValue) {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(rawValue) || rawValue.startsWith('//')) {
    return rawValue;
  }

  if (/^https?:\/\//i.test(API_BASE_URL)) {
    const baseUrl = new URL(API_BASE_URL);

    if (rawValue.startsWith('/')) {
      return `${baseUrl.origin}${rawValue}`;
    }

    const basePath = baseUrl.pathname.endsWith('/') ? baseUrl.pathname : `${baseUrl.pathname}/`;
    return new URL(rawValue, `${baseUrl.origin}${basePath}`).toString();
  }

  if (rawValue.startsWith('/')) {
    return rawValue;
  }

  return `${API_BASE_URL.replace(/\/+$/, '')}/${rawValue.replace(/^\/+/, '')}`;
}

export function versionAssetUrl(value, version) {
  const rawValue = typeof value === 'string' ? value.trim() : '';
  const rawVersion = version == null ? '' : String(version).trim();

  if (!rawValue || !rawVersion) {
    return rawValue || null;
  }

  const separator = rawValue.includes('?') ? '&' : '?';
  return `${rawValue}${separator}v=${encodeURIComponent(rawVersion)}`;
}
