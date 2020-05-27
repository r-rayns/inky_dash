import { combineReducers } from 'redux';
import { errorsSlice } from '../services/errors/errors.reducers';
import { ErrorState } from '../services/errors/errors.interface';
import { displaySlice } from '../services/display/display.reducers';
import { DisplayState } from '../services/display/display.interface';

export default combineReducers({
  displaySlice, errorsSlice
})

export interface RootState {
  displaySlice: DisplayState,
  errorsSlice: ErrorState
}
