import type { ApiResponse } from "@/types/api-types";

export async function fetchWithErrorHandling<T>(
  url: string | URL | Request,
  options: RequestInit = {},
  alertFn: (message: string) => void,
  messageHandler: (message: string) => void = message => console.log(message),
): Promise<T | null> {
  const response: Response = await fetch(url, options)
    .catch((err) => {
      alertFn(`Fetch error: ${err}`);
      throw new Error(`Fetch error: ${err}`);
    });

  const responseBody: ApiResponse<T> | null = ( await response.json() ) ?? null;

  if (!response.ok) {
    // Not OK (status code is NOT in the range 200-299)
    // const errorData: FailedApiResponse<T> = responseBody;
    if (responseBody?.errors) {
      // there can be more than one error
      responseBody.errors.forEach((error) => {
        alertFn(`${responseBody.message} ${error}`);
      });
      // concatenate the errors for the throw
      const concatErrors = responseBody.errors.join(', ');
      throw new Error(`${responseBody.message} ${concatErrors}`);
    } else if (responseBody?.message) {
      alertFn(responseBody.message);
      throw new Error(responseBody.message);
    } else {
      alertFn('Failed request, no error message from server');
      throw new Error('Failed request, no error message from server');
    }
  } else if (responseBody?.message) {
    messageHandler(responseBody.message);
  }

  // Response is OK return data
  return responseBody?.data ?? null;
}