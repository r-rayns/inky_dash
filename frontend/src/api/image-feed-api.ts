import type { ImageFeedConfiguration, SetImageFeedResponse } from '@/types/image-feed.ts';
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


