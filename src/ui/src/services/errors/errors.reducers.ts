import { ErrorState } from './errors.interface';
import { ErrorActions } from './errors.enum';

export function errorsSlice(
  state: ErrorState = {
    error: null
  }, action: any) {
  switch (action.type) {
    case ErrorActions.HTTP_ERROR: {
      return Object.assign({}, state, {
        error: action.payload.errors
      });
    }
    default:
      return state;
  }
}
