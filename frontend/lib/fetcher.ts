export async function fetchWithErrorHandling<T>(
  url: string | URL | Request,
  options: RequestInit = {},
  alertFn: (message: string) => void
): Promise<FetchResponse<T> | null> {
  const response = await fetch(url, options).catch((err) => {
    alertFn(`Fetch error: ${err}`);
    throw new Error(`Fetch error: ${err}`);
  });

  const responseBody = (await response?.json()) ?? null;

  if (!response) {
    alertFn("Failed request, no response from server");
    throw new Error("Failed request, no response from server");
  } else if (!response.ok) {
    // not ok (status code is NOT in the range 200-299)
    const errorData: ServerError = responseBody;
    if (errorData?.errors) {
      // there can be more than one error
      errorData.errors.forEach((error) => {
        alertFn(`${errorData?.message} ${error}`);
      });
      // concatenate the errors for the throw
      const concatErrors = errorData.errors.join(", ");
      throw new Error(`${errorData?.message} ${concatErrors}`);
    } else if (errorData?.message) {
      alertFn(errorData.message);
      throw new Error(errorData.message);
    } else {
      alertFn("Failed request, no error message from server");
      throw new Error("Failed request, no error message from server");
    }
  }

  return responseBody;
}

export interface ServerError {
  message: string;
  errors: string[];
}

export interface FetchResponse<T> {
  success: boolean;
  data: T;
}
