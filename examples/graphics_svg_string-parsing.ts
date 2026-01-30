// description: This example demonstrates how to create and display SVG graphics using the Graphics class
import { Application, Graphics } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    antialias: true,
    backgroundColor: 'white',
    resizeTo: window,
  });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const graphics = new Graphics().svg(`
            <svg height="400" width="450" xmlns="http://www.w3.org/2000/svg">
                <!-- Draw the paths -->
                <path id="lineAB" d="M 100 350 l 150 -300" stroke="red" stroke-width="4"/>
                <path id="lineBC" d="M 250 50 l 150 300" stroke="red" stroke-width="4"/>
                <path id="lineMID" d="M 175 200 l 150 0" stroke="green" stroke-width="4"/>
                <path id="lineAC" d="M 100 350 q 150 -300 300 0" stroke="blue" fill="none" stroke-width="4"/>

                <!-- Mark relevant points -->
                <g stroke="black" stroke-width="3" fill="black">
                    <circle id="pointA" cx="100" cy="350" r="4" />
                    <circle id="pointB" cx="250" cy="50" r="4" />
                    <circle id="pointC" cx="400" cy="350" r="4" />
                </g>
            </svg>
        `);

  app.stage.addChild(graphics);
})();
