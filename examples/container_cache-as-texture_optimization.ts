// description: This example demonstrates how to use cacheAsTexture to optimize rendering performance
import { Application, Assets, Container, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // load resources
  await Assets.load('https://pixijs.com/assets/spritesheet/monsters.json');

  // holder to store aliens
  const aliens = [];
  const alienFrames = ['eggHead.png', 'flowerTop.png', 'helmlok.png', 'skully.png'];

  let count = 0;

  // create an empty container
  const alienContainer = new Container();

  alienContainer.x = app.screen.width / 2;
  alienContainer.y = app.screen.height / 2;

  // make the stage interactive
  app.stage.eventMode = 'static';
  app.stage.addChild(alienContainer);

  // add a bunch of aliens with textures from image paths
  for (let i = 0; i < 100; i++) {
    const frameName = alienFrames[i % 4];

    // create an alien using the frame name..
    const alien = Sprite.from(frameName);

    alien.tint = Math.random() * 0xffffff;

    alien.x = (Math.random() * app.screen.width) - (app.screen.width / 2);
    alien.y = (Math.random() * app.screen.height) - (app.screen.height / 2);
    alien.anchor.x = 0.5;
    alien.anchor.y = 0.5;
    aliens.push(alien);
    alienContainer.addChild(alien);
  }

  // Combines both mouse click + touch tap
  app.stage.on('pointertap', onClick);

  function onClick() {
    alienContainer.cacheAsTexture(!alienContainer.isCachedAsTexture);
  }

  app.ticker.add(() => {
    // let's rotate the aliens a little bit
    for (let i = 0; i < 100; i++) {
      const alien = aliens[i];

      alien.rotation += 0.1;
    }

    count += 0.01;

    alienContainer.scale.x = Math.sin(count);
    alienContainer.scale.y = Math.sin(count);
    alienContainer.rotation += 0.01;
  });
})();
