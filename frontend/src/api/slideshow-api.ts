import type { SetSlideshowResponse, SlideshowConfiguration } from "@/types/slideshow";
import { fetchWithErrorHandling } from '@/lib/fetcher.ts';
import { constructUrl } from '@/lib/utils.ts';

export async function updateSlideshow(
  configuration: SlideshowConfiguration,
  alertFn: (message: string) => void
): Promise<SetSlideshowResponse | null | void> {
  return fetchWithErrorHandling<SetSlideshowResponse>(
    constructUrl('slideshow'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        change_delay: configuration.changeDelay,
        images: configuration.images
      }),
    },
    alertFn
  ).catch((error: Error) => {
    console.error('Error updating slideshow configuration', error);
  });
}