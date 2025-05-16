import { HeadContent, Outlet, createRootRoute, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { OctopusIcon } from '@/components/icons/octopus.tsx';
import AppNavMenu from '@/components/app-nav-menu.tsx';
import ThemeToggle from '@/components/theme-toggle.tsx';
import { AppProviders } from '@/providers/app-providers.tsx';
import { ToastProvider } from '@/providers/toast-provider.tsx';
import Toast from '@/components/toast/toast.tsx';
import DynamicBreadcrumbs from '@/components/dynamic-breadcrumbs.tsx';

export const Route = createRootRoute({
  head: () => ( {
    meta: [
      {
        title: 'Inky Dash',
        description: 'Interface for Inky e-paper displays.',
      },
      {
        name: 'description',
        description: 'An interface for Pimoroni\'s line of Raspberry Pi ePaper displays.'
      }
    ]
  } ),
  loader: () => ( {
    crumb: 'Overview'
  } ),
  component: RootComponent
})

function RootComponent() {
  const navigate = useNavigate()
  return (
    <>
      <HeadContent/>
      <ThemeToggle className="absolute right-0 mt-2 mr-2"/>
      <main className="flex flex-col p-2 md:p-0 w-full items-center">
        <header className="max-w-prose w-full flex flex-col">
          <h1
            className="font-silkscreen flex self-center items-center cursor-pointer hover:text-primary/80 active:text-primary/50"
            onClick={() => navigate({to: '/'})}>
            Inky <OctopusIcon className="w-12 md:w-24 inline"/> Dash
          </h1>
          <AppNavMenu className="self-center"/>
          <DynamicBreadcrumbs/>
        </header>
        <ToastProvider>
          <AppProviders>
            <Outlet/>
            <Toast></Toast>
          </AppProviders>
        </ToastProvider>
        <TanStackRouterDevtools/>
      </main>
    </>
  )
}
