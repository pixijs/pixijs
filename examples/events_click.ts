// description: This example demonstrates how to handle click events on a sprite
import { Application, Assets, SCALE_MODES, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the bunny texture
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Set the texture's scale mode to nearest to preserve pixelation
  texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;

  // Create the bunny sprite
  const sprite = Sprite.from(texture);

  // Set the initial position
  sprite.anchor.set(0.5);
  sprite.x = app.screen.width / 2;
  sprite.y = app.screen.height / 2;

  // Opt-in to interactivity
  sprite.eventMode = 'static';

  // Shows hand cursor
  sprite.cursor = 'pointer';

  // Pointers normalize touch and mouse (good for mobile and desktop)
  sprite.on('pointerdown', onClick);

  // Alternatively, use the mouse & touch events:
  // sprite.on('click', onClick); // mouse-only
  // sprite.on('tap', onClick); // touch-only

  app.stage.addChild(sprite);

  function onClick() {
    sprite.scale.x *= 1.25;
    sprite.scale.y *= 1.25;
  }
})();
