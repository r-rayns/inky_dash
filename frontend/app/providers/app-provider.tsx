"use client";
import {SettingsProvider} from './settings-provider';
import {useToast} from './toast-provider';
import {ReactNode} from "react";
import {SlideshowProvider} from "@/app/providers/slideshow-provider";

export const AppProviders = ({children,}: Readonly<{ children: ReactNode; }>) => {
  const {addToast} = useToast();

  return (
    <SettingsProvider addToast={addToast}>
      <SlideshowProvider addToast={addToast}>
        {children}
      </SlideshowProvider>
    </SettingsProvider>
  );
};
