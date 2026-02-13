import { Application, Assets, Container, Sprite } from 'pixi.js';

(async () => {
  // Create the application helper and add its render target to the page
  const app = new Application();

  await app.init({ resizeTo: window });
  document.body.appendChild(app.canvas);

  // Add a container to center our sprite stack on the page
  const container = new Container({
    x: app.screen.width / 2,
    y: app.screen.height / 2,
  });

  app.stage.addChild(container);

  // load the texture
  const tex = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Create the 3 sprites, each a child of the last
  const sprites: Container[] = [];
  let parent = container;

  for (let i = 0; i < 3; i++) {
    const wrapper = new Container();
    const sprite = Sprite.from(tex);

    sprite.anchor.set(0.5);
    wrapper.addChild(sprite);
    parent.addChild(wrapper);
    sprites.push(wrapper);
    parent = wrapper;
  }

  // Set all sprite's properties to the same value, animated over time
  let elapsed = 0.0;

  app.ticker.add((delta) => {
    elapsed += delta.deltaTime / 60;
    const amount = Math.sin(elapsed);
    const scale = 1.0 + (0.25 * amount);
    const alpha = 0.75 + (0.25 * amount);
    const angle = 40 * amount;
    const x = 75 * amount;

    for (let i = 0; i < sprites.length; i++) {
      const sprite = sprites[i];

      sprite.scale.set(scale);
      sprite.alpha = alpha;
      sprite.angle = angle;
      sprite.x = x;
    }
  });
})();
