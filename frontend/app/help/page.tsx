import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import Link from "next/link";

export default function Page() {
  return (

    <Accordion type="single" collapsible className="w-full max-w-prose">
      <AccordionItem value="item-1">
        <AccordionTrigger>Automatic display detection failed</AccordionTrigger>
        <AccordionContent>
          <p>
            When Inky Dash loads it attempts to automatically detect the display using the &#34;auto&#34; method from Pimoroni&#39;s
            Python library. If this fails the display is defaulted to &#34;Inky pHAT (212 x 104)&#34;.
            Using the <Link href="/display-settings">settings</Link> page you can attempt to manually select the display
            to use.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What is Slideshow mode?</AccordionTrigger>
        <AccordionContent>
          <p>
            Slideshow mode automatically cycles through a collection of images at your chosen interval. You can select
            which images to display and set the transition timing through the <Link href="/slideshow-configuration">slideshow
            configuration</Link> page.</p>
          <p>
            To start using this feature, make sure Slideshow mode is turned on in your <Link href="/display-settings">display
            settings</Link>.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>What is Image Feed mode?</AccordionTrigger>
        <AccordionContent>
          <p>
            Image Feed mode allows your display to automatically update with images from a specified web location. When
            enabled, the display periodically checks a URL that points to a PNG or JPEG image, downloading and
            displaying the latest version at your chosen interval.</p>
          <p>You can configure both the source URL and how frequently it checks for updates through the <Link
            href="/image-feed-configuration">image feed configuration</Link> page. The display will only update when the
            downloaded image differs from the currently displayed image. Before the feed becomes active,
            ensure that Image Feed mode is switched on in your <Link href="/display-settings">display settings</Link>.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
