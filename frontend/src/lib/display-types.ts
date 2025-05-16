import type { RGB } from "@/types/display";
import { DisplayMode, DisplayType, Palette } from "@/types/display";

export abstract class InkyDisplay {
  abstract name: string
  abstract type: DisplayType;
  abstract width: number;
  abstract height: number;
  abstract palettes: Array<Palette>;
}

class InkyPhat104 implements InkyDisplay {
  name = 'Inky pHAT'
  type = DisplayType.PHAT_104;
  width = 212;
  height = 104;
  palettes = [Palette.RED, Palette.YELLOW];
}

class InkyPhat122 implements InkyDisplay {
  name = 'Inky pHAT'
  type = DisplayType.PHAT_122;
  width = 250;
  height = 122;
  palettes = [Palette.RED, Palette.YELLOW];
}

class InkyImpression400 implements InkyDisplay {
  name = 'Inky Impression 4"'
  type = DisplayType.IMPRESSION_400;
  width = 640;
  height = 400;
  palettes = [Palette.SEVEN_COLOUR];
}

class InkyImpression448 implements InkyDisplay {
  name = 'Inky Impression 5.7"'
  type = DisplayType.IMPRESSION_448;
  width = 600;
  height = 448;
  palettes = [Palette.SEVEN_COLOUR];
}

class InkyImpression480 implements InkyDisplay {
  name = 'Inky Impression 7.3"'
  type = DisplayType.IMPRESSION_480;
  width = 800;
  height = 480;
  palettes = [Palette.SEVEN_COLOUR];
}

export const paletteLabel: Record<Palette, string> = {
  [Palette.RED]: 'Red',
  [Palette.YELLOW]: 'Yellow',
  [Palette.SEVEN_COLOUR]: '7 Colour',
}

export const displayModeLabel: Record<DisplayMode, string> = {
  [DisplayMode.SLIDESHOW]: 'Slideshow',
  [DisplayMode.IMAGE_FEED]: 'Image Feed',
}

export const displayClassByType: Record<DisplayType, InkyDisplay> = {
  [DisplayType.PHAT_104]: new InkyPhat104(),
  [DisplayType.PHAT_122]: new InkyPhat122(),
  [DisplayType.IMPRESSION_400]: new InkyImpression400(),
  [DisplayType.IMPRESSION_448]: new InkyImpression448(),
  [DisplayType.IMPRESSION_480]: new InkyImpression480(),
};

export function isDisplayType(value: unknown): value is DisplayType {
  return (
    typeof value === 'string' &&
    Object.values(DisplayType).includes(value as DisplayType)
  );
}


/**
 * Get the RGB palette for the given `Palette` value.
 * @returns An array of 3-element arrays, where each element is an RGB value.
 */
export function getRgbPalette(paletteType: Palette | undefined): ReadonlyArray<RGB> {
  switch (paletteType) {
    case Palette.RED: {
      const white: RGB = [255, 255, 255];
      const black: RGB = [0, 0, 0];
      const red: RGB = [255, 0, 0];
      return [white, black, red];
    }
    case Palette.YELLOW: {
      const white: RGB = [255, 255, 255];
      const black: RGB = [0, 0, 0];
      const yellow: RGB = [255, 255, 0];
      return [white, black, yellow];
    }
    case Palette.SEVEN_COLOUR: {
      const black: RGB = [28, 24, 28];
      const white: RGB = [255, 255, 255];
      const green: RGB = [29, 173, 35];
      const blue: RGB = [30, 29, 174];
      const red: RGB = [205, 36, 37];
      const yellow: RGB = [231, 222, 35];
      const orange: RGB = [216, 123, 36];
      return [black, white, green, blue, red, yellow, orange];
    }
    default: {
      const black: RGB = [28, 24, 28];
      const white: RGB = [255, 255, 255];
      return [black, white];
    }
  }
}
