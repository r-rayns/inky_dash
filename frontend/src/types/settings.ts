import type { DisplayMode, DisplayType, ValidBorderColours, ValidPaletteColours } from "./display";

export interface DisplaySettingsResponse {
  type: DisplayType;
  colour_palette: ValidPaletteColours;
  border_colour: ValidBorderColours;
  mode: DisplayMode;
}

export interface CurrentImageResponse {
  current_image: string | null;
}

export interface DetectDisplayResponse {
  type: DisplayType | null;
}

export interface SetDisplayResponse {
  message: string;
}