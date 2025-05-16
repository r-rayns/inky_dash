import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import clsx from 'clsx';
import type { ImageFeedConfigurationResponse, SetImageFeedResponse } from '@/types/image-feed';
import type { second } from '@/types/branded-types';
import { useToast } from '@/providers/toast-provider.tsx';
import { constructUrl } from '@/lib/utils';
import { useSubmit } from '@/hooks/useSubmit';
import { ToastType } from '@/types/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button.tsx';
import { updateImageFeed } from '@/api/image-feed-api.ts';
import { Input } from '@/components/ui/input.tsx';
import { constructTimeString } from '@/lib/time.ts';
import StepRange from '@/components/ui/step-range';

export const Route = createFileRoute('/image-feed-configuration/')({
  component: ImageFeedConfigurationPage,
  head: () => {
    return {
      meta: [
        {
          title: 'Inky Dash - Image Feed Configuration',
        }
      ]
    }
  },
  loader: () => ( {
    crumb: 'Image Feed Configuration'
  } )
})

function ImageFeedConfigurationPage() {
  const minPollInterval = 60;
  const maxPollInterval = 600;
  const {addToast} = useToast();
  const {
    data: imageFeedData,
    isLoading: imageFeedDataLoading
  } = useSWR<ImageFeedConfigurationResponse>(constructUrl("image-feed"), {revalidateOnReconnect: true});

  const imageFeedForm = useForm<ImageFeedFormInput, unknown, ImageFeedFormOutput>({
    resolver: zodResolver(imageFeedConfigurationFormSchema),
    mode: "onBlur",
    defaultValues: {
      pollingInterval: 60,
      imageFeedUrl: ''
    }
  })
  const {submit, responsePending} = useSubmit<SetImageFeedResponse | null | void, [ImageFeedFormOutput]>(
    (values: ImageFeedFormOutput) =>
      updateImageFeed({...values}, (message: string) =>
        addToast(`Error updating image feed configuration - ${message}`, {type: ToastType.ERROR})
      )
  )

  useEffect(() => {
    if (imageFeedData) {
      imageFeedForm.reset({
        pollingInterval: imageFeedData.polling_interval as second,
        imageFeedUrl: imageFeedData.image_feed_url
      })
    }
  }, [imageFeedForm, imageFeedData]);

  const onSubmit = async (values: ImageFeedFormOutput) => {
    let success = false;
    const res = await submit(values);
    if (res) {
      addToast("Successfully submitted image feed configuration", {type: ToastType.SUCCESS});
      success = true;
    }

    return success;
  }

  const stepPollingInterval = (increment: boolean = true) => {
    let newPollingInterval: second = (imageFeedForm.getValues('pollingInterval')) as second;
    if (increment) {
      newPollingInterval = Math.min(maxPollInterval, newPollingInterval + 60) as second;
    } else {
      newPollingInterval = Math.max(minPollInterval, newPollingInterval - 60) as second;
    }
    imageFeedForm.setValue('pollingInterval', newPollingInterval);
  };


  return (
    <Form {...imageFeedForm}>
      <form
        className={clsx("flex flex-col gap-y-4 w-full items-center", {
          "cursor-progress": responsePending
        })}
        onSubmit={imageFeedForm.handleSubmit(onSubmit)}
      >
        <div className="max-w-prose w-full flex flex-col gap-y-4">
          {imageFeedDataLoading &&
            <Skeleton className="h-8"/>
          }
          {!imageFeedDataLoading &&
            <FormField
              control={imageFeedForm.control}
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
              control={imageFeedForm.control}
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
                  <FormDescription>Period of time between each poll. The display will only be updated if the image has
                    changed.</FormDescription>
                  <FormMessage/>
                </FormItem>
              )}/>
          }
        </div>
        <div className="max-w-prose w-full flex justify-end py-2">
          <Button type="submit" disabled={imageFeedDataLoading
            || !imageFeedForm.formState.isValid
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
  pollingInterval: z.number().transform((value: number): second => value as second),
  imageFeedUrl: z.string().startsWith('http://', {message: protocolErrorMessage})
    .or(z.string().startsWith('https://', {message: protocolErrorMessage}))
    .and(z.string().endsWith('.png', {message: urlFileTypeErrorMessage})
      .or(z.string().endsWith('.jpeg', {message: urlFileTypeErrorMessage}))
      .or(z.string().endsWith('.jpg', {message: urlFileTypeErrorMessage})))
    .and(z.string().url()),
});

type ImageFeedFormInput = z.input<typeof imageFeedConfigurationFormSchema>;
type ImageFeedFormOutput = z.infer<typeof imageFeedConfigurationFormSchema>;