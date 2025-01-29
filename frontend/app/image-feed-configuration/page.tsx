"use client"
import {useEffect} from "react";
import StepRange from "@/components/ui/step-range";
import {constructUrl} from "@/lib/utils";
import {second} from "@/lib/branded-types";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {ImageFeedConfigurationResponse, SetImageFeedResponse, updateImageFeed} from "@/lib/image-feed-service";
import useSWR from "swr";
import {Input} from "@/components/ui/input";
import {constructTimeString} from "@/lib/time";
import {z} from "zod";
import {ToastType, useToast} from "@/app/providers/toast-provider";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useSubmit} from "@/app/hooks/useSubmit";
import clsx from "clsx";

export default function Page() {
  const minPollInterval = 60;
  const maxPollInterval = 600;
  const {addToast} = useToast();
  const {
    data: imageFeedData,
    isLoading: imageFeedDataLoading
  } = useSWR<ImageFeedConfigurationResponse>(constructUrl("image-feed"), {revalidateOnReconnect: true});
  const form = useForm<ImageFeedForm>({
    resolver: zodResolver(imageFeedConfigurationFormSchema),
    mode: "onBlur",
    defaultValues: {
      pollingInterval: 60 as second,
      imageFeedUrl: ''
    }
  })
  const {submit, responsePending} = useSubmit<SetImageFeedResponse | null | void, [ImageFeedForm]>(
    (values: ImageFeedForm) =>
      updateImageFeed({...values}, (message: string) =>
        addToast(`Error updating image feed configuration - ${message}`, {type: ToastType.ERROR})
      )
  )

  useEffect(() => {
    if (imageFeedData) {
      form.reset({
        pollingInterval: imageFeedData.polling_interval as second,
        imageFeedUrl: imageFeedData.image_feed_url
      })
    }
  }, [imageFeedData]);

  const onSubmit = async (values: ImageFeedForm) => {
    let success = false;
    const res = await submit(values);
    if (res) {
      addToast("Successfully submitted image feed configuration", {type: ToastType.SUCCESS});
      success = true;
    }

    return success;
  }

  const stepPollingInterval = (increment: boolean = true) => {
    let newPollingInterval: second = form.getValues('pollingInterval');
    if (increment) {
      newPollingInterval = Math.min(maxPollInterval, newPollingInterval + 60) as second;
    } else {
      newPollingInterval = Math.max(minPollInterval, newPollingInterval - 60) as second;
    }
    form.setValue('pollingInterval', newPollingInterval);
  };


  return (
    <Form {...form}>
      <form
        className={clsx("flex flex-col gap-y-4 mt-4 w-full items-center", {
          "cursor-progress": responsePending
        })}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="max-w-prose w-full flex flex-col gap-y-4">
          {imageFeedDataLoading &&
            <Skeleton className="h-8"/>
          }
          {!imageFeedDataLoading &&
            <FormField
              control={form.control}
              name="imageFeedUrl"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Image Feed URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Image Feed URL"/>
                  </FormControl>
                  <FormDescription>The image URL which will be periodically polled.</FormDescription>
                  <FormMessage/>
                </FormItem>
              )}/>
          }
          {imageFeedDataLoading &&
            <Skeleton className="h-8"/>
          }
          {!imageFeedDataLoading &&
            <FormField
              control={form.control}
              name="pollingInterval"
              render={({field}) => (
                <FormItem>
                  <FormLabel>
                    Refresh display every {constructTimeString(field.value)}
                  </FormLabel>
                  <FormControl>
                    <StepRange
                      value={[field.value]}
                      name={field.name}
                      onValueChange={([value]) => {
                        field.onChange(value as second);
                      }}
                      onIncrement={() => stepPollingInterval()}
                      onDecrement={() => stepPollingInterval(false)}
                      min={minPollInterval}
                      max={maxPollInterval}
                      step={60}
                    />
                  </FormControl>
                  <FormDescription>Period of time between each poll. The display will only be updated if the image has changed.</FormDescription>
                  <FormMessage/>
                </FormItem>
              )}/>
          }
        </div>
        <div className="max-w-prose w-full flex justify-end py-2">
          <Button type="submit" disabled={imageFeedDataLoading
            || !form.formState.isValid
            || responsePending}>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}

const protocolErrorMessage = 'URL must begin with "http://" or "https://"';
const urlFileTypeErrorMessage = 'URL must target a png or jpeg file';

const imageFeedConfigurationFormSchema = z.object({
  pollingInterval: z.number().transform(value => value as second),
  imageFeedUrl: z.string().startsWith('http://', {message: protocolErrorMessage})
    .or(z.string().startsWith('https://', {message: protocolErrorMessage}))
    .and(z.string().endsWith('.png', {message: urlFileTypeErrorMessage})
      .or(z.string().endsWith('.jpeg', {message: urlFileTypeErrorMessage}))
      .or(z.string().endsWith('.jpg', {message: urlFileTypeErrorMessage})))
    .and(z.string().url()),
});

type ImageFeedForm = z.infer<typeof imageFeedConfigurationFormSchema>;
