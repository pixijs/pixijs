// description: This example demonstrates the use of BlurFilter to create dynamic blur effects on sprites
import { Application, Assets, BlurFilter, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the textures
  await Assets.load([
    'https://pixijs.com/assets/pixi-filters/bg_depth_blur.jpg',
    'https://pixijs.com/assets/pixi-filters/depth_blur_dudes.jpg',
    'https://pixijs.com/assets/pixi-filters/depth_blur_moby.jpg',
  ]);

  const bg = Sprite.from('https://pixijs.com/assets/pixi-filters/bg_depth_blur.jpg');

  bg.width = app.screen.width;
  bg.height = app.screen.height;
  app.stage.addChild(bg);

  const littleDudes = Sprite.from('https://pixijs.com/assets/pixi-filters/depth_blur_dudes.jpg');

  littleDudes.x = (app.screen.width / 2) - 315;
  littleDudes.y = 200;
  app.stage.addChild(littleDudes);

  const littleRobot = Sprite.from('https://pixijs.com/assets/pixi-filters/depth_blur_moby.jpg');

  littleRobot.x = (app.screen.width / 2) - 200;
  littleRobot.y = 100;
  app.stage.addChild(littleRobot);

  // Create the blur filters
  const blurFilter1 = new BlurFilter();
  const blurFilter2 = new BlurFilter();

  // Apply the filters to the sprites
  littleDudes.filters = [blurFilter1];
  littleRobot.filters = [blurFilter2];

  let count = 0;

  // Animate the blur filters
  app.ticker.add(() => {
    count += 0.005;

    const blurAmount = Math.cos(count);
    const blurAmount2 = Math.sin(count);

    blurFilter1.blur = 20 * blurAmount;
    blurFilter2.blur = 20 * blurAmount2;
  });
})();
