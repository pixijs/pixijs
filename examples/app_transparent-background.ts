// description: This example demonstrates how to create a PixiJS application with a transparent background
import { Application, Assets, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application with a transparent background
  await app.init({ backgroundAlpha: 0, resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the bunny texture
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Create a new Sprite with the texture
  const bunny = new Sprite(texture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.x = app.screen.width / 2;
  bunny.y = app.screen.height / 2;

  app.stage.addChild(bunny);

  // Listen for animate update
  app.ticker.add(() => {
    // Just for fun, let's rotate our bunny over time!
    bunny.rotation += 0.1;
  });
})();
