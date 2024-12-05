"use client";
import { SettingsProvider } from './settings-provider';
import { useToast } from './toast-provider';
import {ReactNode} from "react";

export const AppProviders = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const { addToast } = useToast();

  return (
    <SettingsProvider addToast={addToast}>
      {children}
    </SettingsProvider>
  );
};
