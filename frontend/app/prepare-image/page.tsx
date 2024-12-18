"use client";
import {useSettings} from "@/app/providers/settings-provider";
import {displayClassByType, getRgbPalette} from "@/lib/display-types";
import {blobToBase64, stripMetadataFromBase64} from "@/lib/utils";
import clsx from "clsx";
import {Jimp} from "jimp";
import Image from "next/image";
import {ChangeEvent, useRef, useState} from "react";
import Cropper, {Area} from "react-easy-crop";
import RgbQuant from "rgbquant";
import {ToastType, useToast} from "../providers/toast-provider";
import {Button} from "@/components/ui/button";

export default function Page() {
  const {displaySettings, setDisplaySettings} = useSettings();
  const {addToast} = useToast();

  const [crop, setCrop] = useState({x: 0, y: 0});
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);
  const [b64Image, setB64Image] = useState<string | null>(null);
  const [isDownloadReady, setIsDownloadReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const display = displayClassByType[displaySettings.type];

  async function onCropComplete(croppedArea: Area, croppedAreaPixels: Area) {
    setCroppedAreaPixels(croppedAreaPixels);
  }

  async function cropUpload() {
    if (b64Image && croppedAreaPixels) {
      // Read in the base64 of the uploaded image
      const jImage = await Jimp.read(Buffer.from(b64Image, "base64"));
      // Crop the image to the selected cropped area
      const {x, y, width: w, height: h} = croppedAreaPixels;
      jImage.crop({x, y, w, h});
      // Resize the image to the constraints of the chosen display
      jImage.resize({w: display.width, h: display.height});

      if (imgRef.current) {
        imgRef.current.src = await jImage.getBase64("image/png");
        setIsDownloadReady(true);
      }
    }
  }

  async function dither(bitmap: Buffer): Promise<Buffer> {
    // Get the RGB palette of the chosen display
    const displayPalette = getRgbPalette(displaySettings.colourPalette);
    const quant = new RgbQuant({
      palette: displayPalette,
      dithKern: 'FloydSteinberg',
      colors: displayPalette.length,
    });

    // Convert the bitmap to a Uint8ClampedArray ready for rgbquant
    const uint8ClampedArray = new Uint8ClampedArray(bitmap);

    // Allow rgbquant to build a colour histogram of the image for dithering
    quant.sample(uint8ClampedArray);
    // Dither the image
    const ditherRes = quant.reduce(uint8ClampedArray);

    return Buffer.from(ditherRes);
  }

  async function download() {
    if (imgRef.current) {
      const url = imgRef.current.src;

      const a = document.createElement("a");
      a.href = url;
      a.download = "image.png";
      a.click();
    }
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const inputElement: HTMLInputElement = event?.currentTarget;
    let file: File | null = null;
    if (inputElement?.files?.length) {
      file = inputElement?.files[0];
      if (file.size > 15 * 1024 ** 2) {
        // max file size 15MB
        addToast("Image too large, max file size is 15MB", {
          type: ToastType.ERROR,
        });
        console.error("Image too large", file.size);

        return;
      }

      await blobToBase64(file, false)
        .then(async (result) => {
          // Read in the base64 of the uploaded image
          const jImage = await Jimp.read(Buffer.from(result, "base64"));
          // Dither the image and convert it back to base64
          jImage.bitmap.data = await dither(jImage.bitmap.data);
          const base64Png = await jImage.getBase64("image/png");
          // Update the base64 image, stripping metadata
          setB64Image(stripMetadataFromBase64(base64Png));
        })
        .catch(() => {
          console.error("Error converting image to base64");
        });
    }
  }

  async function addToSlideshow() {
    if (imgRef.current) {
      const image = await Jimp.read(imgRef.current.src);
      const base64Png = await image.getBase64("image/png");
      setDisplaySettings({
        ...displaySettings,
        images: [stripMetadataFromBase64(base64Png), ...displaySettings.images],
      });
      addToast("Image added to slideshow", {
        type: ToastType.INFO,
      });
    }
  }

  function simulateFileInputClick() {
    // Simulates a click on the file input to bring up the file browse dialog
    fileInputRef?.current?.click();
  }

  return (
    <section className="text-slate-300 w-full max-w-prose">
      <h2>Prepare An Image</h2>
      <input
        ref={fileInputRef}
        type="file"
        id="image-upload-input"
        className="!hidden"
        name="image-to-prepare"
        accept="image/*"
        onInput={uploadImage}
      />
      <div className="relative w-full h-[300px]">
        {b64Image ? (
          <Cropper
            image={`data:image/png;base64,${b64Image}`}
            crop={crop}
            zoom={zoom}
            aspect={display.width / display.height}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        ) : (
          <div
            className="bg-slate-300 dark:bg-gray-900 h-full
          flex justify-center items-center border-dashed
          border-4 border-slate-100 dark:border-gray-700
          hover:bg-slate-200 dark:hover:bg-gray-800 cursor-pointer"
            aria-label="Upload an image"
            tabIndex={0}
            onKeyDown={simulateFileInputClick}
            onClick={simulateFileInputClick}
          >
            <span>Upload An Image ⬆️</span>
          </div>
        )}
      </div>
      {b64Image ? (
        <div
          className="bg-slate-300 dark:bg-gray-900 h-auto
          hover:bg-slate-200 dark:hover:bg-gray-950 cursor-pointer"
          tabIndex={0}
          onKeyDown={simulateFileInputClick}
          onClick={simulateFileInputClick}
        >
          <span>Choose File 📂</span>
        </div>
      ) : null}
      <div className="flex w-full my-2 gap-2 justify-end">
        <Button
          disabled={!b64Image}
          onClick={cropUpload}
          aria-label="Crop and dither the image"
        >
          Crop
        </Button>
      </div>
      <div
        className={clsx({
          hidden: !isDownloadReady,
        })}
      >
        <h3>Result</h3>
        <Image
          ref={imgRef}
          src="data:image/png;base64,"
          width={display.width}
          height={display.height}
          alt="The dithered output of the image"
        />
        <div className="flex w-full my-2 gap-2 justify-end">
          <Button
            onClick={addToSlideshow}
            aria-label="Add prepared image to the slideshow"
          >
            Add to slideshow
          </Button>
          <Button
            onClick={download}
            aria-label="Download prepared image"
          >
            Download
          </Button>
        </div>
      </div>
    </section>
  );
}
