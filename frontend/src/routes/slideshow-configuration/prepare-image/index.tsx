import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import clsx from "clsx";
import Cropper from "react-easy-crop";
import type { ChangeEvent } from "react";
import type { Area } from "react-easy-crop";
import type { DitherResponse } from "@/types/image-dither";
import { useSettings } from "@/providers/settings-provider";
import { useSlideshow } from "@/providers/slideshow-provider";
import { useToast } from "@/providers/toast-provider";
import { useSubmit } from "@/hooks/useSubmit";
import { ditherImage } from "@/api/image-dither-api";
import { ToastType } from "@/types/toast";
import { displayClassByType } from "@/lib/display-types";
import { blobToBase64, prependImageDataUri, stripDataUriFromBase64 } from "@/lib/utils";
import { SpinnerIcon } from '@/components/icons/spinner.tsx';
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton.tsx';
import ImageCropWorker from '@/workers/image-crop.worker?worker';

export const Route = createFileRoute('/slideshow-configuration/prepare-image/')({
  component: PrepareImagePage,
  head: () => {
    return {
      meta: [
        {
          title: 'Inky Dash - Prepare Image',
        }
      ]
    }
  },
  loader: () => ( {
    crumb: 'Prepare Image'
  } )
})

function PrepareImagePage() {
  const navigate = useNavigate()
  const {displaySettings} = useSettings();
  const {slideshowForm, submitSlideshowConfiguration} = useSlideshow();
  const {addToast} = useToast();

  const [crop, setCrop] = useState({x: 0, y: 0});
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);
  const [b64Image, setB64Image] = useState<string | null>(null);
  const [cropPending, setCropPending] = useState<boolean>(false);
  const [finishEnabled, setFinishEnabled] = useState<boolean>(false);
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const {submit, responsePending, setResponsePending} = useSubmit<DitherResponse | null | void, [string]>(
    (image: string) =>
      ditherImage(image, (message: string) =>
        addToast(`Error dithering image - ${message}`, {
          type: ToastType.ERROR,
        })
      )
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const displayClass = displaySettings?.type && displayClassByType[displaySettings.type];

  const onCropComplete = (_croppedArea: Area, croppedAreaInPixels: Area) => {
    setCroppedAreaPixels(croppedAreaInPixels);
  }

  const cropUpload = () => {
    if (b64Image && croppedAreaPixels && displayClass) {
      setCropPending(true);
      const b64ImageRaw = stripDataUriFromBase64(b64Image);
      // Use a web worker to resize and crop the image, this prevents it from blocking the main thread and freezing the UI
      const imageCropWorker = new ImageCropWorker();

      imageCropWorker.postMessage({b64ImageRaw, croppedAreaPixels, displayClass});

      imageCropWorker.onmessage = async (event: { data: { pngBase64: string, error: string } }) => {
        const {pngBase64, error} = event.data;
        if (error) {
          console.error(error);
          setCropPending(false);
          addToast('Unable to crop the image. Try another one.', {type: ToastType.ERROR})
          imageCropWorker.terminate();
          return;
        }

        setCropPending(false);
        const ditherRes = await submit(stripDataUriFromBase64(pngBase64))

        if (imgRef.current && ditherRes?.image) {
          imgRef.current.src = prependImageDataUri(ditherRes.image);
          setIsDownloadReady(true);
        }
        imageCropWorker.terminate();
      }

    }
  }

  const download = () => {
    if (imgRef.current) {
      const url = imgRef.current.src;

      const a = document.createElement("a");
      a.href = url;
      a.download = "image.png";
      a.click();
    }
  }

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const inputElement: HTMLInputElement = event.currentTarget;
    let file: File | null = null;
    if (inputElement.files?.length) {
      setCropPending(true);
      file = inputElement.files[0];
      if (file.size > 15 * 1024 ** 2) {
        // Max file size 15MB
        addToast("Image too large, max file size is 15MB", {
          type: ToastType.ERROR,
        });
        console.error("Image too large", file.size);
        return;
      }

      await blobToBase64(file, false)
        .then((base64) => {
          // Update the base64 image
          setB64Image(prependImageDataUri(base64));
        })
        .catch(() => {
          console.error("Error converting image to base64");
        })
        .finally(() => {
          setCropPending(false);
        })
    }
  }

  const addToSlideshow = () => {
    const currentImages = slideshowForm?.getValues('images') ?? [];
    if (imgRef.current) {
      slideshowForm?.setValue('images', [stripDataUriFromBase64(imgRef.current.src), ...currentImages]);
      addToast("Image added to slideshow", {type: ToastType.INFO});
      setFinishEnabled(true);
    }

  }

  const finish = async () => {
    setResponsePending(true);
    await submitSlideshowConfiguration()
    setResponsePending(false);
    await navigate({to: '/slideshow-configuration'})
  }

  const simulateFileInputClick = () => {
    // Simulates a click on the file input to bring up the file browser dialog
    fileInputRef.current?.click();
  }

  return (
    <section className="text-foreground w-full max-w-prose">
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
      <div className="relative w-full h-[300px] bg-muted/80">
        {b64Image && displayClass ? (
          <Cropper
            image={b64Image}
            crop={crop}
            zoom={zoom}
            aspect={displayClass.width / displayClass.height}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        ) : (
          <div
            className=" h-full flex justify-center items-center border-dashed
  border-4 border-muted-foreground/30 hover:bg-background cursor-pointer"
            aria-label="Upload an image"
            tabIndex={0}
            onKeyDown={simulateFileInputClick}
            onClick={simulateFileInputClick}
          >
            <span>Upload An Image ⬆️</span>
          </div>
        )}
        {cropPending ?
          <div className="absolute top-0 w-full h-[300px] bg-black/50">
            <SpinnerIcon className="absolute top-1/2 left-1/2 w-[32px] h-[32px] mt-[-16px] ml-[-16px]"/>
          </div> : ""}
      </div>
      {b64Image ? (
        <div
          className="bg-secondary/50 dark:bg-muted/50 h-auto
        hover:bg-secondary dark:hover:bg-muted cursor-pointer"
          tabIndex={0}
          onKeyDown={simulateFileInputClick}
          onClick={simulateFileInputClick}
        >
          <span>Choose File 📂</span>
        </div>
      ) : null}
      <div className="flex w-full my-2 gap-2 justify-end">
        <Button
          variant="outline"
          disabled={!b64Image || cropPending || responsePending}
          onClick={cropUpload}
          aria-label="Crop and dither the image"
        >
          Crop & Dither
        </Button>
      </div>
      {/* Show a skeleton while awaiting the first response */}
      {( responsePending && !isDownloadReady )
        && <Skeleton className="m-auto max-w-full mb-2"
                     style={{width: displayClass?.width, height: displayClass?.height}}/>}
      <div
        className={clsx("flex flex-col", {
          hidden: !isDownloadReady,
          "cursor-progress": responsePending
        })}
      >
        <h3>Result</h3>
        <div className="relative flex flex-col items-center">
          {responsePending ?
            <SpinnerIcon className="absolute top-1/2 left-1/2 w-[32px] h-[32px] mt-[-16px] ml-[-16px]"/> : ""}
          <img
            ref={imgRef}
            src="data:image/png;base64,"
            className={clsx({"opacity-30": responsePending})}
            width={displayClass?.width ?? 0}
            height={displayClass?.height ?? 0}
            alt="The dithered output of the image"
          />
        </div>
        <div className="flex w-full my-2 gap-2 justify-end">
          <Button
            variant="outline"
            onClick={addToSlideshow}
            disabled={responsePending}
            aria-label="Add prepared image to the slideshow"
          >
            Add to slideshow
          </Button>
          <Button
            variant="outline"
            onClick={download}
            disabled={responsePending}
            aria-label="Download prepared image"
          >
            Download
          </Button>
          <Button
            onClick={finish}
            disabled={responsePending || !finishEnabled}
            aria-label="Finish adding images to the slideshow"
          >Finish</Button>
        </div>
      </div>
    </section>
  );
}
