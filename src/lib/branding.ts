/**
 * Branding and Custom Logo utilities for Flow Chemistry Designer.
 * Supports persistent storage in localStorage ('app_custom_logo'),
 * Base64 Data URL conversions, SVG fallbacks, and document export integration.
 */

import { DEFAULT_BUILTIN_LOGO_BASE64 } from './defaultLogo';

export const CUSTOM_LOGO_STORAGE_KEY = 'app_custom_logo';
export const SYSTEM_DEFAULT_LOGO_KEY = 'app_default_logo';
export const CUSTOM_LOGO_HEIGHT_KEY = 'app_logo_height';
export const DEFAULT_LOGO_URL = '/logo.png';
export const DEFAULT_LOGO_HEIGHT = 36;
export const MIN_LOGO_HEIGHT = 24;
export const MAX_LOGO_HEIGHT = 64;

export function getStoredLogoHeight(): number {
  try {
    const stored = localStorage.getItem(CUSTOM_LOGO_HEIGHT_KEY);
    if (stored) {
      const val = parseInt(stored, 10);
      if (!isNaN(val) && val >= MIN_LOGO_HEIGHT && val <= MAX_LOGO_HEIGHT) {
        return val;
      }
    }
  } catch (e) {
    console.warn('Failed to read logo height from localStorage:', e);
  }
  return DEFAULT_LOGO_HEIGHT;
}

export function setStoredLogoHeight(height: number): void {
  try {
    const clamped = Math.max(MIN_LOGO_HEIGHT, Math.min(MAX_LOGO_HEIGHT, height));
    localStorage.setItem(CUSTOM_LOGO_HEIGHT_KEY, clamped.toString());
    window.dispatchEvent(new CustomEvent('app_logo_height_changed', { detail: clamped }));
  } catch (e) {
    console.error('Failed to save logo height to localStorage:', e);
  }
}

/**
 * Built-in default logo data URL (Open Process Chemistry Project - OPCP).
 * Guaranteed to render across all offline, Electron, and preview environments.
 */
export const DEFAULT_FALLBACK_SVG = DEFAULT_BUILTIN_LOGO_BASE64;

/**
 * Retrieve user-promoted system default logo from localStorage, if configured.
 */
export function getStoredSystemDefaultLogo(): string | null {
  try {
    const stored = localStorage.getItem(SYSTEM_DEFAULT_LOGO_KEY);
    if (stored && stored.trim().startsWith('data:image/')) {
      return stored.trim();
    }
  } catch (e) {
    console.warn('Failed to read system default logo from localStorage:', e);
  }
  return null;
}

/**
 * Persist the currently active logo as the permanent system default.
 */
export function setStoredSystemDefaultLogo(base64DataUrl: string): void {
  try {
    localStorage.setItem(SYSTEM_DEFAULT_LOGO_KEY, base64DataUrl);
    window.dispatchEvent(new CustomEvent('app_default_logo_changed', { detail: base64DataUrl }));
  } catch (e) {
    console.error('Failed to save system default logo to localStorage:', e);
  }
}

/**
 * Retrieve the user's custom Base64 logo from localStorage, if present.
 */
export function getStoredCustomLogo(): string | null {
  try {
    const stored = localStorage.getItem(CUSTOM_LOGO_STORAGE_KEY);
    if (stored && stored.trim().startsWith('data:image/')) {
      return stored.trim();
    }
  } catch (e) {
    console.warn('Failed to read custom logo from localStorage:', e);
  }
  return null;
}

/**
 * Save a custom Base64 logo to localStorage.
 */
export function setStoredCustomLogo(base64DataUrl: string): void {
  try {
    localStorage.setItem(CUSTOM_LOGO_STORAGE_KEY, base64DataUrl);
    // Dispatch custom event for immediate multi-component/tab synchronization
    window.dispatchEvent(new CustomEvent('app_custom_logo_changed', { detail: base64DataUrl }));
  } catch (e) {
    console.error('Failed to save custom logo to localStorage:', e);
    throw e;
  }
}

/**
 * Remove custom logo and revert to default.
 */
export function removeStoredCustomLogo(): void {
  try {
    localStorage.removeItem(CUSTOM_LOGO_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('app_custom_logo_changed', { detail: null }));
  } catch (e) {
    console.error('Failed to remove custom logo from localStorage:', e);
  }
}

/**
 * Get active display logo URL (either custom Base64 or standard /logo.png).
 */
export function getActiveLogo(customLogo?: string | null): string {
  if (customLogo && customLogo.trim().length > 0) {
    return customLogo;
  }
  const systemDefault = getStoredSystemDefaultLogo();
  if (systemDefault && systemDefault.trim().length > 0) {
    return systemDefault;
  }
  return DEFAULT_BUILTIN_LOGO_BASE64;
}

/**
 * Convert any image URL (or fallback) into a self-contained Base64 data URL.
 * Guarantees that reports and PDF exports have an embedded, offline-ready logo.
 */
export async function getActiveLogoBase64(customLogo?: string | null): Promise<string> {
  if (customLogo && customLogo.startsWith('data:image/')) {
    return customLogo;
  }

  const systemDefault = getStoredSystemDefaultLogo();
  if (systemDefault && systemDefault.startsWith('data:image/')) {
    return systemDefault;
  }

  return DEFAULT_BUILTIN_LOGO_BASE64;
}

/**
 * Read and optionally resize an image file into a Base64 Data URL.
 * Limits raster dimensions to prevent localStorage quota exhaustion (>5MB).
 * Preserves SVG vector text directly.
 */
export function processImageFileToBase64(
  file: File,
  maxDimension = 1200,
  maxFileSizeMB = 4
): Promise<{ dataUrl: string; width: number; height: number; format: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image (expected PNG, SVG, JPG, or WebP).'));
    }

    // Check raw file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      return reject(new Error(`Image file exceeds ${maxFileSizeMB}MB. Please select a smaller logo.`));
    }

    const reader = new FileReader();

    // SVGs can be read directly as DataURL without canvas rasterization
    if (file.type === 'image/svg+xml') {
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          dataUrl,
          width: 300,
          height: 100,
          format: 'SVG',
        });
      };
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsDataURL(file);
      return;
    }

    // For raster images (PNG, JPG, WebP), read and optimize on an offscreen canvas
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Scale down if dimensions are excessively large
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback to raw data URL if canvas 2D context fails
          return resolve({
            dataUrl: rawDataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            format: file.type.replace('image/', '').toUpperCase(),
          });
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Keep transparent PNG as PNG; otherwise keep original type or PNG
        const targetMime = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        const optimizedDataUrl = canvas.toDataURL(targetMime, 0.92);

        resolve({
          dataUrl: optimizedDataUrl,
          width,
          height,
          format: targetMime.replace('image/', '').toUpperCase(),
        });
      };

      img.onerror = () => reject(new Error('Could not parse image data.'));
      img.src = rawDataUrl;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
