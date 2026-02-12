import { Container, Sprite } from 'pixi.js';

/* -----------------------
Spinner 2. Scaling balls.
---------------------- */
export function generateSpinner2(app, position) {
  const container = new Container();

  container.position = position;
  app.stage.addChild(container);

  const size = 100;
  const ballAmount = 7;
  const balls = [];

  for (let i = 0; i < ballAmount; i++) {
    const ball = Sprite.from('https://pixijs.com/assets/circle.png');

    ball.anchor.set(0.5);
    container.addChild(ball);
    ball.position.set(
      (size / 2) + ((Math.cos((i / ballAmount) * Math.PI * 2) * size) / 3),
      (size / 2) + ((Math.sin((i / ballAmount) * Math.PI * 2) * size) / 3),
    );
    balls.push(ball);
  }

  let phase = 0;

  return (delta) => {
    // Update phase
    phase += delta / 60;
    phase %= Math.PI * 2;

    // Update ball scales
    balls.forEach((b, i) => {
      const sin = Math.sin(((i / ballAmount) * Math.PI) - phase);
      // Multiply sin with itself to get more steeper edge.

      b.scale.set(Math.abs(sin * sin * sin * 0.5) + 0.5);
    });
  };
}
