export async function toBase64(
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
        resolve(reader.result.split(",")[1]);
      }
    };
    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
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

export const fetcher = async (...args: [string | URL, RequestInit?]) => {
  const res = await fetch(...args);
  const data = await res.json();
  if (!res.ok) {
    const message = data.message ?? "";
    const error = new Error(
      `An error occurred while fetching the data. ${message}`
    );
    // Attach extra info to the error object.
    // error.info = await res.json()
    // error.status = res.status
    throw error;
  }

  return data;
};
