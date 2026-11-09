// dependencies: { "pixi.js": "latest", "gsap": "latest", "pixi-filters": "latest" }
// description: This example zooms the same SmoothGraphics chart in two panels, showing how pixelLine keeps every stroke at the width you pass in screen pixels while normal strokes grow with the zoom.
import { gsap } from 'gsap';
import { Container, FillGradient, Graphics, SmoothGraphics, Text } from 'pixi.js';
import { setup } from '../shared/setup';

const PANEL_W = 480;
const PANEL_H = 330;
const PANEL_Y = 310;
const LEFT_X = 380;
const RIGHT_X = 900;
const LINE_WIDTH = 2;

const STEP = 44;
const GRID = { x: 440, top: -300, bottom: 350 };
const SERIES_A = [120, 90, 105, 50, 75, 10, 40, -20, 0, -105, -45, -75, -20, -60, -35];
const SERIES_B = [165, 140, 150, 110, 125, 75, 95, 50, 65, -40, 15, -10, 35, 5, 30];
const toPoints = (values) => values.map((y, i) => ({ x: (i - 7) * STEP, y }));
const PEAK = toPoints(SERIES_A)[9];
const DIP = toPoints(SERIES_A)[4];

// The rest view fits the whole chart; the close-ups zoom in on the two callouts
const REST = { zoom: 0.65, x: 0, y: 30 };
const ZOOM_IN = 3;
// Look a little below each callout so it sits in the upper part of the panel
const LOOK_BELOW = 20;
const closeUp = (p) => ({ zoom: ZOOM_IN, x: p.x, y: p.y + LOOK_BELOW });

function createLabel(text, x, y, options: { size?: number; color?: number; fontWeight?: '600' | 'bold' } = {}) {
  const label = new Text({
    text,
    style: {
      fontFamily: 'Sono, monospace',
      fontSize: options.size ?? 18,
      fontWeight: options.fontWeight ?? '600',
      fill: options.color ?? 0xffffff,
      align: 'center',
      dropShadow: { color: 0x000000, alpha: 0.45, blur: 4, distance: 2 },
    },
  });

  label.anchor.set(0.5);
  label.position.set(x, y);

  return label;
}

// Both panels draw the same chart; only the pixelLine flag on each stroke differs
function drawChart(g, pixelLine) {
  const stroke = (color, width = LINE_WIDTH, alpha = 1) => ({ width, color, alpha, pixelLine, join: 'round' as const });

  for (let x = -GRID.x; x <= GRID.x; x += STEP) g.moveTo(x, GRID.top).lineTo(x, GRID.bottom);
  for (let y = GRID.top; y <= GRID.bottom; y += 50) g.moveTo(-GRID.x, y).lineTo(GRID.x, y);
  g.stroke(stroke(0x7d93b2, 1, 0.3));

  const a = toPoints(SERIES_A);
  const b = toPoints(SERIES_B);
  const flat = (points) => points.flatMap((p) => [p.x, p.y]);

  const area = new FillGradient({
    end: { x: 0, y: 1 },
    colorStops: [
      { offset: 0, color: 'rgba(255, 94, 168, 0.32)' },
      { offset: 1, color: 'rgba(255, 94, 168, 0)' },
    ],
  });

  g.poly([...flat(a), a.at(-1).x, GRID.bottom, a[0].x, GRID.bottom]).fill(area);
  g.poly(flat(b), false).stroke(stroke(0x4fe6ff));
  g.poly(flat(a), false).stroke(stroke(0xff5ea8));

  for (const p of b) g.circle(p.x, p.y, 4).fill(0x0b1220).stroke(stroke(0x4fe6ff));
  for (const p of a) g.circle(p.x, p.y, 5).fill(0x0b1220).stroke(stroke(0xff5ea8));

  // Yellow callouts on the two points the camera visits
  for (const p of [PEAK, DIP]) {
    g.circle(p.x, p.y, 12);
    g.moveTo(p.x - 20, p.y).lineTo(p.x - 15, p.y);
    g.moveTo(p.x + 15, p.y).lineTo(p.x + 20, p.y);
    g.moveTo(p.x, p.y - 20).lineTo(p.x, p.y - 15);
    g.moveTo(p.x, p.y + 15).lineTo(p.x, p.y + 20);
    g.stroke(stroke(0xffd166));
  }

  return g;
}

function createPanel(x, accent, pixelLine) {
  const panel = new Container();
  panel.position.set(x, PANEL_Y);

  const frame = (g) => g.roundRect(-PANEL_W / 2, -PANEL_H / 2, PANEL_W, PANEL_H, 16);

  const bg = frame(new Graphics()).fill({ color: 0x09111a, alpha: 0.82 });
  const chart = drawChart(new SmoothGraphics(), pixelLine);

  // Clip the zoomed chart to the panel
  const mask = frame(new Graphics()).fill(0xffffff);
  chart.mask = mask;

  const border = frame(new Graphics()).stroke({ width: 2, color: accent, alpha: 0.3 });

  panel.addChild(bg, chart, mask, border);

  return { panel, chart };
}

(async () => {
  const { app, width } = await setup();

  const left = createPanel(LEFT_X, 0xffb9c8, false);
  const right = createPanel(RIGHT_X, 0xb1e8ff, true);

  const titleY = PANEL_Y - (PANEL_H / 2) - 32;
  const captionY = PANEL_Y + (PANEL_H / 2) + 30;

  const leftTitle = createLabel('pixelLine: false', LEFT_X, titleY, { size: 22, color: 0xffb9c8, fontWeight: 'bold' });
  const rightTitle = createLabel('pixelLine: true', RIGHT_X, titleY, { size: 22, color: 0xb1e8ff, fontWeight: 'bold' });
  const leftSub = createLabel('strokes grow and shrink with the zoom', LEFT_X, captionY, { size: 15, color: 0xffcbd4 });
  const rightSub = createLabel('strokes keep their width in screen pixels', RIGHT_X, captionY, {
    size: 15,
    color: 0xc2fff9,
  });
  const readoutStyle = { size: 14, color: 0x9fb6cf };
  const leftReadout = createLabel('', LEFT_X, captionY + 25, readoutStyle);
  const rightReadout = createLabel(`width: ${LINE_WIDTH} → ${LINE_WIDTH.toFixed(1)}px on screen`, RIGHT_X, captionY + 25, readoutStyle);

  const zoomText = createLabel('', width / 2, 578, { size: 20, color: 0xffd166, fontWeight: 'bold' });
  const note = createLabel('SmoothGraphics keeps the width you pass; a Graphics pixel line is always 1px', width / 2, 610, {
    size: 14,
    color: 0x9fb6cf,
  });

  app.stage.addChild(
    left.panel,
    right.panel,
    leftTitle,
    rightTitle,
    leftSub,
    rightSub,
    leftReadout,
    rightReadout,
    zoomText,
    note,
  );

  // One camera drives both charts: pivot is the point we look at, scale is the zoom.
  // It starts zoomed in so the very first frame already shows the difference.
  const camera = closeUp(PEAK);

  function sync() {
    for (const chart of [left.chart, right.chart]) {
      chart.pivot.set(camera.x, camera.y);
      chart.scale.set(camera.zoom);
    }

    const onScreen = LINE_WIDTH * camera.zoom * app.stage.scale.x;

    zoomText.text = `chart.scale = ${camera.zoom.toFixed(2)}`;
    leftReadout.text = `width: ${LINE_WIDTH} → ${onScreen.toFixed(1)}px on screen`;
  }

  sync();

  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' }, onUpdate: sync });

  tl.to(camera, { ...closeUp(DIP), duration: 2.4 }, '+=1.2');
  tl.to(camera, { ...REST, duration: 2.6 }, '+=1');
  // when zooming in, reach the callout early so it doesn't swing out of the panel while the zoom grows
  const peak = closeUp(PEAK);

  tl.to(camera, { x: peak.x, y: peak.y, duration: 2.6, ease: 'power3.out' }, '+=1.4');
  tl.to(camera, { zoom: peak.zoom, duration: 2.6 }, '<');
})();
