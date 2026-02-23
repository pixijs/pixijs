// description: This example demonstrates how to create and display animated sprites with different animation speeds using PixiJS.
import { AnimatedSprite, Application, Assets, Texture } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ autoStart: false, resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the animation sprite sheet
  const spritesheet = await Assets.load('https://pixijs.com/assets/spritesheet/0123456789.json');

  // Create an array to store the textures
  const textures = [];
  let i;

  for (i = 0; i < 10; i++) {
    const framekey = `0123456789 ${i}.ase`;
    const texture = Texture.from(framekey);
    const time = spritesheet.data.frames[framekey].duration;

    textures.push({ texture, time });
  }

  const scaling = 4;

  // Create a slow AnimatedSprite
  const slow = new AnimatedSprite(textures);

  slow.anchor.set(0.5);
  slow.scale.set(scaling);
  slow.animationSpeed = 0.5;
  slow.x = (app.screen.width - slow.width) / 2;
  slow.y = app.screen.height / 2;
  slow.play();
  app.stage.addChild(slow);

  // Create a fast AnimatedSprite
  const fast = new AnimatedSprite(textures);

  fast.anchor.set(0.5);
  fast.scale.set(scaling);
  fast.x = (app.screen.width + fast.width) / 2;
  fast.y = app.screen.height / 2;
  fast.play();
  app.stage.addChild(fast);

  // Start animating
  app.start();
})();
