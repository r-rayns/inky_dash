import { second } from '@/lib/branded-types';
import { fetchWithErrorHandling } from '@/lib/fetcher';
import { constructUrl } from '@/lib/utils';

export async function updateImageFeed(
  configuration: ImageFeedConfiguration,
  alertFn: (message: string) => void
): Promise<SetImageFeedResponse | null | void> {
  return fetchWithErrorHandling<SetImageFeedResponse>(
    constructUrl('image-feed'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        polling_interval: configuration.pollingInterval,
        image_feed_url: configuration.imageFeedUrl
      }),
    },
    alertFn
  ).catch((error: Error) => {
    console.error('Error updating image feed configuration', error);
  });
}

export interface ImageFeedConfiguration {
  pollingInterval: second;
  imageFeedUrl: string;
}

export interface ImageFeedConfigurationResponse {
  polling_interval: number;
  image_feed_url: string;
}

export interface SetImageFeedResponse {
  message: string;
}
