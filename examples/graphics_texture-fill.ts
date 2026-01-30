// description: This example demonstrates how to use textures within shapes using the Graphics and GraphicsContext classes
import { Application, Assets, Graphics, GraphicsContext } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    antialias: true,
    backgroundColor: 'white',
    resizeTo: window,
  });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const pandaTexture = await Assets.load(`https://pixijs.com/assets/panda.png`);

  const pandasContext = new GraphicsContext()
    .circle(0, 0, 120)
    .fill('green')
    .texture(pandaTexture, 0xffffff, -pandaTexture.width / 2, -pandaTexture.height / 2)
    // add a baby purple panda
    .translate(100, 100)
    .scale(0.4)
    .texture(pandaTexture, 'yellow');

  const graphics = new Graphics(pandasContext);

  const graphics2 = new Graphics(pandasContext);

  app.stage.addChild(graphics, graphics2);

  graphics.x = app.screen.width / 2;
  graphics.y = app.screen.height / 2;

  graphics2.x = (app.screen.width / 2) - 200;
  graphics2.y = (app.screen.height / 2) - 200;
  graphics2.rotation = 0.5;
})();
