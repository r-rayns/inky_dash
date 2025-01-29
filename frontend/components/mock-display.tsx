import {useSettings} from "@/app/providers/settings-provider";
import {InkyDisplay} from "@/lib/display-types";
import {isEqual} from "lodash-es";
import Image from "next/image";
import {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {ArrowBigLeft, ArrowBigRight, ImagePlus, Trash2} from "lucide-react";
import Link from "next/link";
import {SpinnerIcon} from "@/components/icons/spinner";

export default function MockDisplay({
                                      value,
                                      onChange,
                                      inkyDisplay,
                                    }: MockDisplayProps) {
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [actualDimensions, setActualDimensions] = useState<{
    width: number;
    height: number;
  }>({width: 0, height: 0});
  const [images, setImages] = useState<string[]>(value);
  const [width, setWidth] = useState<number>(inkyDisplay.width);
  const [height, setHeight] = useState<number>(inkyDisplay.height);
  const {settingsIsLoading} = useSettings();
  // Ref to track images at the time of the last update, used to compare with new values to decide if an update is required
  const lastUpdatedImagesRef = useRef<string[]>([]);
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
      /**
       * Calculate the actual dimensions of the base64 image
       * formula taken from: https://stackoverflow.com/a/41152378
       */
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

  const nextImage = () => {
    if (imageIndex < images.length - 1) {
      setImageIndex(imageIndex + 1);
    }
  }

  const prevImage = () => {
    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  }

  const deleteImage = () => {
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
      <div
        className="w-full relative mx-auto"
        style={{maxWidth: `${width}px`}}
        ref={mockDisplayRef}
      >
        <div
          className={`bg-white flex items-center overflow-y-auto overflow-x-auto`}
          style={{height: `${height}px`, maxHeight: `${height}px`}}
        >
          {settingsIsLoading ? (
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
            title="Previous image"
            aria-label="Previous image"
            onClick={prevImage}
            disabled={imageIndex === 0 || settingsIsLoading}
          >
            <ArrowBigLeft/>
          </Button>
          <Link key="Prepare Image" href="/slideshow-configuration/prepare-image">
            <Button
              type="button"
              size="icon"
              variant="outline"
              title="Add image"
              aria-label="Add image"
            >
              <ImagePlus/>
            </Button>
          </Link>
          <Button
            type="button"
            size="icon"
            onClick={deleteImage}
            disabled={settingsIsLoading || images.length === 1}
            variant="outline"
            title="Delete image"
            aria-label="Delete image"
          >
            <Trash2/>
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={nextImage}
            disabled={imageIndex === Math.max(0, images.length - 1) || settingsIsLoading}
            variant="outline"
            title="Next image"
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
