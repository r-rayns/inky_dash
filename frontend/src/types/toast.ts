import type { second } from '@/types/branded-types.ts';

export interface Toast {
  id: string;
  message: string;
  options: ToastOptions;
}

export interface ToastOptions {
  type: ToastType;
  duration: second;
}

export enum ToastType {
  ERROR = "error",
  SUCCESS = "success",
  INFO = "info",
}

export type AddToastFn = (message: string, options: Partial<ToastOptions>) => Toast