import { DisplayMode, DisplayType, Palette } from '@/types/display'

export abstract class InkyDisplay {
  abstract name: string
  abstract type: DisplayType
  abstract width: number
  abstract height: number
  abstract palettes: Array<Palette>
}

class InkyPhat104 implements InkyDisplay {
  name = 'Inky pHAT'
  type = DisplayType.PHAT_104
  width = 212
  height = 104
  palettes = [Palette.RED, Palette.YELLOW]
}

class InkyPhat122 implements InkyDisplay {
  name = 'Inky pHAT'
  type = DisplayType.PHAT_122
  width = 250
  height = 122
  palettes = [Palette.RED, Palette.YELLOW]
}

class InkyImpression400 implements InkyDisplay {
  name = 'Inky Impression 4"'
  type = DisplayType.IMPRESSION_400
  width = 640
  height = 400
  palettes = [Palette.SEVEN_COLOUR]
}

class InkyImpression448 implements InkyDisplay {
  name = 'Inky Impression 5.7"'
  type = DisplayType.IMPRESSION_448
  width = 600
  height = 448
  palettes = [Palette.SEVEN_COLOUR]
}

class InkyImpression480 implements InkyDisplay {
  name = 'Inky Impression 7.3"'
  type = DisplayType.IMPRESSION_480
  width = 800
  height = 480
  palettes = [Palette.SEVEN_COLOUR]
}

class InkyImpressionSpectra480 implements InkyDisplay {
  name = 'Inky Impression 7.3" 2025 ed.'
  type = DisplayType.SPECTRA_480
  width = 800
  height = 480
  palettes = [Palette.SPECTRA]
}

class InkyImpressionSpectra1200 implements InkyDisplay {
  name = 'Inky Impression 13.3"'
  type = DisplayType.SPECTRA_1200
  width = 1600
  height = 1200
  palettes = [Palette.SPECTRA]
}

export const paletteLabel: Record<Palette, string> = {
  [Palette.RED]: 'Red',
  [Palette.YELLOW]: 'Yellow',
  [Palette.SEVEN_COLOUR]: '7 Colour',
  [Palette.SPECTRA]: 'Spectra (6 Colour)',
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
  [DisplayType.SPECTRA_480]: new InkyImpressionSpectra480(),
  [DisplayType.SPECTRA_1200]: new InkyImpressionSpectra1200(),
}

export function isDisplayType(value: unknown): value is DisplayType {
  return (
    typeof value === 'string' &&
    Object.values(DisplayType).includes(value as DisplayType)
  )
}
