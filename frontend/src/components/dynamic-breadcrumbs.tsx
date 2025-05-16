import { isNil } from 'es-toolkit';
import { Link, useMatches } from '@tanstack/react-router';
import { Fragment } from 'react';
import { clsx } from 'clsx';
import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";

export default function DynamicBreadcrumbs({...props}: ComponentPropsWithoutRef<typeof Breadcrumb>) {
  const matches = useMatches();
  // Type guard: filters matches to only those with a `loaderData.crumb` defined
  const hasCrumb = (match: typeof matches[0]): match is typeof matches[0] & { loaderData: { crumb: string } } => {
    return !isNil(match.loaderData?.crumb)
  }

  // Create our breadcrumb array filtering with the type guard
  const breadcrumbs: Array<{ label: string, pathname: string }> = matches
    .filter(hasCrumb)
    .map(({pathname, loaderData}) => {
      return {label: loaderData.crumb, pathname}
    })

  const breadcrumbItems: Array<ReactElement> = [];
  let href = '';
  let breadcrumbPage: ReactElement = ( <></> );


  if (breadcrumbs.length > 1) {
    for (const [index, breadcrumb] of breadcrumbs.entries()) {
      href += breadcrumb.pathname

      if (index === breadcrumbs.length - 1) {
        // The breadcrumb for the current page
        breadcrumbPage = (
          <Fragment key={`${breadcrumb.pathname}-${index}`}>
            <BreadcrumbSeparator/>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground/80">{breadcrumb.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </Fragment>
        )
      } else {
        breadcrumbItems.push(
          <Fragment key={`${breadcrumb.pathname}-${index}`}>
            <BreadcrumbSeparator className={clsx({'hidden': index === 0})}/>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={href}>{breadcrumb.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        )
      }
    }
  }

  return (
    <Breadcrumb className="flex items-start mb-4" {...props}>
      <BreadcrumbList>
        {breadcrumbItems}
        {breadcrumbPage}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
