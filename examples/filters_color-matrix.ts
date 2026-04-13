// description: This example demonstrates the use of ColorMatrixFilter to create dynamic color effects on a container of sprites
import { Application, Assets, ColorMatrixFilter, Container, Sprite, Text } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the textures
  await Assets.load([
    'https://pixijs.com/assets/bg_rotate.jpg',
    'https://pixijs.com/assets/bg_scene_rotate.jpg',
    'https://pixijs.com/assets/light_rotate_2.png',
    'https://pixijs.com/assets/light_rotate_1.png',
    'https://pixijs.com/assets/panda.png',
  ]);

  app.stage.eventMode = 'static';

  const bg = Sprite.from('https://pixijs.com/assets/bg_rotate.jpg');

  bg.anchor.set(0.5);

  bg.x = app.screen.width / 2;
  bg.y = app.screen.height / 2;

  const container = new Container();

  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  const bgFront = Sprite.from('https://pixijs.com/assets/bg_scene_rotate.jpg');

  bgFront.anchor.set(0.5);

  container.addChild(bgFront);

  const light2 = Sprite.from('https://pixijs.com/assets/light_rotate_2.png');

  light2.anchor.set(0.5);
  container.addChild(light2);

  const light1 = Sprite.from('https://pixijs.com/assets/light_rotate_1.png');

  light1.anchor.set(0.5);
  container.addChild(light1);

  const panda = Sprite.from('https://pixijs.com/assets/panda.png');

  panda.anchor.set(0.5);

  container.addChild(panda);

  app.stage.addChild(container);

  // Create a color matrix filter
  const filter = new ColorMatrixFilter();

  // Apply the Filter
  container.filters = [filter];

  let count = 0;
  let enabled = true;

  app.stage.on('pointertap', () => {
    enabled = !enabled;
    container.filters = enabled ? [filter] : null;
  });

  const help = new Text({
    text: 'Click or tap to turn filters on / off.',
    style: {
      fontFamily: 'Arial',
      fontSize: 12,
      fontWeight: 'bold',
      fill: 'white',
    },
  });

  help.y = app.screen.height - 25;
  help.x = 10;

  app.stage.addChild(help);

  app.ticker.add(() => {
    bg.rotation += 0.01;
    bgFront.rotation -= 0.01;
    light1.rotation += 0.02;
    light2.rotation += 0.01;

    panda.scale.x = 1 + (Math.sin(count) * 0.04);
    panda.scale.y = 1 + (Math.cos(count) * 0.04);

    count += 0.1;

    // Animate the filter
    const { matrix } = filter;

    matrix[1] = Math.sin(count) * 3;
    matrix[2] = Math.cos(count);
    matrix[3] = Math.cos(count) * 1.5;
    matrix[4] = Math.sin(count / 3) * 2;
    matrix[5] = Math.sin(count / 2);
    matrix[6] = Math.sin(count / 4);
  });
})();
