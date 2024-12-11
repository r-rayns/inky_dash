export async function fetchWithErrorHandling<T>(
  url: string | URL | Request,
  options: RequestInit = {},
  alertFn: (message: string) => void,
  messageHandler: (message: string) => void = message => console.log(message),
): Promise<T | null> {
  const response = await fetch(url, options)
    .catch((err) => {
      alertFn(`Fetch error: ${ err }`);
      throw new Error(`Fetch error: ${ err }`);
    });

  const responseBody: ApiResponse<T> | null = (await response?.json()) ?? null;

  if (!response) {
    alertFn('Failed request, no response from server');
    throw new Error('Failed request, no response from server');
  } else if (!response.ok) {
    // Not ok (status code is NOT in the range 200-299)
    // const errorData: FailedApiResponse<T> = responseBody;
    if (responseBody?.errors) {
      // there can be more than one error
      responseBody.errors.forEach((error) => {
        alertFn(`${ responseBody?.message } ${ error }`);
      });
      // concatenate the errors for the throw
      const concatErrors = responseBody.errors.join(', ');
      throw new Error(`${ responseBody?.message } ${ concatErrors }`);
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

  return responseBody?.data ?? null;
}

export interface ServerError {
  message: string;
}

export interface FetchResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T | null;
  errors?: string[];
}

export interface SuccessfulApiResponse<T> extends ApiResponse<T> {
  data: T | null;
  errors: undefined;
}

export interface FailedApiResponse<T> extends ApiResponse<T> {
  data: undefined;
  errors: string[];
}
