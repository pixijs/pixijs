// description: This example demonstrates the use of RenderLayer to manage the rendering order of UI elements in a scene with multiple sprites and filters using PixiJS.
import { Application, Assets, Container, DisplacementFilter, RenderLayer, Sprite, TilingSprite } from 'pixi.js';
import { Fish } from './Fish';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ width: 630, height: 410, antialias: true });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);
  // move the canvas to the center of the screen
  app.canvas.style.position = 'absolute';
  app.canvas.style.top = `${(window.innerHeight / 2) - (app.canvas.height / 2)}px`;
  app.canvas.style.left = `${(window.innerWidth / 2) - (app.canvas.width / 2)}px`;

  // Load textures
  await Assets.load([
    `https://pixijs.com/assets/pond/displacement_BG.jpg`,
    `https://pixijs.com/assets/pond/overlay.png`,
    `https://pixijs.com/assets/pond/displacement_map.png`,
    `https://pixijs.com/assets/pond/displacement_fish1.png`,
    `https://pixijs.com/assets/pond/displacement_fish2.png`,
  ]);

  const background = Sprite.from('https://pixijs.com/assets/pond/displacement_BG.jpg');

  const pondContainer = new Container();

  pondContainer.addChild(background);

  app.stage.addChild(pondContainer);

  const displacementMap = Assets.get('https://pixijs.com/assets/pond/displacement_map.png');

  displacementMap.source.wrapMode = 'repeat';

  const displacementSprite = Sprite.from(displacementMap);
  const displacementFilter = new DisplacementFilter(displacementSprite, 40);

  pondContainer.addChild(displacementSprite);
  pondContainer.filters = [displacementFilter];

  const uiLayer = new RenderLayer();

  const fishes = [];

  const names = ['Alice', 'Bob', 'Caroline', 'David', 'Ellie', 'Frank', 'Gloria', 'Henry', 'Isabel', 'Jack'];
  const textures = [
    Assets.get('https://pixijs.com/assets/pond/displacement_fish1.png'),
    Assets.get('https://pixijs.com/assets/pond/displacement_fish2.png'),
  ];

  for (let i = 0; i < 10; i++) {
    const fish = new Fish(names[i % names.length], textures[i % textures.length]);

    fishes.push(fish);
    pondContainer.addChild(fish);

    fish.x = Math.random() * 630;
    fish.y = Math.random() * 410;

    uiLayer.attach(fish.ui);
  }

  const waterOverlay = TilingSprite.from(Assets.get('https://pixijs.com/assets/pond/overlay.png'));

  waterOverlay.width = 630;
  waterOverlay.height = 410;

  pondContainer.addChild(waterOverlay);

  app.stage.addChild(uiLayer);

  // Animate the mask
  app.ticker.add(() => {
    waterOverlay.tilePosition.x += 0.5;
    waterOverlay.tilePosition.y += 0.5;

    displacementSprite.x += 0.5;
    displacementSprite.y += 0.5;

    fishes.forEach((fish) => fish.update());
  });
})();
