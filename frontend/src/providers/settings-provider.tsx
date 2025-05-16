import {  createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import type {ReactNode} from 'react';
import type { DetectionError, DisplaySettings, DisplayType } from '@/types/display.ts';
import type {AddToastFn} from '@/types/toast.ts';
import type { second } from '@/types/branded-types';
import type { DetectDisplayResponse, DisplaySettingsResponse } from '@/types/settings.ts';
import {  ToastType } from '@/types/toast.ts';
import { constructUrl } from '@/lib/utils.ts';
import { updateSettings } from '@/api/settings-api.ts';

interface SettingsContextDefaults {
  displaySettings: DisplaySettings | null;
  detectedDisplayType: DisplayType | DetectionError | null | undefined;
  submitDisplaySetting: (settings: DisplaySettings) => Promise<boolean>;
  settingsIsLoading: boolean;
}

// Placeholder implementations
const SettingsContext = createContext<SettingsContextDefaults>({
  displaySettings: null,
  detectedDisplayType: null,
  submitDisplaySetting: async () => new Promise<boolean>(() => false),
  settingsIsLoading: false,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({children, addToast}: Readonly<{ children: ReactNode; addToast: AddToastFn; }>) => {
  const [detectedDisplay, setDetectedDisplay] = useState<DisplayType | DetectionError | null | undefined>(undefined);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings | null>(null);
  const {data: detectedDisplayResponse} = useSWR<DetectDisplayResponse>(
    constructUrl("detect-display"),
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      onSuccess: (res: DetectDisplayResponse) => {
        if (res.type) {
          addToast("Successfully detected display type", {
            type: ToastType.SUCCESS,
            duration: 2 as second,
          });
        }
      },
    }
  );

  const {data: settingsResponse, isLoading: settingsIsLoading} = useSWR<DisplaySettingsResponse>(
    constructUrl("settings"),
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    if (settingsResponse) {
      // Set state from retrieved display settings
      setDisplaySettings({
        type: settingsResponse.type,
        borderColour: settingsResponse.border_colour,
        colourPalette: settingsResponse.colour_palette,
        mode: settingsResponse.mode,
      });
    }
  }, [settingsResponse]);

  useEffect(() => {
    if (detectedDisplayResponse) {
      setDetectedDisplay(detectedDisplayResponse.type);
    }
  }, [detectedDisplayResponse]);

  async function submitDisplaySetting(updatedSettings: DisplaySettings): Promise<boolean> {
    let success = false;
    const res = await updateSettings({...updatedSettings}, (message: string) =>
      addToast(`Error updating display - ${message}`, {
        type: ToastType.ERROR,
      })
    );
    if (res) {
      addToast("Successfully submitted display settings", {
        type: ToastType.SUCCESS,
      });
      setDisplaySettings(updatedSettings);
      success = true;
    }

    return success;
  }

  return (
    <SettingsContext.Provider
      value={{displaySettings, detectedDisplayType: detectedDisplay, submitDisplaySetting, settingsIsLoading}}
    >
      {children}
    </SettingsContext.Provider>
  );
};
