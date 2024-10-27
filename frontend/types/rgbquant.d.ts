declare module "rgbquant" {
  export class RGBQuant {
    constructor(options: {
      colors: number;
      palette: readonly [number, number, number][];
      dithKern: string;
    });

    sample(img: Uint8ClampedArray): void

    reduce(img: Uint8ClampedArray): Uint8Array
  }

  export default RGBQuant;
}
