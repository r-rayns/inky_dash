import type { second } from '@/types/branded-types.ts';

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