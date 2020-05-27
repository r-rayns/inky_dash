import { HttpResponse } from '../../globals/models/http.interface';
import { Border, DisplayActions, Palette } from './display.enum';

export interface DisplayState{
  image: string | null;
  preview: string | null;
  fetching: boolean;
  uploading: boolean;
  error: string | null;
}

export interface DisplayAction {
  type: DisplayActions;
  payload: {};
}

export interface UploadImage {
  image: string;
  palette_colour: Palette;
  border_colour: Border;
}

export interface UploadResponse extends HttpResponse {
  image: string;
}

export interface RetrieveResponse extends HttpResponse {
  image: string;
}
