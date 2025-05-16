import {  useEffect, useState } from "react";
import clsx from "clsx";
import { omit } from "es-toolkit";
import { ImageIcon, ImageOff } from "lucide-react";
import type {ComponentPropsWithoutRef} from "react";
import { Card, CardContent, CardDescription, CardIconHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton.tsx';

export default function DisplayCard({base64Image, isLoading, ...props}: DisplayCardProps) {
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  }>({width: 0, height: 0});

  useEffect(() => {
    if (base64Image) {
      // Calculate the actual dimensions of the base64 PNG image
      // Formula taken from: https://stackoverflow.com/a/41152378
      // PNG files contain their width and height in 8 bytes between byte 16 & 23.
      const header = atob(base64Image.slice(0, 50)).slice(16, 24);
      const uint8 = Uint8Array.from(header, (c) => c.charCodeAt(0));
      const dataView = new DataView(uint8.buffer);
      // PNG is stored in big endian, which getInt32 expects by default
      setImageDimensions({
        width: dataView.getInt32(0),
        height: dataView.getInt32(4),
      });
    }
  }, [base64Image]);

  return (
    <Card className={clsx("max-w-prose w-full", props.className)}
          {...omit(props, ["className"])}>
      <CardIconHeader
        icon={<ImageIcon/>}
      >
        <div>
          <CardTitle className="text-foreground">Display</CardTitle>
          <CardDescription>Currently displayed image</CardDescription>
        </div>
      </CardIconHeader>
      <CardContent>
        <div className="overflow-auto flex items-center">
          {
            isLoading ?
              <Skeleton className="h-40 w-3/4 m-auto"/>
              : base64Image ?
                (<img
                  className="max-w-none self-center m-auto relative"
                  src={`data:image/png;base64,${base64Image}`}
                  width={imageDimensions.width}
                  height={imageDimensions.height}
                  alt="The currently rendered image on the Inky display"
                />)
                : (<div className="flex flex-col w-full items-center self-center text-foreground">
                  <ImageOff size={82}/>
                  <p className="text-xl">No Image</p>
                </div>)
          }
        </div>
      </CardContent>
    </Card>
  );
}

interface DisplayCardProps extends ComponentPropsWithoutRef<typeof Card> {
  base64Image: string | null;
  isLoading: boolean;
}
