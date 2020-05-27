import { DisplayState } from './display.interface';
import { DisplayActions } from './display.enum';

export function displaySlice(
  state: DisplayState = {
    image: null,
    preview: null,
    fetching: false,
    uploading: false,
    error: null
  }, action: any) {
  switch (action.type) {
    case DisplayActions.GET_IMAGE: {
      return Object.assign({}, state, {
        fetching: true,
        error: null
      });
    }
    case  DisplayActions.GET_IMAGE_SUCCESS: {
      return Object.assign({}, state, {
        image: action.payload.image,
        fetching: false,
      });
    }
    case  DisplayActions.GET_IMAGE_FAILURE: {
      return Object.assign({}, state, {
        error: action.payload.error,
        fetching: false,
      });
    }
    case  DisplayActions.UPLOAD_IMAGE: {
      return Object.assign({}, state, {
        uploading: true,
      });
    }
    case  DisplayActions.UPLOAD_IMAGE_SUCCESS: {
      return Object.assign({}, state, {
        image: action.payload.image,
        uploading: false,
      });
    }
    case  DisplayActions.UPLOAD_IMAGE_FAILURE: {
      return Object.assign({}, state, {
        error: action.payload.error,
        uploading: false,
      });
    }
    case DisplayActions.SET_PREVIEW: {
      return Object.assign({}, state, {
        preview: action.payload.preview
      });
    }
    default:
      return state;
  }
}
