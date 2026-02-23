// description: This example demonstrates how to create and display a resizable NineSliceSprite, maintaining the integrity of its corners and edges while stretching the center.
import { Application, Assets, NineSliceSprite, Text } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the bunny texture
  const texture = await Assets.load('https://pixijs.com/assets/nine-slice/panel-031.png');

  // Create a NineSliceSprite
  const bunny = new NineSliceSprite({
    texture,
    leftWidth: 30, // Width of the left edge
    rightWidth: 30, // Width of the right edge
    topHeight: 30, // Height of the top edge
    bottomHeight: 30, // Height of the bottom edge

    anchor: 0.5, // Center the sprite's anchor point

    x: app.screen.width / 2, // Move the sprite to the center of the screen
    y: app.screen.height / 2,
  });

  bunny.width = 500; // Set the width of the sprite
  bunny.height = 300; // Set the height of the sprite

  app.stage.addChild(bunny);

  // Listen for animate update
  let counter = 0;

  app.ticker.add(() => {
    counter++;
    bunny.width = 500 + (Math.sin(counter / 20) * 100); // Change width over time
    bunny.height = 300 + (Math.cos(counter / 20) * 50); // Change height over time
  });

  // Add some explanation text
  const text = new Text({
    text: 'As you resize the NineSliceSprite, the edges and corners will remain intact, while the center stretches.',
    style: {
      fontSize: 24,
      fill: '#ffffff',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: app.screen.width - 300, // Wrap text within the screen width
    },
  });

  text.anchor.set(0.5);
  text.x = app.screen.width / 2;
  text.y = app.screen.height - 50;
  app.stage.addChild(text);
})();
