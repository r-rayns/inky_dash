import "./mock-display.css";
import { toBase64 } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isEqual } from "lodash-es";
import { ToastType, useToast } from "../../providers/toast-provider";

const blankImage =
  "iVBORw0KGgoAAAANSUhEUgAAANQAAABoAgMAAAD0uDaFAAACgnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZZJshshDIb3nCJHQBMSx6GhqcoNcvz8YLv9BleqMiyyeOA2tCwkoQ9RTueP7zN9QyOOnNQ8Si0lo2nVyg2TyM923sea81xzxUN3GV1alN798JgR+hu5j/uvDIlglNvr5U+WIXljqFwjvZKTfZDL5Z7fRRTl8szvIpL99mzxfOYcMbHntLS1aUF+yn1Tjy3uGRQPJEb2soLueAxz372iR265J9I8cs8HeqdKTJInKQ1qNOncY6eOEJVPdozMnWXLQpwrd8lCoklUlCa7VBkSwtL5FIGUr1ho+63bXaeA40HQZIIxword02Pyt/2loTn7ShGtZAI93QAzLwy0sijrG1pAQPNxjmwn+NE/NoDNi5ntNAc22PJxM3EYPc+WpA1aoGgYb5BpR8H7lCh8G4IhAYFcSIwKZWd2IuQxwKchcpakfAABmfFAlKwiBXCCl2+scdq6bHwTo4QAwqSIA02VBlaqpiWpa+AMNRNTMyvmFlatFSlarJTiZdVic3F18+Lu4dVbSGhYlPCIqNFS5SqoVauleo1aa2tw2mC5YXWLBsHBhxx62FEOP+KoR+s4Pl279dK9R6+9pcFDhg4bZfiIUUc76cRROvW0s5x+xlnPNnHUpkydNsv0GbPOdlHbVNM7Zp/J/Zoa3akBWNrMFEoPahC7P0zQuk5sMQMxVgJxXwRwoHkxy0GqvMilxSxXRlUYI0pbcAYtYiCoJ7FNutg9yX3illD3f8qN35JLC92/IJcWuhfkPnN7QW2s+72vOsy42FYZrqRmQflBqXHgk/Nvjin/4cIvQ1+Gvgz9p4Zk4rrA3770E9H3Xin5RhhBAAABg2lDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TpSItDnZQcchQnSyIijhqFYpQIdQKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxdnBSdJES/5cUWsR4cNyPd/ced+8AoVFhmtU1Dmi6baaTCTGbWxVDrxAwiAhEBGRmGXOSlILv+LpHgK93cZ7lf+7PEVHzFgMCIvEsM0ybeIN4etM2OO8TR1lJVonPicdMuiDxI9cVj984F10WeGbUzKTniaPEYrGDlQ5mJVMjniKOqZpO+ULWY5XzFmetUmOte/IXhvP6yjLXaQ4jiUUsQaKOFNRQRgU24rTqpFhI037Cxz/k+iVyKeQqg5FjAVVokF0/+B/87tYqTE54SeEE0P3iOB8jQGgXaNYd5/vYcZonQPAZuNLb/moDmPkkvd7WYkdA3zZwcd3WlD3gcgcYeDJkU3alIE2hUADez+ibckD/LdC75vXW2sfpA5ChrlI3wMEhMFqk7HWfd/d09vbvmVZ/Pyr6copB3BQrAAAACVBMVEX///8AAADGmyvVeuk+AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAHElEQVRYw+3BAQ0AAADCoPdPbQ8HFAAAAAAADwYV8AABWi4J4AAAAABJRU5ErkJggg==";

export default function MockDisplay({ value, onChange }: MockDisplayProps) {
  const { addToast } = useToast();
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [images, setImages] = useState<string[]>(value);
  // ref to track images at the time of the last update, used to compare with new values to decide if an update is required
  const lastUpdatedImagesRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function simulateFileInputClick() {
    // simulates a click on the file input to bring up the file browse dialog
    fileInputRef?.current?.click();
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const inputElement: HTMLInputElement = event?.currentTarget;
    let file: File | null = null;
    if (inputElement?.files?.length) {
      file = inputElement?.files[0];
      if (file.size > 100 * 1024) {
        // max file size 100KB
        addToast("Image too large, max file size is 100KB", {
          type: ToastType.ERROR,
        });
        console.error("Image too large", file.size);

        return;
      }

      await toBase64(file, false)
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
      <div className="w-[212px] mx-auto">
        <div className="h-[104px] bg-white">
          <Image
            className="cursor-pointer"
            src={`data:image/png;base64,${images[imageIndex]}`}
            width="212"
            height="104"
            onClick={simulateFileInputClick}
            alt="An image that will be rendered on the Inky display"
          />
        </div>
        <div className="flex justify-between flex-row mt-1">
          <button
            type="button"
            className="slideshow"
            onClick={prevImage}
            disabled={imageIndex === 0}
          >
            ←
          </button>
          <button type="button" className="slideshow" onClick={deleteImage}>
            ␡
          </button>
          <button type="button" className="slideshow" onClick={nextImage}>
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
}
