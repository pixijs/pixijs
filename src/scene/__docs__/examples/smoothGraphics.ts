import { Application, Graphics, GraphicsContext, SmoothGraphics, Text } from 'pixi.js';

const DESIGN_W = 1280;
const DESIGN_H = 720;

/** Creates a monospace label centered on (x, y) in the 1280x720 design space */
function createLabel(text: string, x: number, y: number, color: number, size = 15, fontWeight: 'normal' | 'bold' = 'normal') {
  const label = new Text({
    text,
    anchor: 0.5,
    style: {
      fontFamily: 'Sono, monospace',
      fontSize: size,
      fontWeight,
      fill: color,
      dropShadow: { color: 0x000000, alpha: 0.45, blur: 4, distance: 2 },
    },
  });

  label.position.set(x, y);

  return label;
}

/**
 * Draws a dial of thin lines, curves and a star: the edges where aliasing shows most
 * @returns A new context, for one kind of graphics: a Graphics and a SmoothGraphics can't share it
 */
function createDial() {
  const context = new GraphicsContext();

  for (let i = 0; i < 60; i++) {
    const cos = Math.cos((i / 60) * Math.PI * 2);
    const sin = Math.sin((i / 60) * Math.PI * 2);
    const inner = i % 5 === 0 ? 150 : 162;

    context.moveTo(cos * inner, sin * inner).lineTo(cos * 172, sin * 172);
  }
  context.stroke({ width: 1, color: 0xb1e8ff, alpha: 0.8 });
  context.circle(0, 0, 182).stroke({ width: 2, color: 0xb1e8ff });

  // rotate() changes the transform of everything drawn after it, so save and restore around the orbits
  context.save();
  for (let i = 0; i < 3; i++) {
    context.rotate(Math.PI / 3).ellipse(0, 0, 138, 46).stroke({ width: 1, color: 0xffd166, alpha: 0.9 });
  }
  context.restore();

  context.star(0, 0, 5, 96, 44).fill(0xff5ea8).stroke({ width: 3, color: 0xffffff });
  context.circle(0, 0, 18).fill(0xffd166);

  return context;
}

(async () => {
  const app = new Application();

  // No MSAA on this canvas: Graphics edges step, SmoothGraphics edges are anti-aliased in the shader
  await app.init({ antialias: false, backgroundAlpha: 0, resizeTo: window });
  document.body.appendChild(app.canvas);
  document.body.style.background = 'radial-gradient(ellipse at center, #2a3a50 0%, #131a26 55%, #060a10 100%)';

  // The card is a SmoothGraphics too, so its rounded corners stay smooth
  const card = new SmoothGraphics()
    .roundRect(60, 60, DESIGN_W - 120, DESIGN_H - 120, 24)
    .fill({ color: 0x09111a, alpha: 0.82 })
    .stroke({ width: 2, color: 0x4fe6ff, alpha: 0.2 })
    .moveTo(640, 150)
    .lineTo(640, 560)
    .stroke({ width: 2, color: 0x334455, alpha: 0.6 })
    .roundRect(552, 590, 176, 32, 16)
    .fill({ color: 0x141d2b })
    .stroke({ width: 1.5, color: 0xffd166, alpha: 0.45 });

  // The same dial, with a context each
  const dials = [new Graphics(createDial()), new SmoothGraphics(createDial())];

  dials[0].position.set(350, 360);
  dials[1].position.set(930, 360);

  app.stage.addChild(
    card,
    ...dials,
    createLabel('new Graphics()', 350, 112, 0xffb9c8, 22, 'bold'),
    createLabel('new SmoothGraphics()', 930, 112, 0xb1e8ff, 22, 'bold'),
    createLabel('stair-stepped edges without MSAA', 350, 606, 0xffcbd4),
    createLabel('edges anti-aliased in the shader', 930, 606, 0xc2f0ff),
    createLabel('antialias: false', 640, 606, 0xffd166),
  );

  function layout() {
    const scale = Math.min(app.screen.width / DESIGN_W, app.screen.height / DESIGN_H);

    app.stage.scale.set(scale);
    app.stage.position.set((app.screen.width - (DESIGN_W * scale)) / 2, (app.screen.height - (DESIGN_H * scale)) / 2);
  }

  layout();
  app.renderer.on('resize', layout);

  // Slow turn and zoom: the steps crawl along the Graphics edges, the smooth edges hold
  let elapsed = 0;

  app.ticker.add((time) => {
    elapsed += time.deltaMS / 1000;

    for (const dial of dials) {
      dial.rotation = elapsed * 0.15;
      dial.scale.set(1 + (Math.sin(elapsed * 0.8) * 0.12));
    }
  });
})();
