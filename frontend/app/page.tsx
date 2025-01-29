'use client';
import {useSettings} from "@/app/providers/settings-provider";
import {displayClassByType, InkyDisplay} from "@/lib/display-types";
import {useEffect, useState} from "react";
import SettingsCard from "@/components/ui/cards/settings-card";
import useSWR from "swr";
import {CurrentImageResponse} from "@/lib/settings-service";
import {constructUrl} from "@/lib/utils";
import DisplayCard from "@/components/ui/cards/display-card";

export default function Home() {

  const [display, setDisplay] = useState<InkyDisplay | null>(null)
  const {displaySettings, detectedDisplayType, settingsIsLoading} = useSettings();
  const {data: currentImageRes, isLoading: imageIsLoading} = useSWR<CurrentImageResponse>(
    constructUrl("current-image"),
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      refreshInterval: 5000,
      revalidateOnReconnect: true,
    }
  );

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
        className="mb-2"
        display={display}
        displaySettings={displaySettings}
        isLoading={settingsIsLoading}/>
      <DisplayCard
        isLoading={imageIsLoading}
        base64Image={currentImageRes?.current_image ?? null}/>
    </>
  )
}
