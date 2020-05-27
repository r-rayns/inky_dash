import { Dispatch } from 'redux';
import { ErrorActions } from './errors.enum';
import { HttpError } from './errors.interface';

export function dispatchHttpError(dispatch: Dispatch, err: string[]): HttpError {
  dispatch({
    type: ErrorActions.HTTP_ERROR,
    payload: { errors: err }
  })
  throw(err);
}
