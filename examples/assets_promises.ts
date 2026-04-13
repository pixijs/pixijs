// description: This example demonstrates how to load assets using Promises with PixiJS
import { Application, Assets, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Start loading right away and create a promise
  const texturePromise = Assets.load('https://pixijs.com/assets/bunny.png');

  // When the promise resolves, we have the texture!
  texturePromise.then((resolvedTexture) => {
    // create a new Sprite from the resolved loaded Texture
    const bunny = Sprite.from(resolvedTexture);

    // center the sprite's anchor point
    bunny.anchor.set(0.5);

    // move the sprite to the center of the screen
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny);
  });
})();
