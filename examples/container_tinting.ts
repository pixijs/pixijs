// description: This example demonstrates how to apply tinting to sprites
import { Application, Assets, Rectangle, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the alien texture
  const texture = await Assets.load('https://pixijs.com/assets/eggHead.png');

  // Create an array to store the aliens
  const aliens = [];

  const totalDudes = 20;

  for (let i = 0; i < totalDudes; i++) {
    // Create a new alien Sprite
    const dude: any = new Sprite(texture);

    // Set the anchor point so the texture is centered on the sprite
    dude.anchor.set(0.5);

    // Set a random scale for the dude - no point them all being the same size!
    dude.scale.set(0.8 + (Math.random() * 0.3));

    // Finally lets set the dude to be at a random position..
    dude.x = Math.random() * app.screen.width;
    dude.y = Math.random() * app.screen.height;

    dude.tint = Math.random() * 0xffffff;

    // Create some extra properties that will control movement: ---------------------

    // Create a random direction in radians.
    // This is a number between 0 and PI*2 which is the equivalent of 0 - 360 degrees
    dude.direction = Math.random() * Math.PI * 2;

    // This number will be used to modify the direction of the dude over time
    dude.turningSpeed = Math.random() - 0.8;

    // Create a random speed for the dude between 2 - 4
    dude.speed = 2 + (Math.random() * 2);

    // Finally we push the dude into the aliens array so it it can be easily accessed later
    aliens.push(dude);

    app.stage.addChild(dude);
  }

  // Create a bounding box for the little dudes
  const dudeBoundsPadding = 100;
  const dudeBounds = new Rectangle(
    -dudeBoundsPadding,
    -dudeBoundsPadding,
    app.screen.width + (dudeBoundsPadding * 2),
    app.screen.height + (dudeBoundsPadding * 2),
  );

  app.ticker.add(() => {
    // Iterate through the dudes and update their position
    for (let i = 0; i < aliens.length; i++) {
      const dude = aliens[i];

      dude.direction += dude.turningSpeed * 0.01;
      dude.x += Math.sin(dude.direction) * dude.speed;
      dude.y += Math.cos(dude.direction) * dude.speed;
      dude.rotation = -dude.direction - (Math.PI / 2);

      // Constrain the dudes' position by testing their bounds...
      if (dude.x < dudeBounds.x) {
        dude.x += dudeBounds.width;
      } else if (dude.x > dudeBounds.x + dudeBounds.width) {
        dude.x -= dudeBounds.width;
      }

      if (dude.y < dudeBounds.y) {
        dude.y += dudeBounds.height;
      } else if (dude.y > dudeBounds.y + dudeBounds.height) {
        dude.y -= dudeBounds.height;
      }
    }
  });
})();
