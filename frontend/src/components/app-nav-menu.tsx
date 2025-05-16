import { MonitorDown, Projector, SlidersHorizontal } from "lucide-react";
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { RegisteredRouter, ValidateLinkOptions  } from '@tanstack/react-router';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";

interface ConfigurationLink {
  name: string;
  description: string;
  icon: ReactNode;
  linkOptions: ValidateLinkOptions<RegisteredRouter, unknown>
}

const iconClassName = "size-5 text-inherit"
const configurationLinks: Array<ConfigurationLink> = [
  {
    name: "Display Settings",
    description: "Configure the display settings",
    linkOptions: {
      to: "/display-settings",
    },
    icon: ( <SlidersHorizontal className={iconClassName}/> )
  },
  {
    name: "Slideshow",
    description: "Configure slideshow, set images and timing",
    linkOptions: {
      to: "/slideshow-configuration",
    },
    icon: ( <Projector className={iconClassName}/> )
  },
  {
    name: "Image Feed",
    description: "Configure image feed, provide a URL and polling interval",
    linkOptions: {
      to: "/image-feed-configuration",
    },
    icon: ( <MonitorDown className={iconClassName}/> )
  }

]

export default function AppNavMenu({...props}: ComponentPropsWithoutRef<typeof NavigationMenu>) {
  const defaultDescription = "Select an option to configure";
  const [activeDescription, setActiveDescription] = useState<string>(defaultDescription);

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="m-2">
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            Configuration
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="flex flex-row">
              <div
                className="hidden w-44 m-1 p-2 bg-gradient-to-b from-background/20 to-background/80 rounded-md md:flex items-center text-center">
                <p className="text-sm">{activeDescription}</p>
              </div>
              <ul className="m-2 p-2 list-none"
                  onMouseLeave={() => setActiveDescription(defaultDescription)}>
                {configurationLinks.map((link) => {
                  return (
                    <li key={link.name}
                        className="mt-1 first:mt-0 text-sm">
                      <NavigationMenuLink
                        className="flex flex-row gap-1 items-center text-nowrap"
                        onMouseOver={() => setActiveDescription(link.description)}
                        asChild
                      >
                        <Link {...link.linkOptions}>
                          {link.icon}{link.name}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
            <Link to="/about">
              About
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
            <Link to="/help">
              Help
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
