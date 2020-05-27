import { GET, POST } from '../../globals/utils/http';
import { Dispatch } from 'redux';
import { DisplayActions } from './display.enum';
import { DisplayAction, RetrieveResponse, UploadImage, UploadResponse } from './display.interface';

const url = `display`;

export function getImage(dispatch: Dispatch): Promise<DisplayAction> {
  dispatch({
    type: DisplayActions.GET_IMAGE,
  })
  return GET(`${ url }`, dispatch)
    .then(
      (res: RetrieveResponse) => dispatch({
        type: DisplayActions.GET_IMAGE_SUCCESS,
        payload: { image: res.image }
      }),
      err => dispatch({
        type: DisplayActions.GET_IMAGE_FAILURE,
        payload: { error: err }
      })
    )
}

export function uploadImage(dispatch: Dispatch, data: UploadImage): Promise<DisplayAction> {
  dispatch({
    type: DisplayActions.UPLOAD_IMAGE
  });
  return POST(`${ url }/upload`, data, dispatch)
    .then(
      (res: UploadResponse) => dispatch({
        type: DisplayActions.UPLOAD_IMAGE_SUCCESS,
        payload: { image: res.image }
      }),
      err => dispatch({
        type: DisplayActions.UPLOAD_IMAGE_FAILURE,
        payload: { error: err }
      })
    )
}

export function setPreview(dispatch: Dispatch, base64: string | null): void {
  dispatch({
    type: DisplayActions.SET_PREVIEW,
    payload: { preview: base64 }
  });
}
