"use client";
import {usePathname} from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {capitalize} from "lodash-es";
import Link from "next/link";
import * as React from "react";

export default function DynamicBreadcrumbs({...props}: React.ComponentPropsWithoutRef<typeof Breadcrumb>) {
  const pathname = usePathname(); // e.g., "/home/products/item"
  const segments = pathname.split('/').filter(Boolean);
  let homeBreadcrumb: React.ReactElement;
  const breadcrumbItems: React.ReactElement[] = [];
  let href: string = '';
  let breadcrumbPage: React.ReactElement = (<></>);

  if (segments.length > 0) {
    homeBreadcrumb = (
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link href="/">Overview</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
    )
  } else {
    homeBreadcrumb = (
      <BreadcrumbItem>
        <BreadcrumbPage className="text-foreground/80"></BreadcrumbPage>
      </BreadcrumbItem>
    )
  }

  for (const [index, segment] of segments.entries()) {
    href += `/${segment}`;
    const name = segment
      .split('-')
      .map(word => capitalize(word))
      .join(' ');

    if (index === segments.length - 1) {
      breadcrumbPage = (
        <React.Fragment key={`${segment}-${index}`}>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground/80">{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </React.Fragment>
      )
    } else {
      breadcrumbItems.push(
        <React.Fragment key={`${segment}-${index}`}>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={href}>{name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </React.Fragment>
      )
    }

  }

  return (
    <Breadcrumb className="flex items-start" {...props}>
      <BreadcrumbList>
        {homeBreadcrumb}
        {breadcrumbItems}
        {breadcrumbPage}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
