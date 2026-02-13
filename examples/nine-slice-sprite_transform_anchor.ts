// description: This example demonstrates how to create and display a NineSliceSprite with a centered anchor point and rotation.
import { Application, Assets, NineSliceSprite } from 'pixi.js';

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

  bunny.width = app.screen.width / 2; // Set the width of the sprite
  bunny.height = app.screen.height / 2; // Set the height of the sprite

  app.stage.addChild(bunny);

  app.ticker.add(() => {
    bunny.rotation += 0.01; // Rotate the sprite over time from the center
  });
})();
