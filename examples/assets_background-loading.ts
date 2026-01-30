// description: This example demonstrates how to load assets in the background using PixiJS's Assets module
import { Application, Assets, Sprite } from 'pixi.js';

// Create a new application
const app = new Application();

// Initialize the application
app.init({ background: '#1099bb', resizeTo: window }).then(() => {
  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Add the assets to load
  Assets.add({ alias: 'flowerTop', src: 'https://pixijs.com/assets/flowerTop.png' });
  Assets.add({ alias: 'eggHead', src: 'https://pixijs.com/assets/eggHead.png' });

  // Allow the assets to load in the background
  Assets.backgroundLoad(['flowerTop', 'eggHead']);

  // If the background load hasn't loaded this asset yet, calling load forces this asset to load now.
  Assets.load('eggHead').then((texture) => {
    // Auxiliar flag for toggling the texture
    let isEggHead = true;

    // Create a new Sprite from the resolved loaded texture
    const character = new Sprite(texture);

    character.anchor.set(0.5);
    character.x = app.screen.width / 2;
    character.y = app.screen.height / 2;
    character.eventMode = 'static';
    character.cursor = 'pointer';

    app.stage.addChild(character);

    character.on('pointertap', async () => {
      isEggHead = !isEggHead;
      // These promise are already resolved in the cache.
      character.texture = await Assets.load(isEggHead ? 'eggHead' : 'flowerTop');
    });
  });
});
