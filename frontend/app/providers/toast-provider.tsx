"use client";
import { second } from '@/lib/branded-types';
import { fetchWithErrorHandling } from "@/lib/fetcher";
import { assign, clone, merge } from "lodash-es";
import { createContext, useContext, useState } from "react";
import { SWRConfig } from "swr";
import { v4 as uuid } from "uuid";

interface ToastContextDefaults {
  toasts: Toast[];
  addToast: AddToastFn;
  removeToast: (id: string) => boolean;
}

// placeholder implementations
const ToastContext = createContext<ToastContextDefaults>({
  toasts: [],
  addToast: (message: string, toastOptions: Partial<ToastOptions> = {}) => {
    const options: ToastOptions = assign(
      { type: ToastType.INFO, duration: 5 },
      toastOptions
    );
    return { id: "", message, options };
  },
  removeToast: (id: string) => false,
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [timersByToastId, setTimersByToastId] = useState<
    Record<string, NodeJS.Timeout | number>
  >({});

  function addToast(
    message: string,
    toastOptions: Partial<ToastOptions> = {}
  ): Toast {
    const options: ToastOptions = assign(
      { type: ToastType.SUCCESS, duration: 10 },
      toastOptions
    );
    const toast = { id: uuid(), message, options };
    const durationTimer = setTimeout(
      () => removeToast(toast.id),
      toast.options.duration * 1000
    );

    setTimersByToastId((prevTimersByToastId) => ({
      ...prevTimersByToastId,
      [toast.id]: durationTimer,
    }));
    setToasts((prevToasts) => [...prevToasts, toast]);

    return toast;
  }

  function removeToast(id: string): boolean {
    setToasts((prevToasts) => {
      return prevToasts.filter((toast) => toast.id !== id);
    });
    setTimersByToastId((prevTimersByToastId) => {
      const updatedTimersByToastId = clone(prevTimersByToastId);
      if (updatedTimersByToastId[id]) {
        clearTimeout(updatedTimersByToastId[id]);
        delete updatedTimersByToastId[id];
      }
      return updatedTimersByToastId;
    });
    return true;
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <SWRConfig // configs can be nested should we wish to modify it outside this provider
        value={{
          fetcher: (url, options) =>
            fetchWithErrorHandling(url, options, (message: string) => {
              addToast(message, { type: ToastType.ERROR });
            }),
          onSuccess(data, key, config) {
            if (data?.message) {
              addToast(data.message, { type: ToastType.INFO });
            }
          },
          onError: (error, key) => {
            console.error("Error retrieving data", error);
          },
        }}
      >
        {children}
      </SWRConfig>
    </ToastContext.Provider>
  );
};

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

