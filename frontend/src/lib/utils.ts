import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}


/**
 * Constructs a complete URL for API requests for the given API path.
 * In dev, it constructs the URL using the API URL from environment variables.
 * In production mode, it constructs a relative URL.
 */
export function constructUrl(apiPath: string): string {
  // "import.meta.env.DEV" is a built-in env var set by Vite: https://vite.dev/guide/env-and-mode.html#env-variables
  const isDev = import.meta.env.DEV;
  const cleanPath = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath;
  if (isDev) {
    const baseUrl: string = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    return `${baseUrl}/api/${cleanPath}`;
  }

  // Production
  return `${window.location.origin}/api/${cleanPath}`;
}

export function pluraliseUnitIfNeeded(value: number, singularUnit: string): string {
  let unit = singularUnit;
  if (value > 1) {
    unit = `${singularUnit}s`;
  }

  return unit;
}

export async function blobToBase64(
  file: Blob,
  includeMetadata = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader: FileReader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(
          `Unexpected result from file reader: ${JSON.stringify(
            reader.result
          )}`
        );
      } else if (includeMetadata) {
        // return with metadata
        resolve(reader.result);
      } else {
        // remove metadata then return
        resolve(stripDataUriFromBase64(reader.result));
      }
    };
    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
}

export function stripDataUriFromBase64(base64: string): string {
  return base64.split(",")[1];
}

export function prependImageDataUri(rawBase64: string): string {
  let dataUri = '';
  if(rawBase64.startsWith('iVBORw0KGg')) {
    // Image is a PNG
    dataUri = `data:image/png;base64,`
  } else if(rawBase64.startsWith('/9j/')) {
    // Image is a JPEG
    dataUri = `data:image/jpeg;base64,`
  }

  return `${dataUri}${rawBase64}`
}