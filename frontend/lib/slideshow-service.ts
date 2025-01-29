import { second } from '@/lib/branded-types';
import { fetchWithErrorHandling } from '@/lib/fetcher';
import { constructUrl } from '@/lib/utils';

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

export interface SlideshowConfiguration {
  changeDelay: second;
  images: string[];
}

export interface SlideshowConfigurationResponse {
  change_delay: number;
  images: string[];
}

export interface SetSlideshowResponse {
  message: string;
}

export const defaultSlideshowConfiguration: SlideshowConfiguration = {
  changeDelay: 120 as second,
  images: []
}
