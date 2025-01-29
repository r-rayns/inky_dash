"use client"
import StepRange from "@/components/ui/step-range";
import {second} from "@/lib/branded-types";
import MockDisplay from "@/components/mock-display";
import {useSettings} from "@/app/providers/settings-provider";
import {displayClassByType} from "@/lib/display-types";
import {SlideshowForm, useSlideshow} from "@/app/providers/slideshow-provider";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {constructTimeString} from "@/lib/time";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useSubmit} from "@/app/hooks/useSubmit";
import clsx from "clsx";

export default function Page() {
  const minChangeDelay = 300;
  const maxChangeDelay = 86400;
  const {
    slideshowDataLoading,
    slideshowForm,
    submitSlideshowConfiguration
  } = useSlideshow();

  const {displaySettings} = useSettings();
  const displayClass = displaySettings?.type && displayClassByType[displaySettings.type];
  const {submit, responsePending} = useSubmit<boolean, [SlideshowForm]>((values: SlideshowForm) =>
    submitSlideshowConfiguration(values)
  );

  const onSubmit = async (values: SlideshowForm) => {
    return submit({...values});
  }

  const stepChangeDelay = (increment: boolean = true) => {
    let newChangeDelay: second = slideshowForm?.getValues('changeDelay') ?? minChangeDelay as second;
    if (increment) {
      newChangeDelay = Math.min(maxChangeDelay, newChangeDelay + 60) as second;
    } else {
      newChangeDelay = Math.max(minChangeDelay, newChangeDelay - 60) as second;
    }
    slideshowForm?.setValue('changeDelay', newChangeDelay);
  };


  return slideshowForm && (
    <Form {...slideshowForm}>
      <form
        className={clsx("flex flex-col gap-y-4 mt-4 w-full items-center", {
          "cursor-progress": responsePending
        })}
        onSubmit={slideshowForm.handleSubmit(onSubmit)}
      >
        <div className="max-w-prose w-full">
          {slideshowDataLoading &&
            <Skeleton className="h-8"/>
          }
          {!slideshowDataLoading &&
            <FormField
              control={slideshowForm.control}
              name="changeDelay"
              render={({field}) => (
                <FormItem>
                  <FormLabel>
                    Change image every {constructTimeString(field.value)}
                  </FormLabel>
                  <FormControl>
                    <StepRange
                      value={[field.value]}
                      name={field.name}
                      onIncrement={() => stepChangeDelay()}
                      onDecrement={() => stepChangeDelay(false)}
                      min={minChangeDelay}
                      max={maxChangeDelay}
                      step={60}
                      onValueChange={([value]) =>
                        field.onChange(value as second)
                      }
                    />
                  </FormControl>
                  <FormDescription>Period of time an image is displayed for.</FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />
          }
        </div>
        <div className="max-w-prose w-full">
          {slideshowDataLoading &&
            <Skeleton className="w-full m-auto h-96"/>
          }
          {!slideshowDataLoading && displayClass &&
            <FormField
              control={slideshowForm.control}
              name="images"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Slideshow images</FormLabel>
                  <FormControl>
                    <MockDisplay
                      value={field.value}
                      onChange={(value) =>
                        field.onChange(value)
                      }
                      inkyDisplay={displayClass}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
          }
        </div>
        <div className="max-w-prose w-full flex justify-end py-2">
          <Button type="submit"
                  disabled={slideshowDataLoading
                    || !slideshowForm.formState.isValid
                    || responsePending}>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}

