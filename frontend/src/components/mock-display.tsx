import { useEffect, useRef, useState } from "react";
import { ArrowBigLeft, ArrowBigRight, ImagePlus, Trash2 } from "lucide-react";
import { Link } from '@tanstack/react-router';
import type { InkyDisplay } from "@/lib/display-types";
import { Button } from "@/components/ui/button";
import { SpinnerIcon } from "@/components/icons/spinner";
import { useSettings } from '@/providers/settings-provider.tsx';

export default function MockDisplay({
                                      value,
                                      onChange,
                                    }: MockDisplayProps) {
  // Use prop directly as source of truth - avoids state synchronization complexity
  const images: Array<string> = value;
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [actualDimensions, setActualDimensions] = useState<{
    width: number;
    height: number;
  }>({width: 0, height: 0});
  const {settingsIsLoading} = useSettings();
  const mockDisplayRef = useRef<HTMLInputElement>(null);

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
      onChange(updatedImages);
    }

    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  }

  return (
    <>
      <div
        className="w-auto max-w-full relative overflow-auto mx-auto"
        ref={mockDisplayRef}
      >
        <div
          className={`bg-white flex overflow-auto max-w-full max-h-[500px]`}
        >
          {settingsIsLoading ? (
              <div role="status" className="flex m-auto items-center">
                <SpinnerIcon/>
                <span className="sr-only">Loading...</span>
              </div>
            ) :
            images.length ? (
                <img
                  className="max-w-none self-center m-auto"
                  src={`data:image/png;base64,${images[imageIndex]}`}
                  alt="An image that will be rendered on the Inky display"
                /> )
              : ( <div className="m-auto p-4 text-black">No image</div> )
          }
        </div>


        {images.length > 0 && (
          <p className="absolute top-0 left-0 px-1 font-mono text-xs m-0 backdrop-blur-sm bg-black/50 text-slate-300">
            Image {imageIndex + 1} of {images.length} -
            Dimensions: {actualDimensions.width} x {actualDimensions.height}
          </p>
        )}
        <div className="flex justify-evenly flex-row mt-1 mx-auto ">
          <Button
            type="button"
            size="icon"
            variant="icon"
            title="Previous image"
            aria-label="Previous image"
            onClick={prevImage}
            disabled={imageIndex === 0 || settingsIsLoading}
          >
            <ArrowBigLeft/>
          </Button>
          <Link key="Prepare Image" to="/slideshow-configuration/prepare-image">
            <Button
              type="button"
              size="icon"
              className="text-blue-600 dark:text-blue-300 hover:text-foreground dark:hover:text-foreground"
              variant="icon"
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
            variant="icon"
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
            variant="icon"
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
  value: Array<string>;
  onChange: (value: Array<string>) => void;
  inkyDisplay: InkyDisplay;
}
