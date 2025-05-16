import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import type { InkyDisplay } from '@/lib/display-types';
import type { CurrentImageResponse } from '@/types/settings';
import SettingsCard from '@/components/cards/settings-card'
import { displayClassByType } from '@/lib/display-types';
import { useSettings } from '@/providers/settings-provider';
import DisplayCard from '@/components/cards/display-card.tsx';
import { constructUrl } from '@/lib/utils';

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [display, setDisplay] = useState<InkyDisplay | null>(null)
  const {displaySettings, settingsIsLoading} = useSettings();
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
      displayClass = displayClassByType[displaySettings.type];
    }
    setDisplay(displayClass)
  }, [displaySettings])

  return (
    <>
      <SettingsCard
        className="mb-4 border-0 md:border-1 md:border-orange-100 dark:md:border-stone-900 drop-shadow-lg shadow-gray-300 dark:shadow-slate-800"
        display={display}
        displaySettings={displaySettings}
        isLoading={settingsIsLoading}/>
      <DisplayCard
        className="border-0 md:border-1 md:border-orange-100 dark:md:border-stone-900 drop-shadow-lg shadow-gray-300 dark:shadow-slate-800"
        isLoading={imageIsLoading}
        base64Image={currentImageRes?.current_image ?? null}/>
    </>
  )
}
