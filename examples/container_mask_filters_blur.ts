// description: This example demonstrates how to create a spotlight effect using a blurred circular mask that follows the mouse pointer, revealing a grass background using PixiJS
import { Application, Assets, BlurFilter, Graphics, Rectangle, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Inner radius of the circle
  const radius = 100;

  // The blur amount
  const blurSize = 32;

  // Load the grass texture
  const grassTexture = await Assets.load('https://pixijs.com/assets/bg_grass.jpg');

  // Create the grass background
  const background = new Sprite(grassTexture);

  app.stage.addChild(background);
  background.width = app.screen.width;
  background.height = app.screen.height;

  const circle = new Graphics().circle(radius + blurSize, radius + blurSize, radius).fill({ color: 0xff0000 });

  circle.filters = [new BlurFilter(blurSize)];

  const bounds = new Rectangle(0, 0, (radius + blurSize) * 2, (radius + blurSize) * 2);
  const texture = app.renderer.generateTexture({
    target: circle,
    resolution: 1,
    frame: bounds,
  });
  const focus = new Sprite(texture);

  app.stage.addChild(focus);

  background.mask = focus;

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    focus.position.x = event.global.x - (focus.width / 2);
    focus.position.y = event.global.y - (focus.height / 2);
  });
})();
