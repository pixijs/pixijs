import { Application, Container, Sprite, Text, Texture } from 'pixi.js';

(async () => {
  // Create the application helper and add its render target to the page
  const app = new Application();

  await app.init({ preference: 'canvas' });
  document.body.appendChild(app.canvas);

  // Label showing scene graph hierarchy
  const label = new Text({
    text: 'Scene Graph:\n\napp.stage\n  ┗ A\n     ┗ B\n     ┗ C\n  ┗ D',
    style: { fill: '#ffff00', fontFamily: 'sans-serif' },
    position: { x: 300, y: 100 },
  });

  app.stage.addChild(label);

  // Helper function to create a block of color with a letter
  const letters: Container[] = [];

  function addLetter(letter: string, parent: Container, color: number, pos: { x: number, y: number }) {
    const bg = new Sprite(Texture.WHITE);

    bg.width = 100;
    bg.height = 100;
    bg.tint = color;

    const text = new Text({
      text: letter,
      style: { fill: '#ffffff', fontFamily: 'sans-serif' },
    });

    text.anchor.set(0.5);
    text.position = { x: 50, y: 50 };

    const container = new Container();

    container.position = pos;
    container.visible = false;
    container.addChild(bg, text);
    parent.addChild(container);

    letters.push(container);

    return container;
  }

  // Define 4 letters
  const a = addLetter('A', app.stage, 0xff0000, { x: 100, y: 100 });
  addLetter('B', a, 0x00ff00, { x: 20, y: 20 });
  addLetter('C', a, 0x0000ff, { x: 20, y: 40 });
  addLetter('D', app.stage, 0xff8800, { x: 140, y: 100 });

  // Display them over time, in order
  let elapsed = 0.0;

  app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime / 60.0;
    if (elapsed >= letters.length) {
      elapsed = 0.0;
    }
    for (let i = 0; i < letters.length; i++) {
      letters[i].visible = elapsed >= i;
    }
  });
})();
