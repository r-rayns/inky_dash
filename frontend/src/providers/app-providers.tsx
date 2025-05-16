import { SettingsProvider } from "./settings-provider";
import { useToast } from "./toast-provider";
import type { ReactNode } from 'react';
import { SlideshowProvider } from '@/providers/slideshow-provider.tsx';

export const AppProviders = ({children}: { children: ReactNode; }) => {
  const {addToast} = useToast();

  return (
    <SettingsProvider addToast={addToast}>
      <SlideshowProvider addToast={addToast}>
        {children}
      </SlideshowProvider>
    </SettingsProvider>
  );
};
