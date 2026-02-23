// description: This example shows how to use a sprite as a mask.
import { Application, Assets, Point, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load textures
  await Assets.load([
    'https://pixijs.com/assets/bg_plane.jpg',
    'https://pixijs.com/assets/cells.png',
    'https://pixijs.com/assets/flowerTop.png',
  ]);

  app.stage.eventMode = 'static';

  const bg = Sprite.from('https://pixijs.com/assets/bg_plane.jpg');

  app.stage.addChild(bg);

  const cells = Sprite.from('https://pixijs.com/assets/cells.png');

  cells.scale.set(1.5);

  const mask = Sprite.from('https://pixijs.com/assets/flowerTop.png');

  mask.anchor.set(0.5);
  mask.x = 310;
  mask.y = 190;

  cells.mask = mask;

  app.stage.addChild(mask, cells);

  const target = new Point();

  reset();

  function reset() {
    target.x = Math.floor(Math.random() * 550);
    target.y = Math.floor(Math.random() * 300);
  }

  // Animate the mask
  app.ticker.add(() => {
    mask.x += (target.x - mask.x) * 0.1;
    mask.y += (target.y - mask.y) * 0.1;

    if (Math.abs(mask.x - target.x) < 1) {
      reset();
    }
  });
})();
