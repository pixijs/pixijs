// description: This example demonstrates how to use async/await with PixiJS to load assets
import { Application, Assets, Sprite } from 'pixi.js';

// Await can only be used inside an async function
async function init() {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Create a new Sprite from the awaited loaded Texture
  const bunny = Sprite.from(texture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.x = app.screen.width / 2;
  bunny.y = app.screen.height / 2;

  app.stage.addChild(bunny);
}

// Call that async function
init();
