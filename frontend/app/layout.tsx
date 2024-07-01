import { inter, silkscreen } from "@/app/ui/fonts";
import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers/app-provider";
import { ToastProvider } from "./providers/toast-provider";
import { OctopusIcon } from "./ui/icons/octopus";
import Nav from "./ui/nav/nav";
import Toast from "./ui/toast/toast";

export const metadata: Metadata = {
  title: "Inky Dash",
  description: "Interface for Inky e-paper displays.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} max-w-prose p-2 md:p-0 m-auto bg-slate-200 dark:bg-gray-800`}
      >
        <div>
          <header className="text-center">
            <h1
              className={`${silkscreen.className} flex justify-center items-center`}
            >
              Inky <OctopusIcon className="w-12 md:w-24 inline" /> Dash
            </h1>
            <Nav />
          </header>
          <ToastProvider>
            <AppProviders>
              {children}
              <Toast></Toast>
            </AppProviders>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
