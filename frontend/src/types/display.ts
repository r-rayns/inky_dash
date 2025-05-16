export interface DisplaySettings {
  type: DisplayType;
  colourPalette: ValidPaletteColours;
  borderColour: ValidBorderColours;
  mode: DisplayMode;
}

export enum DisplayType {
  PHAT_104 = 'phat104',
  PHAT_122 = 'phat122',
  IMPRESSION_400 = 'impression400',
  IMPRESSION_448 = 'impression448',
  IMPRESSION_480 = 'impression480',
}

export enum DetectionError {
  UNSUPPORTED = 'unsupported'
}

export enum Palette {
  RED = 'red',
  YELLOW = 'yellow',
  SEVEN_COLOUR = '7Colour',
}

export enum BorderColour {
  WHITE = 'white',
  BLACK = 'black'
}

export enum DisplayMode {
  SLIDESHOW = 'slideshow',
  IMAGE_FEED = 'image_feed',
}

export type RGB = [ number, number, number ];
export type ValidPaletteColours = Palette.RED | Palette.YELLOW | Palette.SEVEN_COLOUR;
export type ValidBorderColours = BorderColour.WHITE | BorderColour.BLACK;

export const DefaultSettings = {
  type: DisplayType.PHAT_104,
  colourPalette: Palette.RED,
  mode: DisplayMode.SLIDESHOW,
  borderColour: BorderColour.BLACK
} as const;