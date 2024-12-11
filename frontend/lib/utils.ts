import {
  type ClassValue,
  clsx
} from 'clsx'
import { twMerge } from 'tailwind-merge'

export async function blobToBase64(
  file: Blob,
  includeMetadata = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader: FileReader = new FileReader();
    reader.onload = () => {
      if (typeof reader?.result !== "string") {
        reject(
          `Unexpected result from file reader: ${JSON.stringify(
            reader?.result
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

export function constructUrl(apiPath: string): string {
  const isDev = process.env.NODE_ENV === "development";
  let currentUrl = "";
  if (isDev) {
    currentUrl = "http://localhost:8080";
  } else if (typeof window !== "undefined") {
    currentUrl = window.location.origin;
  }
  return `${currentUrl}/api/${apiPath}`;
}

export function pluraliseUnitIfNeeded(
  value: number,
  singularUnit: string
): string {
  let unit = singularUnit;
  if (value > 1) {
    unit = `${singularUnit}s`;
  }

  return unit;
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

export const fetcher = async (...args: [string | URL, RequestInit?]) => {
  const res = await fetch(...args);
  const data = await res.json();
  if (!res.ok) {
    const message = data.message ?? "";
    throw new Error(
      `An error occurred while fetching the data. ${ message }`
    );
  }

  return data;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
