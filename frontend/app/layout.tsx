import {inter, silkscreen} from "@/app/fonts";
import type {Metadata} from "next";
import "./globals.css";
import {AppProviders} from "./providers/app-provider";
import {ToastProvider} from "./providers/toast-provider";
import {OctopusIcon} from "@/components/icons/octopus";
import Toast from "@/components/ui/toast/toast";
import {ReactNode, Suspense} from "react";
import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import AppNavMenu from "@/components/app-nav-menu";
import Loading from "@/app/loading";

export const metadata: Metadata = {
  title: "Inky Dash",
  description: "Interface for Inky e-paper displays.",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
    <body
      className={`${inter.className} flex h-screen bg-background`}
    >
    <div className='p-2 md:p-0 w-full flex flex-col items-center'>
      <header className="max-w-prose w-full flex flex-col">
        <h1
          className={`${silkscreen.className} flex self-center items-center`}
        >
          Inky <OctopusIcon className="w-12 md:w-24 inline"/> Dash
        </h1>
        <AppNavMenu className="self-center"/>
        <DynamicBreadcrumbs className="py-2"/>
        {/*<Nav />*/}
      </header>
      <ToastProvider>
        <AppProviders>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
          <Toast></Toast>
        </AppProviders>
      </ToastProvider>
    </div>
    </body>
    </html>
  );
}
