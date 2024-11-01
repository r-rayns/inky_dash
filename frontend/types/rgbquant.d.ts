declare module "rgbquant" {
  export class RGBQuant {
    constructor(options: {
      colors?: number;
      method?: 1 | 2;
      boxSize?: [number, number];
      boxPxls?: number;
      initColors?: number;
      minHueCols?: number;
      dithKern?: string;
      dithDelta?: number;
      dithSerp?: boolean;
      palette?: readonly [number, number, number][];
      reIndex?: boolean;
      useCache?: boolean;
      cacheFreq?: number;
      colorDist?: 'euclidean' | 'manhattan';
    });

    sample(img: Uint8ClampedArray): void

    reduce(img: Uint8ClampedArray): Uint8Array
  }

  export default RGBQuant;
}
