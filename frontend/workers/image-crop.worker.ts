import {
  Jimp,
  JimpMime
} from 'jimp';
import { Area } from 'react-easy-crop';
import { InkyDisplay } from '@/lib/display-types';

self.onmessage = async (event: {
  data: { b64ImageRaw: string, croppedAreaPixels: Area, displayClass: InkyDisplay }
}): Promise<void> => {
  const { b64ImageRaw, croppedAreaPixels, displayClass } = event.data;
  try {
    // Read in the base64 of the uploaded image
    const jImage = await Jimp.read(Buffer.from(b64ImageRaw, 'base64'));
    // Crop the image to the selected cropped area
    const { x, y, width: w, height: h } = croppedAreaPixels;
    jImage.crop({ x, y, w, h });
    // Resize the image to the constraints of the chosen display
    jImage.resize({ w: displayClass.width, h: displayClass.height });

    // Convert to PNG for the dithering process (not mandatory, endpoint supports PNG and JPEG)
    const pngBase64 = await jImage.getBase64(JimpMime.png)

    self.postMessage({ pngBase64 });
  } catch (error) {
    self.postMessage({ error })
  }
}
