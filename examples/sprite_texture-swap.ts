// description: This example demonstrates how to create and display a basic sprite and swap its texture on click using PixiJS.
import { Application, Assets, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the textures
  const alien1texture = await Assets.load('https://pixijs.com/assets/flowerTop.png');
  const alien2texture = await Assets.load('https://pixijs.com/assets/eggHead.png');

  let isAlien1 = true;

  // Create a new alien Sprite using the 1st texture and add it to the stage
  const character = new Sprite(alien1texture);

  // Center the sprites anchor point
  character.anchor.set(0.5);

  // Move the sprite to the center of the screen
  character.x = app.screen.width / 2;
  character.y = app.screen.height / 2;

  app.stage.addChild(character);

  // Make the sprite interactive
  character.eventMode = 'static';
  character.cursor = 'pointer';

  character.on('pointertap', () => {
    isAlien1 = !isAlien1;
    // Dynamically swap the texture
    character.texture = isAlien1 ? alien1texture : alien2texture;
  });

  app.ticker.add(() => {
    character.rotation += 0.02;
  });
})();
