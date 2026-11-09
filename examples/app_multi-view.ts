// description: One Application driving several interactive canvases with app.addView (multiView)
import { Application, type Container, DOMContainer, type FederatedPointerEvent, Graphics, Text } from 'pixi.js';

(async () => {
  const app = new Application();

  // multiView lets a single renderer - and the single app ticker - drive many canvases.
  // It is required for the WebGL renderer; the WebGPU renderer ignores it.
  await app.init({ background: '#1099bb', width: 250, height: 250, multiView: true, antialias: true });

  const row = document.createElement('div');

  row.style.cssText = 'display: flex; align-items: flex-start; gap: 8px; padding: 8px; flex-wrap: wrap;';
  document.body.appendChild(row);

  function makeCanvas() {
    const canvas = document.createElement('canvas');

    canvas.style.borderRadius = '8px';

    return canvas;
  }

  function buildScene(stage: Container, label: string, color: number) {
    const title = new Text({
      text: `${label}\nhover, click & drag`,
      style: { fill: '#ffffff', fontSize: 14, align: 'center' },
    });

    title.anchor.set(0.5);
    title.position.set(125, 30);
    stage.addChild(title);

    const shape = new Graphics().roundRect(-40, -40, 80, 80, 12).fill(color);

    shape.position.set(125, 130);
    shape.eventMode = 'static';
    shape.cursor = 'pointer';
    // accessible to screen readers and keyboard (press Tab) - each canvas gets its own overlay
    shape.accessible = true;
    shape.accessibleTitle = `${label} shape`;
    stage.addChild(shape);

    shape.on('pointerover', () => shape.scale.set(1.15));
    shape.on('pointerout', () => shape.scale.set(1));
    shape.on('pointertap', () => {
      shape.tint = Math.random() * 0xffffff;
    });

    // each view tracks its own pointer, so drags are independent across canvases
    let dragging = false;

    shape.on('pointerdown', () => {
      dragging = true;
    });
    stage.eventMode = 'static';
    stage.hitArea = app.screen;
    // a plain pointermove on a hit-tested target needs only the `move` feature, so this still
    // works on View C, which opts out of global move tracking via eventFeatures
    stage.on('pointermove', (e: FederatedPointerEvent) => {
      if (dragging) shape.position.copyFrom(e.global);
    });
    stage.on('pointerup', () => {
      dragging = false;
    });
    stage.on('pointerupoutside', () => {
      dragging = false;
    });
  }

  // The primary view renders app.stage to app.canvas - exactly like a classic single-canvas app.
  app.canvas.style.borderRadius = '8px';
  row.appendChild(app.canvas);
  buildScene(app.stage, 'View A', 0xffcc00);

  // Each addView pairs a new canvas with its own stage. app.render(), driven by the ticker,
  // renders every view each frame - no manual render loop needed.
  // width/height size this view's canvas once on creation; resolution + autoDensity render it at
  // the device pixel ratio while keeping its on-screen size, so the text and DOM <input> overlay
  // stay crisp on high-density displays.
  const secondCanvas = makeCanvas();

  row.appendChild(secondCanvas);
  const viewB = app.addView({
    canvas: secondCanvas,
    clearColor: '#aa3344',
    width: 250,
    height: 250,
    resolution: window.devicePixelRatio,
    autoDensity: true,
    // per-view antialias: secondary canvases now match the renderer's antialias (WebGPU MSAA)
    antialias: true,
  });

  buildScene(viewB.stage, 'View B', 0x33ddff);

  // a cacheAsTexture badge caches at View B's own (retina) resolution, so it stays crisp
  const badge = new Text({ text: 'cached', style: { fill: '#11304a', fontSize: 12, fontWeight: 'bold' } });

  badge.anchor.set(0.5);
  badge.position.set(125, 130);
  viewB.stage.addChild(badge);
  badge.cacheAsTexture(true);

  // A DOM <input> living in the second view's scene is positioned over its own canvas.
  const input = document.createElement('input');

  input.value = 'edit me';
  const dom = new DOMContainer({ element: input, anchor: 0.5 });

  dom.position.set(125, 205);
  viewB.stage.addChild(dom);

  // A minimap-style view: per-view eventFeatures disable global move tracking (no globalpointermove
  // hit-testing every frame) while keeping clicks, taps and the local pointermove drag working.
  const thirdCanvas = makeCanvas();

  row.appendChild(thirdCanvas);
  const viewC = app.addView({
    canvas: thirdCanvas,
    clearColor: '#226644',
    width: 250,
    height: 250,
    eventFeatures: { globalMove: false },
    antialias: true,
  });

  buildScene(viewC.stage, 'View C', 0xff66aa);

  // Removing a view stops it rendering and frees its GPU render target, while leaving its canvas in
  // the DOM. app.removeView -> RenderView.destroy -> renderer.removeView -> releaseRenderTarget.
  const removeButton = document.createElement('button');

  removeButton.textContent = 'Remove View C';
  removeButton.style.cssText = 'margin: 8px; padding: 6px 10px;';
  document.body.appendChild(removeButton);
  removeButton.addEventListener('click', () => {
    app.removeView(viewC);
    thirdCanvas.style.opacity = '0.4';
    removeButton.disabled = true;
  });
})();
