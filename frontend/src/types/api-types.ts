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
  errors?: Array<string>;
}

export interface SuccessfulApiResponse<T> extends ApiResponse<T> {
  data: T | null;
  errors: undefined;
}

export interface FailedApiResponse<T> extends ApiResponse<T> {
  data: undefined;
  errors: Array<string>;
}