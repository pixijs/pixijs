// description: This example demonstrates how to use a render group for efficient rendering of a large number of sprites
import { Application, Assets, Container, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    backgroundColor: 'brown',
    resizeTo: window,
  });

  const treeTexture = await Assets.load(`https://pixijs.com/assets/tree.png`);

  const worldContainer = new Container({
    // this will make moving this container GPU powered
    isRenderGroup: true,
  });

  const worldSize = 5000;

  for (let i = 0; i < 100000; i++) {
    const yPos = Math.random() * worldSize;

    const tree = new Sprite({
      texture: treeTexture,
      x: Math.random() * worldSize,
      y: yPos,
      scale: 0.25,
      anchor: 0.5,
    });

    worldContainer.addChild(tree);
  }

  // sort the trees by their y position
  worldContainer.children.sort((a, b) => a.position.y - b.position.y);

  app.stage.addChild(worldContainer);

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  let x = 0;
  let y = 0;

  app.canvas.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
  });

  app.ticker.add(() => {
    const screenWidth = app.renderer.width;
    const screenHeight = app.renderer.height;

    const targetX = (x / screenWidth) * (worldSize - screenWidth);
    const targetY = (y / screenHeight) * (worldSize - screenHeight);

    worldContainer.x += (-targetX - worldContainer.x) * 0.1;
    worldContainer.y += (-targetY - worldContainer.y) * 0.1;
  });
})();
