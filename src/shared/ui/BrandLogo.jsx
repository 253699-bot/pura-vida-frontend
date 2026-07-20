import fallbackLogo from '../assets/brand/pura-vida-logo.svg';
import { versionAssetUrl } from '../api/assets.js';
import { API_BASE_URL } from '../config/env.js';
import { useBusinessConfiguration } from '../hooks/useBusinessConfiguration.js';

function resolveLogoUrl(logoUrl) {
  if (!logoUrl) return fallbackLogo;
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl;

  if (logoUrl.startsWith('/')) {
    try {
      const apiUrl = new URL(API_BASE_URL, window.location.origin);
      return `${apiUrl.origin}${logoUrl}`;
    } catch {
      return logoUrl;
    }
  }

  return logoUrl;
}

export function BrandLogo({ className, alt }) {
  const { configuration } = useBusinessConfiguration();
  const name = configuration?.nombreFonda || 'PuraVida';
  const logoUrl = resolveLogoUrl(configuration?.logoUrl);
  const logoSrc = configuration?.logoUrl
    ? versionAssetUrl(logoUrl, configuration?.actualizadoEn)
    : logoUrl;

  return (
    <img
      className={className}
      src={logoSrc}
      alt={alt || name}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallbackLogo;
      }}
    />
  );
}
