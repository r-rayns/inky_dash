import {useSettings} from "@/app/providers/settings-provider";
import {InkyDisplay} from "@/lib/display-types";
import {blobToBase64} from "@/lib/utils";
import {isEqual} from "lodash-es";
import Image from "next/image";
import {ChangeEvent, ReactElement, useEffect, useRef, useState} from "react";
import {ToastType, useToast} from "../../providers/toast-provider";
import "./mock-display.css";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {ArrowBigLeft, ArrowBigRight, ImagePlus, Trash2} from "lucide-react";
import Link from "next/link";
import {SpinnerIcon} from "@/app/ui/icons/spinner";

const blankImage =
  "iVBORw0KGgoAAAANSUhEUgAAANQAAABoAgMAAAD0uDaFAAACgnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZZJshshDIb3nCJHQBMSx6GhqcoNcvz8YLv9BleqMiyyeOA2tCwkoQ9RTueP7zN9QyOOnNQ8Si0lo2nVyg2TyM923sea81xzxUN3GV1alN798JgR+hu5j/uvDIlglNvr5U+WIXljqFwjvZKTfZDL5Z7fRRTl8szvIpL99mzxfOYcMbHntLS1aUF+yn1Tjy3uGRQPJEb2soLueAxz372iR265J9I8cs8HeqdKTJInKQ1qNOncY6eOEJVPdozMnWXLQpwrd8lCoklUlCa7VBkSwtL5FIGUr1ho+63bXaeA40HQZIIxword02Pyt/2loTn7ShGtZAI93QAzLwy0sijrG1pAQPNxjmwn+NE/NoDNi5ntNAc22PJxM3EYPc+WpA1aoGgYb5BpR8H7lCh8G4IhAYFcSIwKZWd2IuQxwKchcpakfAABmfFAlKwiBXCCl2+scdq6bHwTo4QAwqSIA02VBlaqpiWpa+AMNRNTMyvmFlatFSlarJTiZdVic3F18+Lu4dVbSGhYlPCIqNFS5SqoVauleo1aa2tw2mC5YXWLBsHBhxx62FEOP+KoR+s4Pl279dK9R6+9pcFDhg4bZfiIUUc76cRROvW0s5x+xlnPNnHUpkydNsv0GbPOdlHbVNM7Zp/J/Zoa3akBWNrMFEoPahC7P0zQuk5sMQMxVgJxXwRwoHkxy0GqvMilxSxXRlUYI0pbcAYtYiCoJ7FNutg9yX3illD3f8qN35JLC92/IJcWuhfkPnN7QW2s+72vOsy42FYZrqRmQflBqXHgk/Nvjin/4cIvQ1+Gvgz9p4Zk4rrA3770E9H3Xin5RhhBAAABg2lDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TpSItDnZQcchQnSyIijhqFYpQIdQKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxdnBSdJES/5cUWsR4cNyPd/ced+8AoVFhmtU1Dmi6baaTCTGbWxVDrxAwiAhEBGRmGXOSlILv+LpHgK93cZ7lf+7PEVHzFgMCIvEsM0ybeIN4etM2OO8TR1lJVonPicdMuiDxI9cVj984F10WeGbUzKTniaPEYrGDlQ5mJVMjniKOqZpO+ULWY5XzFmetUmOte/IXhvP6yjLXaQ4jiUUsQaKOFNRQRgU24rTqpFhI037Cxz/k+iVyKeQqg5FjAVVokF0/+B/87tYqTE54SeEE0P3iOB8jQGgXaNYd5/vYcZonQPAZuNLb/moDmPkkvd7WYkdA3zZwcd3WlD3gcgcYeDJkU3alIE2hUADez+ibckD/LdC75vXW2sfpA5ChrlI3wMEhMFqk7HWfd/d09vbvmVZ/Pyr6copB3BQrAAAACVBMVEX///8AAADGmyvVeuk+AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAHElEQVRYw+3BAQ0AAADCoPdPbQ8HFAAAAAAADwYV8AABWi4J4AAAAABJRU5ErkJggg==";

export default function MockDisplay({
                                      value,
                                      onChange,
                                      inkyDisplay,
                                    }: MockDisplayProps) {
  const {addToast} = useToast();
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [actualDimensions, setActualDimensions] = useState<{
    width: number;
    height: number;
  }>({width: 0, height: 0});
  const [images, setImages] = useState<string[]>(value);
  const [width, setWidth] = useState<number>(inkyDisplay.width);
  const [height, setHeight] = useState<number>(inkyDisplay.height);
  const {isLoading} = useSettings();
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
    if (images.length) {
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
    }
  }, [imageIndex, images]);

  function simulateFileInputClick() {
    // simulates a click on the file input to bring up the file browse dialog
    fileInputRef?.current?.click();
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
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
          updatedImages.push(result);
          setImages(updatedImages);
          setImageIndex(updatedImages.length - 1);
        })
        .catch(() => {
          console.error("Error converting image to base64");
        });
    }
  }

  function nextImage() {
    if (imageIndex < images.length - 1) {
      setImageIndex(imageIndex + 1);
    }
  }

  function prevImage() {
    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  }

  function deleteImage() {
    if (images.length > 0) {
      const updatedImages = [...images];
      updatedImages.splice(imageIndex, 1);
      setImages(updatedImages);
    }

    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
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
        style={{maxWidth: `${width}px`}}
        ref={mockDisplayRef}
      >
        <div
          className={`bg-white flex items-center overflow-y-auto overflow-x-auto`}
          style={{height: `${height}px`, maxHeight: `${height}px`}}
        >
          {isLoading ? (
              <div role="status" className="flex m-auto items-center">
                <SpinnerIcon/>
                <span className="sr-only">Loading...</span>
              </div>
            ) :
            images.length ? (
                <Image
                  className="max-w-none self-center m-auto"
                  src={`data:image/png;base64,${images[imageIndex]}`}
                  width={actualDimensions?.width}
                  height={actualDimensions?.height}
                  alt="An image that will be rendered on the Inky display"
                />)
              : (<div className="m-auto p-4 text-black">No image</div>)
          }
        </div>


        {images.length > 0 && (
          <p className="absolute top-0 left-0 px-1 font-mono text-xs m-0 backdrop-blur-sm bg-black/50 text-slate-300">
            Dimensions: {actualDimensions?.width} x {actualDimensions?.height}
          </p>
        )}
        <div className="flex justify-evenly flex-row mt-1 mx-auto ">
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Previous image"
            onClick={prevImage}
            disabled={imageIndex === 0 || isLoading}
          >
            <ArrowBigLeft/>
          </Button>
          <Link key="Prepare Image" href="/prepare-image">
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Add image"
            >
              <ImagePlus/>
            </Button>
          </Link>
          <Button
            type="button"
            size="icon"
            onClick={deleteImage}
            disabled={isLoading}
            variant="outline"
            aria-label="Delete image"
          >
            <Trash2/>
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={nextImage}
            disabled={imageIndex === Math.max(0, images.length - 1) || isLoading}
            variant="outline"
            aria-label="Next image"
          >
            <ArrowBigRight/>
          </Button>
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
