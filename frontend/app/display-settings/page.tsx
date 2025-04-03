"use client";
import {useSettings} from "@/app/providers/settings-provider";
import {useEffect} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {BorderColour, displayClassByType, DisplayMode, DisplayType, Palette} from "@/lib/display-types";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {useRouter} from "next/navigation";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useSubmit} from "@/app/hooks/useSubmit";
import clsx from "clsx";

export default function Page() {
  const router = useRouter();
  const {displaySettings, submitDisplaySetting} = useSettings();
  const settingsForm = useForm<SettingsForm>({
    resolver: zodResolver(settingsFormSchema),
    mode: "onChange",
  })
  const typeValue = useWatch({
    control: settingsForm.control,
    name: 'type'
  });
  const {submit, responsePending} = useSubmit<boolean, [SettingsForm]>((values: SettingsForm) =>
    submitDisplaySetting({...values})
  );
  const displayClass = typeValue && displayClassByType[typeValue];
  // ".includes" will re-evaluate on each render such as a form value changing
  const hasRedPalette = displayClass?.palettes?.includes(Palette.RED) ?? false;
  const hasYellowPalette = displayClass?.palettes?.includes(Palette.YELLOW) ?? false;
  const hasSevenColourPalette = displayClass?.palettes?.includes(Palette.SEVEN_COLOUR) ?? false;

  useEffect(() => {
    if (displaySettings) {
      // Existing data retrieved, update form
      settingsForm.reset({...displaySettings});
      // Trigger validation after setting all fields
      void settingsForm.trigger();
    }
  }, [displaySettings, settingsForm]);

  useEffect(() => {
    const colourPalette = settingsForm.getValues('colourPalette');
    const availablePalettes = displayClass?.palettes;

    if (colourPalette && availablePalettes && !availablePalettes?.includes(colourPalette)) {
      // Update colour palette to a compatible one
      settingsForm.setValue('colourPalette', availablePalettes[0]);
      // Trigger validation
      void settingsForm.trigger();
    }
  }, [displayClass?.palettes, settingsForm, typeValue]);

  const onSubmit = async (values: SettingsForm) => {
    const success = await submit({...values});
    if (success) {
      router.push("/");
    }
    return success;
  }

  return (
    <Form {...settingsForm}>
      <form
        className={clsx("flex flex-col gap-y-2 w-full items-center", {
          "cursor-progress": responsePending
        })}
        onSubmit={settingsForm.handleSubmit(onSubmit)}
      >
        <div className="max-w-prose w-full flex flex-col gap-y-4">
          <FormField
            control={settingsForm.control}
            name="type"
            render={({field}) => (
              <FormItem>
                <FormLabel>Inky display</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Display Type"/>
                    </SelectTrigger>
                  </FormControl>
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
                <FormDescription>Select the type of Inky Display you&#39;re using.</FormDescription>
                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            control={settingsForm.control}
            name="colourPalette"
            render={({field}) => (
              <FormItem>
                <FormLabel>Colour palette</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Colour Palette"/>
                    </SelectTrigger>
                  </FormControl>
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
                <FormDescription>Select the colour palette for your Inky Display.</FormDescription>
                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            control={settingsForm.control}
            name="borderColour"
            render={({field}) => (
              <FormItem>
                <FormLabel>Border colour</FormLabel>
                <FormControl>
                  <RadioGroup
                    {...field}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1">
                    <FormItem className="flex items-center space-y-0">
                      <FormControl>
                        <RadioGroupItem value={BorderColour.WHITE}/>
                      </FormControl>
                      <FormLabel className="px-3 cursor-pointer">White</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-cente space-y-0">
                      <FormControl>
                        <RadioGroupItem value={BorderColour.BLACK}/>
                      </FormControl>
                      <FormLabel className="px-3 cursor-pointer">Black</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>The colour surrounding the display.</FormDescription>
                <FormMessage/>
              </FormItem>
            )}/>
          <FormField
            control={settingsForm.control}
            name="mode"
            render={({field}) => (
              <FormItem>
                <FormLabel>Display mode</FormLabel>
                <FormControl>
                  <RadioGroup
                    {...field}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1">
                    <FormItem className="flex items-center space-y-0">
                      <FormControl>
                        <RadioGroupItem value={DisplayMode.SLIDESHOW}/>
                      </FormControl>
                      <FormLabel className="px-3 cursor-pointer">Slideshow</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-y-0">
                      <FormControl>
                        <RadioGroupItem value={DisplayMode.IMAGE_FEED}/>
                      </FormControl>
                      <FormLabel className="px-3 cursor-pointer">Image Feed</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>The active mode.</FormDescription>
                <FormMessage/>
              </FormItem>
            )}/>
        </div>
        <div className="max-w-prose w-full flex justify-end py-2">
          <Button type="submit" disabled={!settingsForm.formState.isValid || responsePending}>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  )
}

const settingsFormSchema = z.object({
  type: z.nativeEnum(DisplayType),
  colourPalette:
    z.nativeEnum(Palette),
  borderColour:
    z.nativeEnum(BorderColour),
  mode:
    z.nativeEnum(DisplayMode),
}).refine((data) => {
  const {type, colourPalette} = data;
  const displayClass = displayClassByType[type];
  // Check selected display type is compatible with selected colour palette
  return displayClass?.palettes?.includes(colourPalette);
}, {message: 'Selected display type does not support the selected colour palette.', path: ['colourPalette']});

type SettingsForm = z.infer<typeof settingsFormSchema>;
