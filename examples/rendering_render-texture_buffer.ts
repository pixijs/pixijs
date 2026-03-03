// description: This example shows how to create an advanced render texture setup where the scene is rendered into itself with some transformations.
import { Application, Assets, Container, RenderTexture, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const stageSize = {
    width: app.screen.width,
    height: app.screen.height,
  };

  // Create two render textures... these dynamic textures will be used to draw the scene into itself
  let renderTexture = RenderTexture.create(stageSize);
  let renderTexture2 = RenderTexture.create(stageSize);
  const currentTexture = renderTexture;

  // Create a new sprite that uses the render texture we created above
  const outputSprite = new Sprite(currentTexture);

  // Align the sprite
  outputSprite.x = 400;
  outputSprite.y = 300;
  outputSprite.anchor.set(0.5);

  // Add to stage
  app.stage.addChild(outputSprite);

  const stuffContainer = new Container();

  stuffContainer.x = 400;
  stuffContainer.y = 300;

  app.stage.addChild(stuffContainer);

  // Create an array of image ids..
  const fruits = [
    'https://pixijs.com/assets/rt_object_01.png',
    'https://pixijs.com/assets/rt_object_02.png',
    'https://pixijs.com/assets/rt_object_03.png',
    'https://pixijs.com/assets/rt_object_04.png',
    'https://pixijs.com/assets/rt_object_05.png',
    'https://pixijs.com/assets/rt_object_06.png',
    'https://pixijs.com/assets/rt_object_07.png',
    'https://pixijs.com/assets/rt_object_08.png',
  ];

  // Load the textures
  await Assets.load(fruits);

  // Create an array of items
  const items = [];

  // Now create some items and randomly position them in the stuff container
  for (let i = 0; i < 20; i++) {
    const item = Sprite.from(fruits[i % fruits.length]);

    item.x = (Math.random() * 400) - 200;
    item.y = (Math.random() * 400) - 200;
    item.anchor.set(0.5);
    stuffContainer.addChild(item);
    items.push(item);
  }

  // Used for spinning!
  let count = 0;

  app.ticker.add(() => {
    for (let i = 0; i < items.length; i++) {
      // rotate each item
      const item = items[i];

      item.rotation += 0.1;
    }

    count += 0.01;

    // Swap the buffers ...
    const temp = renderTexture;

    renderTexture = renderTexture2;
    renderTexture2 = temp;

    // Set the new texture
    outputSprite.texture = renderTexture;

    // Twist this up!
    stuffContainer.rotation -= 0.01;
    outputSprite.scale.set(1 + (Math.sin(count) * 0.2));

    // Render the stage to the texture
    // * The 'true' clears the texture before the content is rendered *
    app.renderer.render({
      container: app.stage,
      target: renderTexture2,
      clear: false,
    });
  });
})();
