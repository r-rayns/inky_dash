"use client";
import { SettingsProvider } from './settings-provider';
import { useToast } from './toast-provider';

export const AppProviders = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { addToast } = useToast();

  return (
    <SettingsProvider addToast={addToast}>
      {children}
    </SettingsProvider>
  );
};
