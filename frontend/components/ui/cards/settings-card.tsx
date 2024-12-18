import {Card, CardContent, CardDescription, CardFooter, CardIconHeader, CardTitle} from "@/components/ui/card";
import {BadgeAlert, BadgeCheck, SlidersHorizontal} from "lucide-react";
import {capitalize, isNil} from "lodash-es";
import {DetectionError, displayClassByType, displayModeLabel, InkyDisplay, paletteLabel} from "@/lib/display-types";
import {DisplaySettings} from "@/lib/settings-service";
import {Skeleton} from "@/components/ui/skeleton";
import {useSettings} from "@/app/providers/settings-provider";
import clsx from "clsx";
import {useEffect, useState} from "react";
import Link from "next/link";

export default function SettingsCard({display, displaySettings, isLoading}: SettingsCardProps) {
  const [detectedDisplay, setDetectedDisplay] = useState<InkyDisplay | null>(null)
  const {detectedDisplayType} = useSettings();

  useEffect(() => {
    if (detectedDisplayType && detectedDisplayType !== DetectionError.UNSUPPORTED) {
      console.log('Boop', detectedDisplayType)
      setDetectedDisplay(displayClassByType[detectedDisplayType])
    }

  }, [detectedDisplayType]);
  return (
    <Card className="max-w-prose w-full">
      <CardIconHeader
        icon={<SlidersHorizontal/>}
      >
        <div>
          <CardTitle>Settings</CardTitle>
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
              <p className="text-slate-400">{display.name}</p>}
          </div>
          <div>
            <h4>Resolution</h4>
            {isLoading &&
              <Skeleton className="h-4 w-1/2"/>}
            {!isLoading && display &&
              <p className="text-slate-400">{display.width} x {display.height}</p>}
          </div>
          <div>
            <h4>Colour Palette</h4>
            {isLoading &&
              <Skeleton className="h-4 w-1/2"/>}
            {!isLoading && displaySettings &&
              <p className="text-slate-400">{paletteLabel[displaySettings.colourPalette] ?? 'Unknown'}</p>}
          </div>
          <div>
            <h4>Border Colour</h4>
            {isLoading &&
              <Skeleton className="h-4 w-1/2"/>}
            {!isLoading && displaySettings &&
              <p className="text-slate-400">{capitalize(displaySettings.borderColour)}</p>}
          </div>
          <div>
            <h4>Mode</h4>
            {isLoading &&
              <Skeleton className="h-4 w-1/2"/>}
            {!isLoading && displaySettings &&
              <p className="text-slate-400">{displayModeLabel[displaySettings.mode] ?? 'Unknown'}</p>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-sm w-full">
        <div className={clsx("w-full h-auto flex items-center p-2 rounded-md text-sm", {
          "bg-background/40": detectedDisplayType === undefined,
          "bg-red-500/10": detectedDisplayType === DetectionError.UNSUPPORTED || detectedDisplayType === null,
          "bg-green-700/10": !isNil(detectedDisplayType)
        })}>
          {(() => {
            if (detectedDisplayType === undefined) {
              return <Skeleton className="h-4 w-1/2"/>;
            }

            if (detectedDisplayType === DetectionError.UNSUPPORTED) {
              return (
                <span className="text-red-700/70 flex items-center">
                  <BadgeAlert size={22} className="inline mr-2"/>
                  <span>Unsupported display detected. See <Link href="/help">help</Link> section.</span>
                </span>
              );
            }

            if (detectedDisplayType === null) {
              return (
                <span className="text-red-700/70 flex items-center">
                  <BadgeAlert size={22} className="inline mr-2"/>
                  <span>Automatic display detection failed. See <Link href="/help">help</Link> section.</span>
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
          })()}
        </div>
        {isLoading ?
          <Skeleton className="self-end h-4 w-1/6"/>
          :
          <Link className="self-end" href="/display-settings">Edit settings...</Link>
        }
      </CardFooter>
    </Card>
  )
}

interface SettingsCardProps {
  display: InkyDisplay | null
  displaySettings: DisplaySettings | null
  isLoading: boolean
}
