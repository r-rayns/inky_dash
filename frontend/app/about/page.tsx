import Link from "next/link";

export default function Page() {
  return (
    <section className="text-slate-300 w-full max-w-prose">
      <h2>Inky Dash - v{process.env.npm_package_version}</h2>
      <p>
        Inky Dash is an interface for the Raspberry Pi e-paper display, Inky
        pHAT. It does not support the original Inky pHAT (v1) devices as it uses
        the latest Inky python library.
      </p>
      <p>
        Uploaded images must conform with the confines of the Inky pHAT display:
      </p>
      <ul>
        <li>Dimensions are 212 x 104 pixels.</li>
        <li>
          Colour{" "}
          <Link
            href="https://github.com/pimoroni/inky/blob/master/tools/inky-palette.gpl"
            target="_blank"
            rel="noopener noreferrer"
          >
            palette
          </Link>{" "}
          is white, black and (red or yellow) in that order.
        </li>
        <li>File format is PNG.</li>
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
