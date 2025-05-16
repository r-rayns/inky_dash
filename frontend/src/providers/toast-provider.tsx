import { createContext, useContext, useState } from "react";
import { v4 as uuid } from "uuid";
import { clone } from "es-toolkit";
import { SWRConfig } from 'swr';
import type { ReactNode } from "react";
import type { AddToastFn, Toast, ToastOptions } from "@/types/toast";
import type { Timeout } from '@tanstack/router-core';
import { ToastType } from "@/types/toast";
import { fetchWithErrorHandling } from '@/lib/fetcher.ts';

interface ToastContextDefaults {
  toasts: Array<Toast>;
  addToast: AddToastFn;
  removeToast: (id: string) => boolean;
}

// Placeholder implementations
const ToastContext = createContext<ToastContextDefaults>({
  toasts: [],
  addToast: (message: string, toastOptions: Partial<ToastOptions> = {}) => {
    const options: ToastOptions = Object.assign(
      {type: ToastType.INFO, duration: 5},
      toastOptions
    );
    return {id: "", message, options};
  },
  removeToast: () => false,
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({children}: Readonly<{ children: ReactNode; }>) => {
  const [toasts, setToasts] = useState<Array<Toast>>([]);
  const [, setTimersByToastId] = useState<
    Record<string, number | Timeout>
  >({});

  function addToast(message: string, toastOptions: Partial<ToastOptions> = {}): Toast {
    const options: ToastOptions = Object.assign(
      {type: ToastType.SUCCESS, duration: 10}, // Defaults
      toastOptions
    );
    const newToast = {id: uuid(), message, options};
    const duplicateToasts = toasts.filter((toast) => (
      toast.message === message && toast.options.type === options.type ));

    if (duplicateToasts.length) {
      // Remove the duplicate toasts, we will be creating a fresh one below
      for (const duplicateToast of duplicateToasts) {
        removeToast(duplicateToast.id);
      }
    }

    const durationTimer: Timeout = setTimeout(
      () => removeToast(newToast.id),
      newToast.options.duration * 1000
    );

    setTimersByToastId((prevTimersByToastId) => ( {
      ...prevTimersByToastId,
      [newToast.id]: durationTimer,
    } ));
    setToasts((prevToasts) => [...prevToasts, newToast]);


    return newToast;
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
    <ToastContext.Provider value={{toasts, addToast, removeToast}}>
      <SWRConfig // configs can be nested should we wish to modify it outside this provider
        value={{
          fetcher: (url, options) =>
            fetchWithErrorHandling(url, options,
              (message: string) => { // Error message handler
                addToast(message, {type: ToastType.ERROR});
              },
              (message: string) => { // Info message handler
                addToast(message, {type: ToastType.INFO})
              }
            ),
          onSuccess(data) {
            if (data?.message) {
              addToast(data.message, {type: ToastType.INFO});
            }
          },
          onError: (error) => {
            console.error("Error retrieving data", error);
          },
        }}
      >
        {children}
      </SWRConfig>
    </ToastContext.Provider>
  );
};
