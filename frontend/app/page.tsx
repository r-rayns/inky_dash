"use client";
import { DisplaySettings } from "@/lib/display-service";
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

  const handleDisplaySettingsChange = (
    name: keyof DisplaySettings,
    value: unknown
  ) => {
    setDisplayForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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
      <form className="flex flex-col gap-y-2" onSubmit={onSubmit}>
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
          <option value="red">Red ❤️</option>
          <option value="yellow">Yellow 💛</option>
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
        <MockDisplay
          value={displayForm.images}
          onChange={(newValue) =>
            handleDisplaySettingsChange("images", newValue)
          }
        ></MockDisplay>

        <button type="submit" className="default self-end">
          Submit
        </button>
      </form>
    </>
  );
}
