import { Container, Graphics, Sprite } from 'pixi.js';

/* ---------------------
Spinner 3. Radial mask.
-------------------- */
export function generateSpinner3(app, position) {
  const container = new Container();

  container.position = position;
  app.stage.addChild(container);

  const base = Sprite.from('https://pixijs.com/assets/bg_scene_rotate.jpg');
  const size = 100;

  base.width = size;
  base.height = size;

  const mask = new Graphics();

  mask.position.set(size / 2, size / 2);
  base.mask = mask;

  container.addChild(base);
  container.addChild(mask);

  let phase = 0;

  return (delta) => {
    // Update phase
    phase += delta / 60;
    phase %= Math.PI * 2;

    const angleStart = 0 - (Math.PI / 2);
    const angle = phase + angleStart;
    const radius = 50;

    const x1 = Math.cos(angleStart) * radius;
    const y1 = Math.sin(angleStart) * radius;

    // Redraw mask
    mask
      .clear()
      .moveTo(0, 0)
      .lineTo(x1, y1)
      .arc(0, 0, radius, angleStart, angle, false)
      .lineTo(0, 0)
      .fill({ color: 0xff0000 });
  };
}
