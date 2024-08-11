"use client";
import { DisplaySettings } from "@/lib/display-service";
import { displayClassByType, DisplayType, isDisplayType, Palette } from "@/lib/display-types";
import { pluraliseUnitIfNeeded } from "@/lib/utils";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { defaultSettings, useSettings } from "./providers/settings-provider";
import MockDisplay from "./ui/mock-display/mock-display";
import StepRange from "./ui/step-range/step-range";

export default function Home() {
  const minChangeDelay = 30;
  const maxChangeDelay = 3600;
  const { displaySettings, updateDisplay } = useSettings();
  const [displayForm, setDisplayForm] =
    useState<DisplaySettings>(defaultSettings);

  // these includes will re-evaluate on each render such as a form value changing
  const hasRedPalette = displayClassByType[displayForm.type].palettes.includes(
    Palette.RED
  );
  const hasYellowPalette = displayClassByType[
    displayForm.type
  ].palettes.includes(Palette.YELLOW);
  const hasSevenColourPalette = displayClassByType[
    displayForm.type
  ].palettes.includes(Palette.SEVEN_COLOUR);

  useEffect(() => {
    if (displaySettings) {
      // existing data retrieved, override defaults
      setDisplayForm({ ...displaySettings });
    }
  }, [displaySettings]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateDisplay({ ...displayForm });
  }

  const handleDisplaySettingsChange = (key: keyof DisplaySettings, value: unknown) => {
    setDisplayForm((prevState) => {
      let updatedState = {
        ...prevState,
        [key]: value,
      }
      if(key === "type" && isDisplayType(value)) {
        const availablePalettes = displayClassByType[value].palettes;
        if(availablePalettes.includes(displayForm.colourPalette)) {
          updatedState.colourPalette = displayForm.colourPalette
        } else {
          updatedState.colourPalette = availablePalettes[0];
        }
      }
      return updatedState;
    });
  };

  const stepChangeDelay = (increment: boolean = true) => {
    let newChangeDelay = displayForm.changeDelay;
    if (increment) {
      newChangeDelay = Math.min(maxChangeDelay, newChangeDelay + 1);
    } else {
      newChangeDelay = Math.max(minChangeDelay, newChangeDelay - 1);
    }
    setDisplayForm((prevState) => ({
      ...prevState,
      changeDelay: newChangeDelay,
    }));
  };

  function formatSeconds(seconds: number): string {
    let text = "";
    if (displayForm.changeDelay >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      text = `${minutes} ${pluraliseUnitIfNeeded(minutes, "minute")}`;
      if (remainingSeconds > 0) {
        text = `${text} and ${remainingSeconds} ${pluraliseUnitIfNeeded(
          remainingSeconds,
          "second"
        )}`;
      }
    } else {
      text = `${seconds} seconds`;
    }

    return text;
  }

  return (
    <>
      <form
        className="flex flex-col gap-y-2 w-full items-center"
        onSubmit={onSubmit}
      >
        <div className="max-w-prose w-full">
          <label htmlFor="inky-display-select">Select your Inky Display:</label>
          <select
            id="inky-display-select"
            name="inkyDisplay"
            value={displayForm.type}
            onChange={(e) =>
              handleDisplaySettingsChange("type", e.target.value)
            }
          >
            <option value={DisplayType.PHAT_104}>Inky pHAT (212x104)</option>
            <option value={DisplayType.PHAT_122}>Inky pHAT (250x122)</option>
            <option value={DisplayType.IMPRESSION_400}>
              Inky Impression 4&quot; (640x400)
            </option>
            <option value={DisplayType.IMPRESSION_448}>
              Inky Impression 5.7&quot; (600x448)
            </option>
            <option value={DisplayType.IMPRESSION_480}>
              Inky Impression 7.3&quot; (800x480)
            </option>
          </select>
          <label htmlFor="colour-palette-select">
            Select your colour palette:
          </label>
          <select
            id="colour-palette-select"
            name="colourPalette"
            value={displayForm.colourPalette}
            onChange={(e) =>
              handleDisplaySettingsChange("colourPalette", e.target.value)
            }
          >
            <option value={Palette.RED} disabled={!hasRedPalette}>
              Red ❤️
            </option>
            <option value={Palette.YELLOW} disabled={!hasYellowPalette}>
              Yellow 💛
            </option>
            <option
              value={Palette.SEVEN_COLOUR}
              disabled={!hasSevenColourPalette}
            >
              7 Colour 🌈
            </option>
          </select>

          <label htmlFor="border-colour-select">Select a border colour:</label>
          <select
            id="border-colour-select"
            name="borderColour"
            value={displayForm.borderColour}
            onChange={(e) =>
              handleDisplaySettingsChange("borderColour", e.target.value)
            }
          >
            <option value="white">White 🤍</option>
            <option value="black">Black 🖤</option>
          </select>

          <label htmlFor="change-delay-input">
            Change image every {formatSeconds(displayForm.changeDelay)}
          </label>
          <StepRange
            onIncrement={() => stepChangeDelay()}
            onDecrement={() => stepChangeDelay(false)}
            id="change-delay-input"
            className="grow"
            name="changeDelay"
            type="range"
            min={minChangeDelay}
            max={maxChangeDelay}
            step="1"
            value={displayForm.changeDelay}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleDisplaySettingsChange(
                "changeDelay",
                parseInt(e.target.value, 10)
              )
            }
          />
        </div>
        <MockDisplay
          value={displayForm.images}
          onChange={(newValue) =>
            handleDisplaySettingsChange("images", newValue)
          }
          inkyDisplay={displayClassByType[displayForm.type]}
        ></MockDisplay>
        <div className="max-w-prose w-full flex justify-end py-2">
          <button type="submit" className="default">
            Submit
          </button>
        </div>
      </form>
    </>
  );
}
