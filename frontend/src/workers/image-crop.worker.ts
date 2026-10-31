import type { Area } from 'react-easy-crop'
import type { InkyDisplay } from '@/lib/display-types'

self.onmessage = async (event: {
  data: {
    b64Image: string
    croppedAreaPixels: Area
    displayClass: InkyDisplay
  }
}): Promise<void> => {
  const { b64Image, croppedAreaPixels, displayClass } = event.data
  try {
    // Decode the b64 image data URL into an ImageBitmap for canvas operations
    const blob = await fetch(b64Image).then((res) => res.blob())
    const bitmap: ImageBitmap = await createImageBitmap(blob)

    // Crop and resize to display dimensions
    const { x, y, width: w, height: h } = croppedAreaPixels
    const resizeCanvas = new OffscreenCanvas(
      displayClass.width,
      displayClass.height,
    )
    resizeCanvas
      .getContext('2d')
      ?.drawImage(
        bitmap,
        x,
        y,
        w,
        h,
        0,
        0,
        displayClass.width,
        displayClass.height,
      )

    // Convert to PNG for the dithering process
    const resizedPng = await resizeCanvas.convertToBlob({ type: 'image/png' })
    const pngBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result)
        else reject(new Error('Unexpected FileReader result type'))
      }
      reader.onerror = reject
      reader.readAsDataURL(resizedPng)
    })

    self.postMessage({ pngBase64 })
  } catch (error) {
    self.postMessage({ error })
  }
}
