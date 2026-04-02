// description: Demonstrates how different mask channels produce different results from the same mask texture. The mask has a red star shape and a blue circle with soft alpha edges. The 'red' channel reads the red component, revealing only the star. The 'alpha' channel reads opacity, revealing the full circular shape.
import { Application, Assets, Container, Graphics, Sprite, Text } from 'pixi.js';

(async () => {
  const app = new Application();

  await app.init({ background: '#0e0e2c', resizeTo: window, antialias: true });
  document.body.appendChild(app.canvas);

  const photo = await Assets.load('https://pixijs.com/assets/bg_grass.jpg');

  const cx = app.screen.width / 2;
  const cy = app.screen.height / 2;
  const cardSize = Math.min(app.screen.width * 0.3, 280);
  const gap = 60;
  const maskR = cardSize * 0.48;

  // --- Mask texture: blue circle (R=0, A>0) + red star (R>0, A>0) ---
  const maskGfx = new Graphics();

  // Soft blue circle (no red, but fully opaque)
  for (let i = 24; i >= 0; i--) {
    const t = i / 24;
    const r = maskR * (0.25 + (t * 0.75));
    const a = 1 - (t * t * 0.5);

    maskGfx.circle(0, 0, r).fill({ color: 0x0055EE, alpha: a });
  }
  maskGfx.circle(0, 0, maskR * 0.25).fill({ color: 0x0077CC });

  // Red/warm star on top
  maskGfx.star(0, 0, 6, maskR * 0.75, maskR * 0.38).fill({ color: 0xDD2200 });

  const maskTexture = app.renderer.generateTexture({ target: maskGfx });

  // --- Scene content: photo background ---
  function createContent(): Container {
    const c = new Container();

    const bg = new Sprite(photo);

    bg.width = cardSize;
    bg.height = cardSize;
    bg.anchor.set(0.5);
    c.addChild(bg);

    return c;
  }

  // --- Card panel ---
  function createCard(x: number, y: number): void {
    const pad = 16;
    const bg = new Graphics();

    bg.roundRect((-cardSize / 2) - pad, (-cardSize / 2) - pad, cardSize + (pad * 2), cardSize + (pad * 2), 14)
      .fill({ color: 0x16163a, alpha: 0.9 });
    bg.roundRect((-cardSize / 2) - pad, (-cardSize / 2) - pad, cardSize + (pad * 2), cardSize + (pad * 2), 14)
      .stroke({ color: 0x2a2a66, alpha: 0.6, width: 1 });
    bg.position.set(x, y);
    app.stage.addChild(bg);
  }

  // --- Layout ---
  const leftX = cx - (cardSize / 2) - (gap / 2);
  const rightX = cx + (cardSize / 2) + (gap / 2);
  const panelY = cy - 50;

  // Title
  const title = new Text({
    text: 'Alpha Channel Mask',
    style: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: 28,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      letterSpacing: 1,
    },
  });

  title.anchor.set(0.5, 1);
  title.position.set(cx, panelY - (cardSize / 2) - 56);
  app.stage.addChild(title);

  const subtitle = new Text({
    text: 'Same mask texture, different channel reads',
    style: { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 14, fill: 0xFFFFFF },
  });

  subtitle.anchor.set(0.5, 1);
  subtitle.position.set(cx, panelY - (cardSize / 2) - 32);
  app.stage.addChild(subtitle);

  // --- Left panel: channel 'red' ---
  createCard(leftX, panelY);
  const leftContent = createContent();

  leftContent.position.set(leftX, panelY);
  app.stage.addChild(leftContent);

  const leftMask = new Sprite(maskTexture);

  leftMask.anchor.set(0.5);
  leftMask.position.set(leftX, panelY);
  app.stage.addChild(leftMask);
  leftContent.setMask({ mask: leftMask, channel: 'red' });

  // --- Right panel: channel 'alpha' ---
  createCard(rightX, panelY);
  const rightContent = createContent();

  rightContent.position.set(rightX, panelY);
  app.stage.addChild(rightContent);

  const rightMask = new Sprite(maskTexture);

  rightMask.anchor.set(0.5);
  rightMask.position.set(rightX, panelY);
  app.stage.addChild(rightMask);
  rightContent.setMask({ mask: rightMask, channel: 'alpha' });

  // --- Labels below panels ---
  const titleStyle = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 18,
    fontWeight: 'bold' as const,
    fill: 0xFFFFFF,
    align: 'center' as const,
  };
  const subStyle = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 12,
    fill: 0xFFFFFF,
    align: 'center' as const,
  };

  function addText(text: string, x: number, y: number, style: Record<string, unknown>): Text {
    const t = new Text({ text, style });

    t.anchor.set(0.5, 0);
    t.position.set(x, y);
    app.stage.addChild(t);

    return t;
  }

  const labelY = panelY + (cardSize / 2) + 32;

  addText('channel: \'red\'', leftX, labelY, titleStyle);
  addText('Reads the red component', leftX, labelY + 24, subStyle);
  addText('Star shape only (R > 0 there)', leftX, labelY + 40, { ...subStyle, fill: 0xFFFFFF });

  addText('channel: \'alpha\'', rightX, labelY, titleStyle);
  addText('Reads the alpha component', rightX, labelY + 24, subStyle);
  addText('Full circle (A > 0 everywhere)', rightX, labelY + 40, { ...subStyle, fill: 0xFFFFFF });

  // --- Mask preview (centered between label columns) ---
  const previewScale = 0.28;
  const previewCx = cx;
  const previewCy = labelY + 20;

  const maskPreview = new Sprite(maskTexture);

  maskPreview.anchor.set(0.5);
  maskPreview.scale.set(previewScale);
  maskPreview.position.set(previewCx, previewCy);
  app.stage.addChild(maskPreview);

  const previewBorder = new Graphics();

  previewBorder.circle(0, 0, (maskR * previewScale) + 3)
    .stroke({ color: 0x334466, alpha: 0.5, width: 1 });
  previewBorder.position.set(previewCx, previewCy);
  app.stage.addChild(previewBorder);

  addText('mask texture', previewCx, previewCy + (maskR * previewScale) + 8, {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 10,
    fill: 0xFFFFFF,
    letterSpacing: 1,
  });
})();
