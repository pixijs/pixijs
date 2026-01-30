// description: This example demonstrates how to create and animate a tiling sprite using PixiJS.
import { Application, Assets, TilingSprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the tile texture
  const texture = await Assets.load('https://pixijs.com/assets/p2.jpeg');

  /* Create a tiling sprite and add it to the stage...
   * requires a texture, a width and a height
   * in WebGL the image size should preferably be a power of two
   */
  const tilingSprite = new TilingSprite({
    texture,
    width: app.screen.width,
    height: app.screen.height,
  });

  app.stage.addChild(tilingSprite);

  let count = 0;

  // Animate the tiling sprite
  app.ticker.add(() => {
    count += 0.005;

    tilingSprite.tileScale.x = 2 + Math.sin(count);
    tilingSprite.tileScale.y = 2 + Math.cos(count);

    tilingSprite.tilePosition.x += 1;
    tilingSprite.tilePosition.y += 1;
  });
})();
