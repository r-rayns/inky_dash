import { second } from "@/lib/branded-types";
import {
  DisplaySettings,
  DisplaySettingsResponse,
  setDisplay,
} from "@/lib/display-service";
import { DisplayType, Palette } from "@/lib/display-types";
import { constructUrl } from "@/lib/utils";
import {
  createContext, ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import useSWR from "swr";
import {AddToastFn, ToastType} from "./toast-provider";

// base64 for a blank white png image
export const blankImage =
  "iVBORw0KGgoAAAANSUhEUgAAANQAAABoAgMAAAD0uDaFAAACgnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZZJshshDIb3nCJHQBMSx6GhqcoNcvz8YLv9BleqMiyyeOA2tCwkoQ9RTueP7zN9QyOOnNQ8Si0lo2nVyg2TyM923sea81xzxUN3GV1alN798JgR+hu5j/uvDIlglNvr5U+WIXljqFwjvZKTfZDL5Z7fRRTl8szvIpL99mzxfOYcMbHntLS1aUF+yn1Tjy3uGRQPJEb2soLueAxz372iR265J9I8cs8HeqdKTJInKQ1qNOncY6eOEJVPdozMnWXLQpwrd8lCoklUlCa7VBkSwtL5FIGUr1ho+63bXaeA40HQZIIxword02Pyt/2loTn7ShGtZAI93QAzLwy0sijrG1pAQPNxjmwn+NE/NoDNi5ntNAc22PJxM3EYPc+WpA1aoGgYb5BpR8H7lCh8G4IhAYFcSIwKZWd2IuQxwKchcpakfAABmfFAlKwiBXCCl2+scdq6bHwTo4QAwqSIA02VBlaqpiWpa+AMNRNTMyvmFlatFSlarJTiZdVic3F18+Lu4dVbSGhYlPCIqNFS5SqoVauleo1aa2tw2mC5YXWLBsHBhxx62FEOP+KoR+s4Pl279dK9R6+9pcFDhg4bZfiIUUc76cRROvW0s5x+xlnPNnHUpkydNsv0GbPOdlHbVNM7Zp/J/Zoa3akBWNrMFEoPahC7P0zQuk5sMQMxVgJxXwRwoHkxy0GqvMilxSxXRlUYI0pbcAYtYiCoJ7FNutg9yX3illD3f8qN35JLC92/IJcWuhfkPnN7QW2s+72vOsy42FYZrqRmQflBqXHgk/Nvjin/4cIvQ1+Gvgz9p4Zk4rrA3770E9H3Xin5RhhBAAABg2lDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TpSItDnZQcchQnSyIijhqFYpQIdQKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxdnBSdJES/5cUWsR4cNyPd/ced+8AoVFhmtU1Dmi6baaTCTGbWxVDrxAwiAhEBGRmGXOSlILv+LpHgK93cZ7lf+7PEVHzFgMCIvEsM0ybeIN4etM2OO8TR1lJVonPicdMuiDxI9cVj984F10WeGbUzKTniaPEYrGDlQ5mJVMjniKOqZpO+ULWY5XzFmetUmOte/IXhvP6yjLXaQ4jiUUsQaKOFNRQRgU24rTqpFhI037Cxz/k+iVyKeQqg5FjAVVokF0/+B/87tYqTE54SeEE0P3iOB8jQGgXaNYd5/vYcZonQPAZuNLb/moDmPkkvd7WYkdA3zZwcd3WlD3gcgcYeDJkU3alIE2hUADez+ibckD/LdC75vXW2sfpA5ChrlI3wMEhMFqk7HWfd/d09vbvmVZ/Pyr6copB3BQrAAAACVBMVEX///8AAADGmyvVeuk+AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAHElEQVRYw+3BAQ0AAADCoPdPbQ8HFAAAAAAADwYV8AABWi4J4AAAAABJRU5ErkJggg==";

export const defaultSettings: DisplaySettings = {
  type: DisplayType.PHAT_104,
  borderColour: "white",
  colourPalette: Palette.RED,
  changeDelay: 60,
  images: [],
};

interface SettingsContextDefaults {
  displaySettings: DisplaySettings;
  setDisplaySettings: (settings: SetStateAction<DisplaySettings>) => void;
  updateDisplay: (settings: DisplaySettings) => Promise<Boolean>;
  isLoading: boolean;
}

// placeholder implementations
const SettingsContext = createContext<SettingsContextDefaults>({
  displaySettings: defaultSettings,
  setDisplaySettings: (settings: SetStateAction<DisplaySettings>) => undefined,
  updateDisplay: async (settings: DisplaySettings) => false,
  isLoading: false,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({
  children,
  addToast,
}: Readonly<{
  children: ReactNode;
  addToast: AddToastFn;
}>) => {
  const [displaySettings, setDisplaySettings] =
    useState<DisplaySettings>(defaultSettings);
  const { data, error, isLoading } = useSWR<DisplaySettingsResponse>(
    constructUrl("display"),
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      onSuccess: () => {
        addToast("Successfully loaded display settings", {
          type: ToastType.SUCCESS,
          duration: 2 as second,
        });
      },
    }
  );

  useEffect(() => {
    if (data) {
      // existing data retrieved, override defaults
      setDisplaySettings({
        type: data.type ?? DisplayType.PHAT_104,
        borderColour: data.border_colour ?? "white",
        colourPalette: data.colour_palette ?? Palette.RED,
        changeDelay: data.change_delay ?? 60,
        images: data.images ?? [],
      });
    }
  }, [data]);

  async function updateDisplay(settings: DisplaySettings): Promise<Boolean> {
    let success = false;
    const res = await setDisplay({ ...settings }, (message: string) =>
      addToast(`Error updating display - ${message}`, {
        type: ToastType.ERROR,
      })
    );
    if (res) {
      addToast("Successfully submitted display settings", {
        type: ToastType.SUCCESS,
      });
      setDisplaySettings(settings);
      success = true;
    }

    return success;
  }

  return (
    <SettingsContext.Provider
      value={{ displaySettings, setDisplaySettings, updateDisplay, isLoading }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
