import {
  Jimp,
  JimpMime
} from 'jimp';
import type { Area } from 'react-easy-crop';
import type { InkyDisplay } from '@/lib/display-types';

self.onmessage = async (event: {
  data: { b64ImageRaw: string, croppedAreaPixels: Area, displayClass: InkyDisplay }
}): Promise<void> => {
  const {b64ImageRaw, croppedAreaPixels, displayClass} = event.data;
  try {
    // Read in the base64 of the uploaded image
    const jImage = await Jimp.read(base64ToArrayBuffer(b64ImageRaw));
    // Crop the image to the selected cropped area
    const {x, y, width: w, height: h} = croppedAreaPixels;
    jImage.crop({x, y, w, h});
    // Resize the image to the constraints of the chosen display
    jImage.resize({w: displayClass.width, h: displayClass.height});

    // Convert to PNG for the dithering process (not mandatory, endpoint supports PNG and JPEG)
    const pngBase64 = await jImage.getBase64(JimpMime.png)

    self.postMessage({pngBase64});
  } catch (error) {
    self.postMessage({error})
  }
}

// TODO: Consider Uint8Array.fromBase64() when it has wider support.

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Convert base64 to raw binary data
  const binary = atob(base64);
  // Create a Uint8Array to hold the binary data
  const bytes = new Uint8Array(binary.length);
  // Assign each byte value
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer
}
