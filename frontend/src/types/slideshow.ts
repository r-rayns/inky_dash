import type { second } from "./branded-types";

export interface SlideshowConfiguration {
  changeDelay: second;
  images: Array<string>;
}

export interface SlideshowConfigurationResponse {
  change_delay: number;
  images: Array<string>;
}

export interface SetSlideshowResponse {
  message: string;
}

export const defaultSlideshowConfiguration: SlideshowConfiguration = {
  changeDelay: 120 as second,
  images: [],
}