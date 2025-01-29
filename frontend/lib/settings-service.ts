import {
  BorderColour,
  DisplayMode,
  DisplayType,
  Palette
} from './display-types';
import { fetchWithErrorHandling } from './fetcher';
import { constructUrl } from './utils';

export async function updateSettings(
    displaySettings: Partial<DisplaySettings>,
    alertFn: (message: string) => void
): Promise<SetDisplayResponse | null | void> {
    return fetchWithErrorHandling<SetDisplayResponse>(
        constructUrl('settings'),
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: displaySettings.type,
                colour_palette: displaySettings.colourPalette,
                border_colour: displaySettings.borderColour,
                mode: displaySettings.mode
            }),
        },
        alertFn
    ).catch((error: Error) => {
        console.error('Error updating display settings', error);
    });
}

export type ValidPalletteColours = Palette.RED | Palette.YELLOW | Palette.SEVEN_COLOUR;
export type ValidBorderColours = BorderColour.WHITE | BorderColour.BLACK;

export interface DisplaySettings {
    type: DisplayType;
    colourPalette: ValidPalletteColours;
    borderColour: ValidBorderColours;
    mode: DisplayMode;
}

export interface DisplaySettingsResponse {
    type: DisplayType;
    colour_palette: ValidPalletteColours;
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
