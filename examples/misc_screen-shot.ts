// description: Take a screenshot of the rotating bunnies and download it
import { Application, Assets, Container, Sprite, Text, TextStyle } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#111', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Create and add a container to the stage
  const container = new Container();

  const containerFrame = new Container();

  containerFrame.addChild(container);

  app.stage.addChild(containerFrame);

  // Load the bunny texture
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Create a 5x5 grid of bunnies in the container
  for (let i = 0; i < 25; i++) {
    const bunny = new Sprite(texture);

    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
  }

  // Move the container to the center
  containerFrame.x = app.screen.width / 2;
  containerFrame.y = app.screen.height / 2;

  // Center the bunny sprites in local container coordinates
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;

  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    // * use delta to create frame-independent transform *
    container.rotation -= 0.01 * time.deltaTime;
  });

  let screenshot;

  // Take the screenshot and download it
  async function takeScreenshot() {
    if (screenshot !== undefined) {
      screenshot.remove();
    }

    app.stop();
    const url = await app.renderer.extract.base64(containerFrame);

    screenshot = document.createElement('a');

    document.body.append(screenshot);

    screenshot.style.position = 'fixed';
    screenshot.style.top = '20px';
    screenshot.style.right = '20px';
    screenshot.download = 'screenshot';
    screenshot.href = url;

    const image = new Image();

    image.width = app.screen.width / 5;
    image.src = url;

    screenshot.innerHTML = image.outerHTML;

    app.start();
  }

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerdown', takeScreenshot);

  const style = new TextStyle({
    fontFamily: 'Roboto',
    fill: '#999',
  });

  const screenshotText = new Text({ text: 'Click To Take Screenshot', style });

  screenshotText.x = Math.round((app.screen.width - screenshotText.width) / 2);
  screenshotText.y = Math.round(screenshotText.height / 2);

  app.stage.addChild(screenshotText);
})();
