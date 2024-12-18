"use client";
import {useSettings} from "@/app/providers/settings-provider";
import {FormEvent, useEffect, useState} from "react";
import {DisplaySettings} from "@/lib/settings-service";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {BorderColour, displayClassByType, DisplayMode, DisplayType, isDisplayType, Palette} from "@/lib/display-types";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

export default function Page() {
  const {displaySettings, settingsIsLoading, submitDisplaySetting} = useSettings();
  const [displayForm, setDisplayForm] = useState<Partial<DisplaySettings>>();
  const [formValidity, setFormValidity] = useState(false);

  const displayClass = displayForm?.type && displayClassByType[displayForm.type];
  // ".includes" will re-evaluate on each render such as a form value changing
  const hasRedPalette = displayClass?.palettes.includes(Palette.RED) ?? false;
  const hasYellowPalette = displayClass?.palettes.includes(Palette.YELLOW) ?? false;
  const hasSevenColourPalette = displayClass?.palettes.includes(Palette.SEVEN_COLOUR) ?? false;

  useEffect(() => {
    if (displaySettings) {
      // Existing data retrieved, update form
      setDisplayForm({...displaySettings});
    }
  }, [displaySettings]);

  useEffect(() => {
    const {success: isValid} = displaySettingsFormSchema.safeParse(displayForm);
    setFormValidity(isValid);
  }, [displayForm]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const {data} = displaySettingsFormSchema.safeParse(displayForm);
    if (data) {
      await submitDisplaySetting({...data});
    }
  }

  const handleDisplaySettingsChange = (key: keyof DisplaySettings, value: unknown) => {
    setDisplayForm((prevState) => {
      let updatedState = {
        ...prevState,
        [key]: value
      }
      if (key === 'type' && isDisplayType(value)) {
        const availablePalettes = displayClassByType[value].palettes;
        if (displayForm?.colourPalette && availablePalettes.includes(displayForm.colourPalette)) {
          updatedState.colourPalette = displayForm?.colourPalette
        } else {
          updatedState.colourPalette = availablePalettes[0];
        }
      }
      return updatedState
    })
  };

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
            value={displayForm?.type}
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
            value={displayForm?.colourPalette}
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
            value={displayForm?.borderColour}
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
              <SelectItem value={BorderColour.WHITE}>White 🤍</SelectItem>
              <SelectItem value={BorderColour.BLACK}>Black 🖤</SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="mode-radio">Select the display mode:</Label>
          <RadioGroup
            value={displayForm?.mode}
            onValueChange={(value) => {
              if (value) {
                handleDisplaySettingsChange("mode", value)
              }
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={DisplayMode.SLIDESHOW} id="r1"/>
              <Label htmlFor="r1">Slideshow</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={DisplayMode.IMAGE_FEED} id="r2"/>
              <Label htmlFor="r2">Image Feed</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="max-w-prose w-full flex justify-end py-2">
          <Button type="submit" disabled={!formValidity}>
            Submit
          </Button>
        </div>
      </form>
    </>
  )
}

const displaySettingsFormSchema = z.object({
  type: z.nativeEnum(DisplayType),
  colourPalette: z.nativeEnum(Palette),
  borderColour: z.nativeEnum(BorderColour),
  mode: z.nativeEnum(DisplayMode),
});
