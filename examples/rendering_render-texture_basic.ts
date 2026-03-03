// description: This example demonstrates how to create a basic render texture and render multiple sprites into it.
import { Application, Assets, Container, RenderTexture, SCALE_MODES, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const container = new Container();

  app.stage.addChild(container);

  // Load the bunny texture
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  for (let i = 0; i < 25; i++) {
    const bunny = new Sprite(texture);

    bunny.x = (i % 5) * 30;
    bunny.y = Math.floor(i / 5) * 30;
    bunny.rotation = Math.random() * (Math.PI * 2);
    container.addChild(bunny);
  }

  const rt = RenderTexture.create({
    width: 300,
    height: 300,
    scaleMode: SCALE_MODES.LINEAR,
    resolution: 1,
  });

  const sprite = new Sprite(rt);

  sprite.x = 450;
  sprite.y = 60;
  app.stage.addChild(sprite);

  /*
   * All the bunnies are added to the container with the addChild method
   * when you do this, all the bunnies become children of the container, and when a container moves,
   * so do all its children.
   * This gives you a lot of flexibility and makes it easier to position elements on the screen
   */
  container.x = 100;
  container.y = 60;

  app.ticker.add(() => {
    app.renderer.render(container, { renderTexture: rt });
  });
})();
