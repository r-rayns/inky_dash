import { DisplayType, Palette } from './display-types';
import { FetchResponse, fetchWithErrorHandling } from "./fetcher";
import { constructUrl } from "./utils";

export async function setDisplay(
  displaySettings: DisplaySettings,
  alertFn: (message: string) => void
): Promise<FetchResponse<SetDisplayResponse> | null | void> {
  return fetchWithErrorHandling<SetDisplayResponse>(
    constructUrl("display"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: displaySettings.type,
        colour_palette: displaySettings.colourPalette,
        border_colour: displaySettings.borderColour,
        change_delay: displaySettings.changeDelay,
        images: displaySettings.images,
      }),
    },
    alertFn
  ).catch((error: Error) => {
    console.error("Error setting display", error);
  });
}

export type ValidPalletteColours = Palette.RED | Palette.YELLOW | Palette.SEVEN_COLOUR;
export type ValidBorderColours = "white" | "black";

export interface DisplaySettings {
  type: DisplayType;
  colourPalette: ValidPalletteColours;
  borderColour: ValidBorderColours;
  changeDelay: number;
  images: string[]; // base64 PNGs
}

export interface DisplaySettingsResponse {
  type: DisplayType;
  colour_palette: ValidPalletteColours;
  border_colour: ValidBorderColours;
  change_delay: number;
  images: string[]; // base64 PNGs
  message?: string;
}

export interface SetDisplayResponse {
  message: string;
}
