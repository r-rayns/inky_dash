'use client';
import {useSettings} from "@/app/providers/settings-provider";
import {displayClassByType, InkyDisplay} from "@/lib/display-types";
import {Card, CardContent, CardDescription, CardIconHeader, CardTitle,} from "@/components/ui/card"
import {useEffect, useState} from "react";
import {capitalize} from "lodash-es";
import {SlidersHorizontal, Image as ImageIcon} from "lucide-react";
import SettingsCard from "@/components/ui/cards/settings-card";

export default function Home() {

  const [display, setDisplay] = useState<InkyDisplay | null>(null)
  const {displaySettings, detectedDisplayType, settingsIsLoading} = useSettings();

  useEffect(() => {
    let displayClass: InkyDisplay | null = null;
    if (displaySettings) {
      displayClass = displayClassByType[displaySettings.type] ?? null;
    }
    setDisplay(displayClass)
  }, [displaySettings])

  return (
    <>
      <SettingsCard
        display={display}
        displaySettings={displaySettings}
        isLoading={settingsIsLoading}/>
      <Card className="max-w-prose w-full mt-4">
        <CardIconHeader
          icon={<ImageIcon/>}
        >
          <div>
            <CardTitle>Display</CardTitle>
            <CardDescription>The image currently being displayed</CardDescription>
          </div>
        </CardIconHeader>
        <CardContent>
        </CardContent>
      </Card>
    </>
  )
}
