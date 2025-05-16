import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/slideshow-configuration')({
  loader: () => ( {
    crumb: 'Slideshow Configuration'
  } )
})