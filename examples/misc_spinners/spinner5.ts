import { Container, Graphics } from 'pixi.js';

/* ---------------------
Spinner 5. Rounded rectangle fixed length spinner by jonlepage
-------------------- */
export function generateSpinner5(app, position) {
  const container = new Container();

  container.position = position;
  app.stage.addChild(container);

  const halfCircle = new Graphics().arc(0, 0, 100, 0, Math.PI).fill({ color: 0xff0000 });

  halfCircle.position.set(50, 50);

  const rectangle = new Graphics().roundRect(0, 0, 100, 100, 16).stroke({ width: 2, color: 0xffffff });

  rectangle.mask = halfCircle;

  container.addChild(rectangle);
  container.addChild(halfCircle);

  let phase = 0;

  return (delta) => {
    // Update phase
    phase += delta / 6;
    phase %= Math.PI * 2;

    halfCircle.rotation = phase;
  };
}
