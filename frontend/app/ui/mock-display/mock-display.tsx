import { useSettings } from "@/app/providers/settings-provider";
import { InkyDisplay } from "@/lib/display-types";
import { blobToBase64 } from "@/lib/utils";
import { isEqual } from "lodash-es";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ToastType, useToast } from "../../providers/toast-provider";
import "./mock-display.css";

const blankImage =
  "iVBORw0KGgoAAAANSUhEUgAAANQAAABoAgMAAAD0uDaFAAACgnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZZJshshDIb3nCJHQBMSx6GhqcoNcvz8YLv9BleqMiyyeOA2tCwkoQ9RTueP7zN9QyOOnNQ8Si0lo2nVyg2TyM923sea81xzxUN3GV1alN798JgR+hu5j/uvDIlglNvr5U+WIXljqFwjvZKTfZDL5Z7fRRTl8szvIpL99mzxfOYcMbHntLS1aUF+yn1Tjy3uGRQPJEb2soLueAxz372iR265J9I8cs8HeqdKTJInKQ1qNOncY6eOEJVPdozMnWXLQpwrd8lCoklUlCa7VBkSwtL5FIGUr1ho+63bXaeA40HQZIIxword02Pyt/2loTn7ShGtZAI93QAzLwy0sijrG1pAQPNxjmwn+NE/NoDNi5ntNAc22PJxM3EYPc+WpA1aoGgYb5BpR8H7lCh8G4IhAYFcSIwKZWd2IuQxwKchcpakfAABmfFAlKwiBXCCl2+scdq6bHwTo4QAwqSIA02VBlaqpiWpa+AMNRNTMyvmFlatFSlarJTiZdVic3F18+Lu4dVbSGhYlPCIqNFS5SqoVauleo1aa2tw2mC5YXWLBsHBhxx62FEOP+KoR+s4Pl279dK9R6+9pcFDhg4bZfiIUUc76cRROvW0s5x+xlnPNnHUpkydNsv0GbPOdlHbVNM7Zp/J/Zoa3akBWNrMFEoPahC7P0zQuk5sMQMxVgJxXwRwoHkxy0GqvMilxSxXRlUYI0pbcAYtYiCoJ7FNutg9yX3illD3f8qN35JLC92/IJcWuhfkPnN7QW2s+72vOsy42FYZrqRmQflBqXHgk/Nvjin/4cIvQ1+Gvgz9p4Zk4rrA3770E9H3Xin5RhhBAAABg2lDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TpSItDnZQcchQnSyIijhqFYpQIdQKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxdnBSdJES/5cUWsR4cNyPd/ced+8AoVFhmtU1Dmi6baaTCTGbWxVDrxAwiAhEBGRmGXOSlILv+LpHgK93cZ7lf+7PEVHzFgMCIvEsM0ybeIN4etM2OO8TR1lJVonPicdMuiDxI9cVj984F10WeGbUzKTniaPEYrGDlQ5mJVMjniKOqZpO+ULWY5XzFmetUmOte/IXhvP6yjLXaQ4jiUUsQaKOFNRQRgU24rTqpFhI037Cxz/k+iVyKeQqg5FjAVVokF0/+B/87tYqTE54SeEE0P3iOB8jQGgXaNYd5/vYcZonQPAZuNLb/moDmPkkvd7WYkdA3zZwcd3WlD3gcgcYeDJkU3alIE2hUADez+ibckD/LdC75vXW2sfpA5ChrlI3wMEhMFqk7HWfd/d09vbvmVZ/Pyr6copB3BQrAAAACVBMVEX///8AAADGmyvVeuk+AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAHElEQVRYw+3BAQ0AAADCoPdPbQ8HFAAAAAAADwYV8AABWi4J4AAAAABJRU5ErkJggg==";

export default function MockDisplay({
  value,
  onChange,
  inkyDisplay,
}: MockDisplayProps) {
  const { addToast } = useToast();
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [actualDimensions, setActualDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [images, setImages] = useState<string[]>(value);
  const [width, setWidth] = useState<number>(inkyDisplay.width);
  const [height, setHeight] = useState<number>(inkyDisplay.height);
  const { isLoading } = useSettings();
  // ref to track images at the time of the last update, used to compare with new values to decide if an update is required
  const lastUpdatedImagesRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mockDisplayRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEqual(images, lastUpdatedImagesRef.current)) {
      onChange(images);
      lastUpdatedImagesRef.current = images;
    }
  }, [images, onChange]);

  useEffect(() => {
    if (!isEqual(value, lastUpdatedImagesRef.current)) {
      setImages(value);
      lastUpdatedImagesRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    setWidth(inkyDisplay.width);
    setHeight(inkyDisplay.height);
  }, [inkyDisplay]);

  useEffect(() => {
    // calculate the actual dimensions of the base64 image
    // formula taken from: https://stackoverflow.com/a/41152378
    const base64 = images[imageIndex];
    const header = atob(base64.slice(0, 50)).slice(16, 24);
    const uint8 = Uint8Array.from(header, (c) => c.charCodeAt(0));
    const dataView = new DataView(uint8.buffer);

    setActualDimensions({
      width: dataView.getInt32(0),
      height: dataView.getInt32(4),
    });
  }, [imageIndex, images]);

  function simulateFileInputClick() {
    // simulates a click on the file input to bring up the file browse dialog
    fileInputRef?.current?.click();
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const inputElement: HTMLInputElement = event?.currentTarget;
    let file: File | null = null;
    if (inputElement?.files?.length) {
      file = inputElement?.files[0];
      if (file.size > 1000 * 1024) {
        // max file size 1000KB
        addToast("Image too large, max file size is 1000KB", {
          type: ToastType.ERROR,
        });
        console.error("Image too large", file.size);

        return;
      }

      await blobToBase64(file, false)
        .then((result) => {
          // update the image
          const updatedImages = [...images];
          updatedImages[imageIndex] = result;
          setImages(updatedImages);
        })
        .catch(() => {
          console.error("Error converting image to base64");
        });
    }
  }

  function nextImage() {
    if (imageIndex >= images.length - 1) {
      const updatedImages = [...images];
      // add blank image to end of array
      // users can upload/edit an image by clicking the preview
      updatedImages.push(blankImage);
      setImages(updatedImages);
    }
    setImageIndex(imageIndex + 1);
  }

  function prevImage() {
    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  }

  function deleteImage() {
    if (images.length === 1) {
      // there must be at least one image set, set images to contain just one blank image
      setImages([blankImage]);
    } else {
      const updatedImages = [...images];
      updatedImages.splice(imageIndex, 1);
      setImages(updatedImages);
    }

    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  }

  function nextBtnText(): string {
    let text = "→";
    if (imageIndex === images.length - 1) {
      // next button become "add" button when we reach the end of our images array
      text = "+";
    }
    return text;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        id="image-upload-input"
        className="!hidden"
        name="inky-image"
        accept="image/png"
        onInput={uploadImage}
      />
      <div
        className="w-full relative mx-auto"
        style={{ maxWidth: `${width}px` }}
        ref={mockDisplayRef}
      >
        <div
          className={`bg-white flex items-center overflow-y-auto overflow-x-auto cursor-pointer `}
          onClick={simulateFileInputClick}
          style={{ height: `${height}px`, maxHeight: `${height}px` }}
        >
          {isLoading ? (
            <div role="status" className="flex m-auto items-center">
              <svg
                aria-hidden="true"
                className="inline w-8 h-8 text-slate-200 animate-spin dark:text-slate-100 fill-orange-500"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <Image
              className="max-w-none self-center m-auto"
              src={`data:image/png;base64,${images[imageIndex]}`}
              width={actualDimensions?.width}
              height={actualDimensions?.height}
              alt="An image that will be rendered on the Inky display"
            />
          )}
        </div>
        <p className="absolute top-0 left-0 px-1 font-mono text-xs m-0 backdrop-blur-sm bg-black/50 text-slate-300">
          Dimensions: {actualDimensions?.width} x {actualDimensions?.height}
        </p>
        <div className="flex justify-evenly flex-row mt-1 mx-auto ">
          <button
            type="button"
            className="slideshow"
            onClick={prevImage}
            disabled={imageIndex === 0 || isLoading}
          >
            ←
          </button>
          <button
            type="button"
            className="slideshow"
            onClick={deleteImage}
            disabled={isLoading}
          >
            ␡
          </button>
          <button
            type="button"
            className="slideshow"
            onClick={nextImage}
            disabled={isLoading}
          >
            {nextBtnText()}
          </button>
        </div>
      </div>
    </>
  );
}

interface MockDisplayProps {
  value: string[];
  onChange: (value: string[]) => void;
  inkyDisplay: InkyDisplay;
}
