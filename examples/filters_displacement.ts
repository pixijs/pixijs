// description: This example demonstrates the use of DisplacementFilter with a repeating texture to create a waving flag effect
import { Application, Assets, Container, DisplacementFilter, Sprite, WRAP_MODES } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the textures
  await Assets.load([
    'https://pixijs.com/assets/pixi-filters/flag.png',
    'https://pixijs.com/assets/pixi-filters/displacement_map_repeat.jpg',
  ]);

  app.stage.eventMode = 'static';

  const container = new Container();

  app.stage.addChild(container);

  const flag = Sprite.from('https://pixijs.com/assets/pixi-filters/flag.png');

  container.addChild(flag);
  flag.x = 100;
  flag.y = 100;

  const displacementSprite = Sprite.from('https://pixijs.com/assets/pixi-filters/displacement_map_repeat.jpg');

  // Make sure the sprite is wrapping.
  displacementSprite.texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;

  // Create a displacement filter
  const displacementFilter = new DisplacementFilter({ sprite: displacementSprite, scale: { x: 60, y: 120 } });

  displacementFilter.padding = 10;

  displacementSprite.position = flag.position;

  app.stage.addChild(displacementSprite);

  // Apply the filter
  flag.filters = [displacementFilter];

  app.ticker.add(() => {
    // Offset the sprite position to make vFilterCoord update to larger value.
    // Repeat wrapping makes sure there's still pixels on the coordinates.
    displacementSprite.x++;
    // Reset x to 0 when it's over width to keep values from going to very huge numbers.
    if (displacementSprite.x > displacementSprite.width) {
      displacementSprite.x = 0;
    }
  });
})();
