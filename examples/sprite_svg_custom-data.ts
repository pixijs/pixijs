// description: This example demonstrates loading a large SVG texture and displaying it as a sprite
import { Application, Assets, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ antialias: true, resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const tigerTexture = await Assets.load({
    src: 'https://pixijs.com/assets/tiger.svg',
    data: {
      resolution: 4,
    },
  });

  const sprite = new Sprite(tigerTexture);

  // line it up as this svg is not centered
  const bounds = sprite.getLocalBounds();

  sprite.pivot.set((bounds.x + bounds.width) / 2, (bounds.y + bounds.height) / 2);

  sprite.position.set(app.screen.width / 2, app.screen.height / 2);

  app.stage.addChild(sprite);

  app.ticker.add(() => {
    sprite.rotation += 0.01;
    sprite.scale.set(2 + Math.sin(sprite.rotation));
  });
})();
