"use client";
import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import {MonitorDown, Projector, SlidersHorizontal} from "lucide-react";

const configurationLinks = [
  {
    name: "Display Settings",
    description: "Configure the display settings",
    href: "/display-settings/",
    icon: (<SlidersHorizontal/>)
  },
  {
    name: "Slideshow",
    description: "Configure slideshow, set images and timing",
    href: "/slideshow-configuration/",
    icon: (<Projector/>)
  },
  {
    name: "Image Feed",
    description: "Configure image feed, provide a URL and polling interval",
    href: "/image-feed-configuration/",
    icon: (<MonitorDown/>)
  }
]

export default function AppNavMenu({...props}: React.ComponentPropsWithoutRef<typeof NavigationMenu>) {
  const defaultDescription = "Select an option to configure";
  const [activeDescription, setActiveDescription] = React.useState<string>(defaultDescription);

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="m-0">
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            Configuration
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="flex flex-row">
              <div
                className="hidden w-44 m-2 p-2 bg-gradient-to-b from-background/20 to-background/80 rounded-md md:flex items-center text-center">
                <p className="text-sm">{activeDescription}</p>
              </div>
              <ul className="m-2 p-2 list-none"
                  onMouseLeave={() => setActiveDescription(defaultDescription)}>
                {configurationLinks.map((link) => {
                  return (
                    <li key={link.name}
                        className="mt-2 first:mt-0 text-sm">
                      <Link href={link.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className="flex flex-row gap-1 items-center text-nowrap"
                          onMouseOver={() => setActiveDescription(link.description)}
                        >{link.icon}{link.name}</NavigationMenuLink>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/help" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Help
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
