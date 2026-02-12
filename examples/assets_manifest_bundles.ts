// description: This example demonstrates how to use asset bundles with PixiJS to manage and load groups of assets
import { Application, Assets, Sprite } from 'pixi.js';

// Create a new application
const app = new Application();

async function init() {
  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Manifest example
  const manifestExample = {
    bundles: [
      {
        name: 'load-screen',
        assets: [
          {
            alias: 'flowerTop',
            src: 'https://pixijs.com/assets/flowerTop.png',
          },
        ],
      },
      {
        name: 'game-screen',
        assets: [
          {
            alias: 'eggHead',
            src: 'https://pixijs.com/assets/eggHead.png',
          },
        ],
      },
    ],
  };

  await Assets.init({ manifest: manifestExample });

  // Bundles can be loaded in the background too!
  Assets.backgroundLoadBundle(['load-screen', 'game-screen']);

  makeLoadScreen();
}

async function makeLoadScreen() {
  // Get the assets from the load screen bundle.
  // If the bundle was already downloaded the promise resolves instantly!
  const loadScreenAssets = await Assets.loadBundle('load-screen');

  // Create a new Sprite from the resolved loaded texture
  const goNext = new Sprite(loadScreenAssets.flowerTop);

  goNext.anchor.set(0.5);
  goNext.x = app.screen.width / 2;
  goNext.y = app.screen.height / 2;
  app.stage.addChild(goNext);

  goNext.eventMode = 'static';
  goNext.cursor = 'pointer';

  goNext.on('pointertap', async () => {
    goNext.destroy();
    makeGameScreen();
  });
}

async function makeGameScreen() {
  // Wait here until you get the assets
  // If the user spends enough time in the load screen by the time they reach the game screen
  // the assets are completely loaded and the promise resolves instantly!
  const loadScreenAssets = await Assets.loadBundle('game-screen');

  // Create a new Sprite from the resolved loaded texture
  const goBack = new Sprite(loadScreenAssets.eggHead);

  goBack.anchor.set(0.5);
  goBack.x = app.screen.width / 2;
  goBack.y = app.screen.height / 2;
  app.stage.addChild(goBack);

  goBack.eventMode = 'static';
  goBack.cursor = 'pointer';

  goBack.on('pointertap', async () => {
    goBack.destroy();
    // The user can go back and the files are already downloaded
    makeLoadScreen();
  });
}

init();
