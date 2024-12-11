import Link from "next/link";

export default function Page() {
  return (
    <section className="text-slate-300 w-full max-w-prose">
      <h2>Inky Dash - v{process.env.npm_package_version}</h2>
      <p>
        Inky Dash is an interface for Pimoroni's line of Raspberry Pi ePaper displays.
      </p>
      <p>
        The following displays are supported:
      </p>
      <ul>
        <li><Link href="https://shop.pimoroni.com/products/inky-phat?variant=12549254217811" target="_blank"
                  rel="noopener noreferrer">Inky pHAT (212 x 104)</Link></li>
        <li><Link href="https://shop.pimoroni.com/products/inky-phat?variant=12549254217811" target="_blank"
                  rel="noopener noreferrer">Inky pHAT (250 x 122)</Link></li>
        <li><Link href="https://shop.pimoroni.com/products/inky-impression-4?variant=39599238807635" target="_blank"
                  rel="noopener noreferrer">Inky Impression 4"</Link></li>
        <li><Link href="https://shop.pimoroni.com/products/inky-impression-5-7?variant=32298701324371" target="_blank"
                  rel="noopener noreferrer">Inky Impression 5.7"</Link></li>
        <li><Link href="https://shop.pimoroni.com/products/inky-impression-7-3?variant=40512683376723" target="_blank"
                  rel="noopener noreferrer">Inky Impression 7.3"</Link></li>
      </ul>
      <h3>Links</h3>
      <ul>
        <li>
          <Link
            href="https://learn.pimoroni.com/tutorial/sandyj/getting-started-with-inky-phat"
            target="_blank"
            rel="noopener noreferrer"
          >
            Inky pHAT setup tutorial
          </Link>
        </li>
        <li>
          <Link
            href="https://github.com/End-S/inky_dash"
            target="_blank"
            rel="noopener noreferrer"
          >
            Inky Dash Repository
          </Link>
        </li>
        <li>
          <Link
            href="https://rrayns.co.uk"
            target="_blank"
            rel="noopener noreferrer"
          >
            Author&apos;s site
          </Link>
        </li>
      </ul>
      <h3>Attribution</h3>
      <p>
        Octopus{" "}
        <Link
          href="https://www.freepik.com/free-vector/sticker-template-with-octopus-cartoon-character-isolated_16448952.htm"
          target="_blank"
          rel="noopener noreferrer"
        >
          image by brgfx
        </Link>{" "}
        on Freepik
      </p>
    </section>
  );
}
