import { createStore } from 'redux';
import rootReducer from './reducers';

export default createStore(
  rootReducer /* preloadedState, */,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
);

