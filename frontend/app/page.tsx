"use client";
import {DisplaySettings} from "@/lib/display-service";
import {displayClassByType, DisplayType, isDisplayType, Palette} from "@/lib/display-types";
import {pluraliseUnitIfNeeded} from "@/lib/utils";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {defaultSettings, useSettings} from "./providers/settings-provider";
import MockDisplay from "./ui/mock-display/mock-display";
import {Button} from "@/components/ui/button";
import {Slider} from "@/components/ui/slider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import StepRange from "@/components/ui/step-range";

export default function Home() {
  const minChangeDelay = 30;
  const maxChangeDelay = 3600;
  const {displaySettings, updateDisplay} = useSettings();
  const [displayForm, setDisplayForm] =
    useState<DisplaySettings>(defaultSettings);

  // ".includes" will re-evaluate on each render such as a form value changing
  const hasRedPalette = displayClassByType[displayForm.type]
    .palettes.includes(Palette.RED);
  const hasYellowPalette = displayClassByType[displayForm.type]
    .palettes.includes(Palette.YELLOW);
  const hasSevenColourPalette = displayClassByType[displayForm.type]
    .palettes.includes(Palette.SEVEN_COLOUR);

  useEffect(() => {
    if (displaySettings) {
      // Existing data retrieved, override defaults
      setDisplayForm({...displaySettings});
    }
  }, [displaySettings]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateDisplay({...displayForm});
  }

  const handleDisplaySettingsChange = (key: keyof DisplaySettings, value: unknown) => {
    setDisplayForm((prevState) => {
      let updatedState = {
        ...prevState,
        [key]: value,
      }
      if (key === "type" && isDisplayType(value)) {
        const availablePalettes = displayClassByType[value].palettes;
        if (availablePalettes.includes(displayForm.colourPalette)) {
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
          <Label htmlFor="inky-display-select">Select your Inky Display:</Label>
          <Select
            name="inkyDisplay"
            value={displayForm.type}
            onValueChange={(value) => {
              if (value) {
                handleDisplaySettingsChange("type", value)
              }
            }}>
            <SelectTrigger id="inky-display-select">
              <SelectValue placeholder="Display Type"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DisplayType.PHAT_104}>
                Inky pHAT (212x104)
              </SelectItem>
              <SelectItem value={DisplayType.PHAT_122}>
                Inky pHAT (250x122)
              </SelectItem>
              <SelectItem value={DisplayType.IMPRESSION_400}>
                Inky Impression 4&quot; (640x400)
              </SelectItem>
              <SelectItem value={DisplayType.IMPRESSION_448}>
                Inky Impression 5.7&quot; (600x448)
              </SelectItem>
              <SelectItem value={DisplayType.IMPRESSION_480}>
                Inky Impression 7.3&quot; (800x480)
              </SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="colour-palette-select">
            Select your colour palette:
          </Label>
          <Select
            name="colourPalette"
            value={displayForm.colourPalette}
            onValueChange={(value) => {
              if (value) {
                handleDisplaySettingsChange("colourPalette", value)
              }
            }}
          >
            <SelectTrigger id="colour-palette-select">
              <SelectValue placeholder="Colour Palette"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Palette.RED} disabled={!hasRedPalette}>
                Red ❤️
              </SelectItem>
              <SelectItem value={Palette.YELLOW} disabled={!hasYellowPalette}>
                Yellow 💛
              </SelectItem>
              <SelectItem value={Palette.SEVEN_COLOUR} disabled={!hasSevenColourPalette}>
                7 Colour 🌈
              </SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="border-colour-select">Select a border colour:</Label>
          <Select
            name="borderColour"
            value={displayForm.borderColour}
            onValueChange={(value) => {
              if (value) {
                handleDisplaySettingsChange("borderColour", value)
              }
            }}
          >
            <SelectTrigger id="border-colour-select">
              <SelectValue placeholder="Border Colour"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="white">White 🤍</SelectItem>
              <SelectItem value="black">Black 🖤</SelectItem>
            </SelectContent>
          </Select>
          <label htmlFor="change-delay-input">
            Change image every {formatSeconds(displayForm.changeDelay)}
          </label>
          <StepRange
            onIncrement={() => stepChangeDelay()}
            onDecrement={() => stepChangeDelay(false)}
            id="change-delay-input"
            name="changeDelay"
            min={minChangeDelay}
            max={maxChangeDelay}
            step={1}
            value={[displayForm.changeDelay ?? 0]}
            onValueChange={([value]) =>
              handleDisplaySettingsChange(
                "changeDelay",
                value
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
          <Button type="submit" disabled={displayForm.images.length <= 0}>
            Submit
          </Button>
        </div>
      </form>
    </>
  );
}
