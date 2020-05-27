import { ErrorActions } from './errors.enum';

export interface HttpError {
  type: ErrorActions,
  payload: {
    errors: string[]
  }
}

export interface ErrorState {
  error: string | null;
}
