import React from 'react';
import Card from '../../components/card-layout/card/card';
import CardLayout from '../../components/card-layout/card-layout';

export default function AboutPage() {
  return (
    <CardLayout>
      <Card>
        <h2>Inky Dash v{ process.env.REACT_APP_VERSION }</h2>
        <p>Inky Dash is an interface for the Raspberry Pi e-paper display, Inky pHAT.</p>
        <p>Uploaded images must conform with the confines of the Inky pHAT display:
          <ul>
            <li>Dimensions are 212 x 104 pixels.</li>
            <li>
              Colour <a href="https://github.com/pimoroni/inky/blob/master/tools/inky-palette.gpl"
                        target="_blank"
                        rel="noopener noreferrer">
              palette</a> is white, black and (red or yellow) in that order.
            </li>
            <li>File format is PNG.</li>
          </ul>
        </p>
      </Card>
      <Card>
        <h3>Links</h3>
        <ul>
          <li>
            <a href="https://learn.pimoroni.com/tutorial/sandyj/getting-started-with-inky-phat"
               target="_blank"
               rel="noopener noreferrer">
              Inky pHAT setup tutorial</a>
          </li>
          <li>
            <a href="https://github.com/End-S/inky_dash"
               target="_blank"
               rel="noopener noreferrer">
              Inky Dash GitHub</a>
          </li>
          <li>
            <a href="https://rrayns.co.uk"
               target="_blank"
               rel="noopener noreferrer">
              Author's site</a>
          </li>
        </ul>
      </Card>
    </CardLayout>
  )
}
