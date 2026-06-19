// description: This example demonstrates one renderer driving multiple interactive canvases using multiView
import { autoDetectRenderer, Container, Graphics, Text, Ticker } from 'pixi.js';

import type { FederatedPointerEvent, FederatedWheelEvent, Renderer } from 'pixi.js';

(async () => {
  const VIEWS = [
    { label: 'View A', background: '#1099bb', shape: 0xffcc00 },
    { label: 'View B', background: '#aa3344', shape: 0x33ddff },
    { label: 'View C', background: '#226644', shape: 0xff66aa },
  ];

  // Simple page scaffold: a renderer picker and a row of canvases
  const picker = document.createElement('select');

  picker.innerHTML = `
    <option value="webgl">WebGL (multiView: true)</option>
    <option value="webgpu">WebGPU (no option needed)</option>
  `;
  picker.style.cssText = 'margin: 8px; font-size: 14px;';
  document.body.appendChild(picker);

  const row = document.createElement('div');

  row.style.cssText = 'display: flex; gap: 8px; padding: 8px;';
  document.body.appendChild(row);

  let renderer: Renderer | null = null;
  let ticker: Ticker | null = null;

  async function start(preference: 'webgl' | 'webgpu') {
    // Tear down the previous run. Fresh canvases are required because a canvas
    // can only ever hold one kind of rendering context.
    ticker?.destroy();
    renderer?.destroy();
    row.innerHTML = '';

    const canvases = VIEWS.map(() => {
      const canvas = document.createElement('canvas');

      canvas.width = 250;
      canvas.height = 250;
      canvas.style.cssText = 'border-radius: 8px;';
      row.appendChild(canvas);

      return canvas;
    });

    // One renderer for all canvases. The first canvas doubles as the renderer's
    // main view; the others are passed as render targets each frame.
    // multiView is required for WebGL and harmlessly ignored by WebGPU.
    renderer = await autoDetectRenderer({
      preference,
      canvas: canvases[0],
      width: 250,
      height: 250,
      multiView: true,
      antialias: true,
    });

    const scenes = VIEWS.map((_, i) => buildScene(i));

    ticker = new Ticker();
    ticker.add(() => {
      scenes.forEach((stage, i) => {
        renderer.render({
          container: stage,
          target: canvases[i],
          clearColor: VIEWS[i].background,
        });
      });
    });
    ticker.start();
  }

  function buildScene(index: number) {
    const stage = new Container();
    const view = VIEWS[index];

    const label = new Text({
      text: `${view.label}\nhover, click, drag & scroll me`,
      style: { fill: '#ffffff', fontSize: 14, align: 'center' },
    });

    label.anchor.set(0.5);
    label.position.set(125, 30);
    stage.addChild(label);

    const shape = new Graphics().roundRect(-40, -40, 80, 80, 12).fill(view.shape);

    shape.position.set(125, 145);
    shape.eventMode = 'static';
    shape.cursor = 'pointer';
    stage.addChild(shape);

    // hover: scale up, and the cursor changes on this canvas only
    shape.on('pointerover', () => shape.scale.set(1.15));
    shape.on('pointerout', () => shape.scale.set(1));

    // click: random tint
    shape.on('pointertap', () => {
      shape.tint = Math.random() * 0xffffff;
    });

    // wheel: rotate
    shape.on('wheel', (e: FederatedWheelEvent) => {
      shape.rotation += e.deltaY * 0.005;
    });

    // drag: each view tracks its own pointer independently
    let dragging = false;

    shape.on('pointerdown', () => {
      dragging = true;
    });
    stage.eventMode = 'static';
    stage.hitArea = renderer.screen;
    stage.on('pointermove', (e: FederatedPointerEvent) => {
      if (dragging) {
        shape.position.copyFrom(e.global);
      }
    });
    stage.on('pointerup', () => {
      dragging = false;
    });
    stage.on('pointerupoutside', () => {
      dragging = false;
    });

    return stage;
  }

  picker.addEventListener('change', () => {
    void start(picker.value as 'webgl' | 'webgpu');
  });

  await start('webgl');
})();
