// description: This example demonstrates how to create and display animated sprites using PixiJS.
import { AnimatedSprite, Application, Assets, Texture } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ autoStart: false, resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the animation sprite sheet
  await Assets.load('https://pixijs.com/assets/spritesheet/mc.json');

  // Create an array to store the textures
  const explosionTextures = [];
  let i;

  for (i = 0; i < 26; i++) {
    const texture = Texture.from(`Explosion_Sequence_A ${i + 1}.png`);

    explosionTextures.push(texture);
  }

  // Create and randomly place the animated explosion sprites on the stage
  for (i = 0; i < 50; i++) {
    // Create an explosion AnimatedSprite
    const explosion = new AnimatedSprite(explosionTextures);

    explosion.x = Math.random() * app.screen.width;
    explosion.y = Math.random() * app.screen.height;
    explosion.anchor.set(0.5);
    explosion.rotation = Math.random() * Math.PI;
    explosion.scale.set(0.75 + (Math.random() * 0.5));
    explosion.gotoAndPlay((Math.random() * 26) | 0);
    app.stage.addChild(explosion);
  }

  // Start animating
  app.start();
})();
