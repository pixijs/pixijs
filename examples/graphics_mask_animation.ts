// description: This example demonstrates how to use Graphics as a mask in a PixiJS application
import { Application, Assets, Container, Graphics, Sprite, Text } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ antialias: true, resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  app.stage.eventMode = 'static';

  // Load textures
  await Assets.load([
    'https://pixijs.com/assets/bg_rotate.jpg',
    'https://pixijs.com/assets/bg_scene_rotate.jpg',
    'https://pixijs.com/assets/light_rotate_2.png',
    'https://pixijs.com/assets/light_rotate_1.png',
    'https://pixijs.com/assets/panda.png',
  ]);

  const bg = Sprite.from('https://pixijs.com/assets/bg_rotate.jpg');

  bg.anchor.set(0.5);

  bg.x = app.screen.width / 2;
  bg.y = app.screen.height / 2;

  app.stage.addChild(bg);

  const container = new Container();

  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // Add a bunch of sprites
  const bgFront = Sprite.from('https://pixijs.com/assets/bg_scene_rotate.jpg');

  bgFront.anchor.set(0.5);

  const light2 = Sprite.from('https://pixijs.com/assets/light_rotate_2.png');

  light2.anchor.set(0.5);

  const light1 = Sprite.from('https://pixijs.com/assets/light_rotate_1.png');

  light1.anchor.set(0.5);

  const panda = Sprite.from('https://pixijs.com/assets/panda.png');

  panda.anchor.set(0.5);

  container.addChild(bgFront, light2, light1, panda);

  app.stage.addChild(container);

  // Let's create a moving shape mask
  const thing = new Graphics();

  app.stage.addChild(thing);
  thing.x = app.screen.width / 2;
  thing.y = app.screen.height / 2;

  container.mask = thing;

  let count = 0;

  app.stage.on('pointertap', () => {
    if (!container.mask) {
      container.mask = thing;
    } else {
      container.mask = null;
    }
  });

  const help = new Text({
    text: 'Click or tap to turn masking on / off.',
    style: {
      fontFamily: 'Arial',
      fontSize: 12,
      fontWeight: 'bold',
      fill: 'white',
    },
  });

  help.y = app.screen.height - 26;
  help.x = 10;
  app.stage.addChild(help);

  // Animate the mask
  app.ticker.add(() => {
    bg.rotation += 0.01;
    bgFront.rotation -= 0.01;

    light1.rotation += 0.02;
    light2.rotation += 0.01;

    panda.scale.x = 1 + (Math.sin(count) * 0.04);
    panda.scale.y = 1 + (Math.cos(count) * 0.04);

    count += 0.1;

    thing.clear();
    thing.moveTo(-120 + (Math.sin(count) * 20), -100 + (Math.cos(count) * 20));
    thing.lineTo(120 + (Math.cos(count) * 20), -100 + (Math.sin(count) * 20));
    thing.lineTo(120 + (Math.sin(count) * 20), 100 + (Math.cos(count) * 20));
    thing.lineTo(-120 + (Math.cos(count) * 20), 100 + (Math.sin(count) * 20));
    thing.fill({ color: 0x8bc5ff, alpha: 0.4 });
    thing.rotation = count * 0.1;
  });
})();
