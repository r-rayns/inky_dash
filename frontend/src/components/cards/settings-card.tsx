import { useEffect, useState } from "react";
import clsx from "clsx";
import { capitalize, isNil, omit } from "es-toolkit";
import { BadgeAlert, BadgeCheck, SlidersHorizontal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ComponentPropsWithoutRef } from "react";
import type { DisplaySettings } from "@/types/display";
import type { InkyDisplay } from "@/lib/display-types";
import type { FileRouteTypes } from '@/routeTree.gen.ts';
import { Card, CardContent, CardDescription, CardFooter, CardIconHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DetectionError, DisplayMode } from "@/types/display";
import { displayClassByType, displayModeLabel, paletteLabel } from "@/lib/display-types";
import { useSettings } from "@/providers/settings-provider";

export default function SettingsCard({display, displaySettings, isLoading, ...props}: SettingsCardProps) {
  const [detectedDisplay, setDetectedDisplay] = useState<InkyDisplay | null>(null)
  const {detectedDisplayType} = useSettings();

  useEffect(() => {
    if (detectedDisplayType && detectedDisplayType !== DetectionError.UNSUPPORTED) {
      setDetectedDisplay(displayClassByType[detectedDisplayType])
    }
  }, [detectedDisplayType]);

  const getConfigureModeLink = (): FileRouteTypes['to'] => {
    let link: FileRouteTypes['to'] = '/'
    if (displaySettings?.mode === DisplayMode.SLIDESHOW) {
      link = '/slideshow-configuration'
    } else if (displaySettings?.mode === DisplayMode.IMAGE_FEED) {
      link = '/image-feed-configuration'
    }
    return link;
  }

  return (
    <Card className={clsx("max-w-prose w-full ", props.className)}
          {...omit(props, ["className"])}>
      <CardIconHeader icon={<SlidersHorizontal/>}>
        <div>
          <CardTitle className="text-foreground">Settings</CardTitle>
          <CardDescription>Currently active settings</CardDescription>
        </div>
      </CardIconHeader>
      <CardContent>
        <div className="grid grid-cols-2">
          <div>
            <h4>Display</h4>
            {isLoading &&
              <Skeleton className="h-4 w-1/2"/>}
            {!isLoading && display &&
              <p className="text-card-foreground">{display.name}</p>}
          </div>
          <div>
            <h4>Resolution</h4>
            {isLoading &&
              <Skeleton className="h-4 w-1/2"/>}
            {!isLoading && display &&
              <p className="text-card-foreground">{display.width} x {display.height}</p>}
          </div>
          <div>
            <h4>Colour Palette</h4>
            {isLoading &&
              <Skeleton className="h-4 w-1/2"/>}
            {!isLoading && displaySettings &&
              <p className="text-card-foreground">{paletteLabel[displaySettings.colourPalette]}</p>}
          </div>
          <div>
            <h4>Border Colour</h4>
            {isLoading &&
              <Skeleton className="h-4 w-1/2"/>}
            {!isLoading && displaySettings &&
              <p className="text-card-foreground">{capitalize(displaySettings.borderColour)}</p>}
          </div>
          <div>
            <h4>Mode</h4>
            {isLoading &&
              <Skeleton className="h-4 w-1/2"/>}
            {!isLoading && displaySettings &&
              <Link
                title="Configure Mode"
                to={getConfigureModeLink()}
              >{displayModeLabel[displaySettings.mode]}
              </Link>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-sm w-full">
        <div className={clsx("w-full h-auto flex items-center p-2 rounded-md text-sm", {
          "bg-background/40": detectedDisplayType === undefined,
          "bg-red-500/10": detectedDisplayType === DetectionError.UNSUPPORTED || detectedDisplayType === null,
          "bg-green-700/10": !isNil(detectedDisplayType)
        })}>
          {( () => {
            if (detectedDisplayType === undefined) {
              return <Skeleton className="h-4 w-1/2"/>;
            }

            if (detectedDisplayType === DetectionError.UNSUPPORTED) {
              return (
                <span className="text-red-700/70 flex items-center">
                  <BadgeAlert size={22} className="inline mr-2"/>
                  <span>Unsupported display detected. See <Link to="/help">help</Link> section.</span>
                </span>
              );
            }

            if (detectedDisplayType === null) {
              return (
                <span className="text-red-700/70 flex items-center">
                  <BadgeAlert size={22} className="inline mr-2"/>
                  <span>Automatic display detection failed. See <Link to="/help">help</Link> section.</span>
                </span>
              );
            }

            if (!isNil(detectedDisplayType)) {
              return (
                <span className="text-green-700/70 flex items-center">
                  <BadgeCheck size={22} className="inline mr-2"/>
                  {detectedDisplay?.name} display was detected.
                </span>
              );
            }
          } )()}
        </div>
        {isLoading ?
          <Skeleton className="self-end h-4 w-1/6"/>
          :
          <Link className="self-end" to="/display-settings">Edit settings...</Link>
        }
      </CardFooter>
    </Card>
  )
}

// No need to handle the ref currently, as this component does not use it.
interface SettingsCardProps extends ComponentPropsWithoutRef<typeof Card> {
  display: InkyDisplay | null
  displaySettings: DisplaySettings | null
  isLoading: boolean
}
