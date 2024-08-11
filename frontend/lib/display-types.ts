
export abstract class InkyDisplay {
  abstract type: DisplayType;
  abstract width: number;
  abstract height: number;
  abstract palettes: Palette[];
}

class InkyPhat104 implements InkyDisplay {
  type = DisplayType.PHAT_104;
  width = 212;
  height = 104;
  palettes = [Palette.RED, Palette.YELLOW];
}

class InkyPhat122 implements InkyDisplay {
  type = DisplayType.PHAT_122;
  width = 250;
  height = 122;
  palettes = [Palette.RED, Palette.YELLOW];
}

class InkyImpression400 implements InkyDisplay {
  type = DisplayType.IMPRESSION_400;
  width = 640;
  height = 400;
  palettes = [Palette.SEVEN_COLOUR];
}

class InkyImpression448 implements InkyDisplay {
  type = DisplayType.IMPRESSION_448;
  width = 600;
  height = 448;
  palettes = [Palette.SEVEN_COLOUR];
}

class InkyImpression480 implements InkyDisplay {
  type = DisplayType.IMPRESSION_480;
  width = 800;
  height = 480;
  palettes = [Palette.SEVEN_COLOUR];
}

export enum DisplayType {
  PHAT_104 = "phat104",
  PHAT_122 = "phat122",
  IMPRESSION_400 = "impression400",
  IMPRESSION_448 = "impression448",
  IMPRESSION_480 = "impression480",
}

export enum Palette {
  RED = 'red',
  YELLOW = 'yellow',
  SEVEN_COLOUR = '7Colour'
}

export const displayClassByType: Record<DisplayType, InkyDisplay> = {
  [DisplayType.PHAT_104]: new InkyPhat104(),
  [DisplayType.PHAT_122]: new InkyPhat122(),
  [DisplayType.IMPRESSION_400]: new InkyImpression400(),
  [DisplayType.IMPRESSION_448]: new InkyImpression448(),
  [DisplayType.IMPRESSION_480]: new InkyImpression480()
}

export function isDisplayType(value: unknown): value is DisplayType {
  return typeof value === 'string' && Object.values(DisplayType).includes(value as DisplayType);
}