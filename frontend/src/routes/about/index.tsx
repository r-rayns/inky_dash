import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about/')({
  component: AboutPage,
  head: () => {
    return {
      meta: [
        {
          title: 'Inky Dash - About',
        }
      ]
    }
  },
  loader: () => ( {
    crumb: 'About',
  } )
})

function AboutPage() {
  return (
    <section className="text-foreground w-full max-w-prose">
      <h2>Inky Dash - v{__APP_VERSION__}</h2>
      <p>
        Inky Dash is an interface for Pimoroni&#39;s line of Raspberry Pi ePaper displays.
      </p>
      <p>
        The following displays are supported:
      </p>
      <ul>
        <li><a href="https://shop.pimoroni.com/products/inky-phat?variant=12549254217811" target="_blank"
                  rel="noopener noreferrer">Inky pHAT (212 x 104)</a></li>
        <li><a href="https://shop.pimoroni.com/products/inky-phat?variant=12549254217811" target="_blank"
                  rel="noopener noreferrer">Inky pHAT (250 x 122)</a></li>
        <li><a href="https://shop.pimoroni.com/products/inky-impression-4?variant=39599238807635" target="_blank"
                  rel="noopener noreferrer">Inky Impression 4&#34;</a></li>
        <li><a href="https://shop.pimoroni.com/products/inky-impression-5-7?variant=32298701324371" target="_blank"
                  rel="noopener noreferrer">Inky Impression 5.7&#34;</a></li>
        <li><a href="https://shop.pimoroni.com/products/inky-impression-7-3?variant=40512683376723" target="_blank"
                  rel="noopener noreferrer">Inky Impression 7.3&#34;</a></li>
      </ul>
      <h3>Links</h3>
      <ul>
        <li>
          <a
            href="https://learn.pimoroni.com/tutorial/sandyj/getting-started-with-inky-phat"
            target="_blank"
            rel="noopener noreferrer"
          >
            Inky pHAT setup tutorial
          </a>
        </li>
        <li>
          <a
            href="https://github.com/End-S/inky_dash"
            target="_blank"
            rel="noopener noreferrer"
          >
            Inky Dash Repository
          </a>
        </li>
        <li>
          <a
            href="https://rrayns.co.uk"
            target="_blank"
            rel="noopener noreferrer"
          >
            Author&apos;s site
          </a>
        </li>
      </ul>
      <h3>Attribution</h3>
      <p>
        Octopus{" "}
        <a
          href="https://www.freepik.com/free-vector/sticker-template-with-octopus-cartoon-character-isolated_16448952.htm"
          target="_blank"
          rel="noopener noreferrer"
        >
          image by brgfx
        </a>{" "}
        on Freepik
      </p>
    </section>
  );
}
