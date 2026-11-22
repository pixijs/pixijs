// dependencies: { "pixi.js": "latest", "gsap": "latest", "pixi-filters": "latest" }
// description: This example compares Graphics and SmoothGraphics drawing the same shapes into render textures without MSAA, magnified so stair-stepped edges and shader anti-aliased edges are easy to tell apart.
import { gsap } from 'gsap';
import { Color, Container, Graphics, RenderTexture, SmoothGraphics, Sprite, Text } from 'pixi.js';
import { setup } from '../shared/setup';

const RT_SIZE = 128;
const ZOOM = 4;
const LOUPE_W = 336;
const LOUPE_H = 256;
const GAP = 16;
const ROW_Y = 334;
const PANEL_COLOR = 0x09111a;
// render() needs an array here: a 0x000000-style number isn't converted on WebGPU
const CLEAR_COLOR = new Color(PANEL_COLOR).toArray();

interface LabelOptions {
  size?: number;
  color?: number;
  fontWeight?: '600' | '700';
}

function createLabel(text: string, x: number, y: number, options: LabelOptions = {}) {
  const label = new Text({
    text,
    style: {
      fontFamily: 'Sono, monospace',
      fontSize: options.size ?? 18,
      fontWeight: options.fontWeight ?? '600',
      fill: options.color ?? 0xffffff,
      align: 'center',
      lineHeight: (options.size ?? 18) * 1.5,
      dropShadow: { color: 0x000000, alpha: 0.45, blur: 4, distance: 2 },
    },
  });

  label.anchor.set(0.5);
  label.position.set(x, y);

  return label;
}

function polar(radius: number, angle: number) {
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

// Small vector art full of hard cases: 1px lines, a thin ring, a curve and sharp star tips
function drawArt<T extends Graphics>(graphics: T) {
  const radius = 58;

  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    const start = polar(i % 5 === 0 ? radius - 10 : radius - 5, angle);
    const end = polar(radius - 2, angle);

    graphics.moveTo(start.x, start.y).lineTo(end.x, end.y);
  }
  graphics.stroke({ width: 1, color: 0xb1e8ff, alpha: 0.9 });

  for (let i = 0; i < 12; i++) {
    const angle = ((i / 12) * Math.PI * 2) + (Math.PI / 12);
    const start = polar(16, angle);
    const end = polar(radius - 14, angle);

    graphics.moveTo(start.x, start.y).lineTo(end.x, end.y);
  }
  graphics.stroke({ width: 1, color: 0xffffff, alpha: 0.55 });

  graphics.circle(0, 0, radius).stroke({ width: 1.5, color: 0x20dcff });
  graphics.circle(0, 0, 37).stroke({ width: 1, color: 0xffb9c8, alpha: 0.75 });

  graphics.moveTo(-50, 22).bezierCurveTo(-26, -58, 26, 58, 50, -22).stroke({ width: 2, color: 0xffd166 });

  graphics.star(0, 0, 5, 24, 10).fill(0xff5ea8).stroke({ width: 1.5, color: 0xffffff });

  for (let i = 0; i < 6; i++) {
    const dot = polar(radius - 14, (i / 6) * Math.PI * 2);

    graphics.circle(dot.x, dot.y, 2).fill(0xffd166);
  }

  return graphics;
}

(async () => {
  const { app, width } = await setup();

  // The art turns and the loupes pan over it; both sides follow the same view
  const view = { rotation: 0, x: RT_SIZE / 2, y: RT_SIZE / 2 };

  function createSide(graphics: Graphics, loupeX: number, thumbX: number, title: string, caption: string, accent: number) {
    const side = new Container();
    const loupeY = ROW_Y - (LOUPE_H / 2);
    const thumbY = ROW_Y - (RT_SIZE / 2);
    const centerX = loupeX + (LOUPE_W / 2);

    // Render textures have no MSAA: any smoothing has to come from the shader
    const texture = RenderTexture.create({ width: RT_SIZE, height: RT_SIZE, scaleMode: 'nearest' });
    const scene = new Container();
    graphics.position.set(RT_SIZE / 2, RT_SIZE / 2);
    scene.addChild(graphics);

    const thumb = new Sprite(texture);
    thumb.position.set(thumbX, thumbY);
    const thumbFrame = new Graphics()
      .roundRect(thumbX - 2, thumbY - 2, RT_SIZE + 4, RT_SIZE + 4, 6)
      .stroke({ width: 2, color: accent, alpha: 0.45 });

    // Outlines the part of the texture that the loupe magnifies
    const marker = new Graphics()
      .rect(-LOUPE_W / ZOOM / 2, -LOUPE_H / ZOOM / 2, LOUPE_W / ZOOM, LOUPE_H / ZOOM)
      .stroke({ width: 1, color: 0xffffff, alpha: 0.85 });

    const loupeBg = new Graphics().roundRect(loupeX, loupeY, LOUPE_W, LOUPE_H, 14).fill(PANEL_COLOR);
    const loupeFrame = new Graphics()
      .roundRect(loupeX, loupeY, LOUPE_W, LOUPE_H, 14)
      .stroke({ width: 2, color: accent, alpha: 0.55 });

    // The same texture, scaled up with nearest sampling so every texel is visible
    const zoomed = new Sprite(texture);
    zoomed.scale.set(ZOOM);
    const loupeMask = new Graphics().roundRect(loupeX, loupeY, LOUPE_W, LOUPE_H, 14).fill(0xffffff);
    zoomed.mask = loupeMask;

    const zoomTag = createLabel(`${ZOOM}× texels`, centerX, loupeY + LOUPE_H + 22, { size: 13, color: accent });
    const thumbTag = createLabel('texture', thumbX + (RT_SIZE / 2), thumbY + RT_SIZE + 22, { size: 13, color: accent });

    const titleLabel = createLabel(title, centerX, 164, { size: 20, color: accent, fontWeight: '700' });
    const captionLabel = createLabel(caption, centerX, 530, { size: 14, color: 0xcfd9e5 });

    side.addChild(
      loupeBg,
      zoomed,
      loupeMask,
      loupeFrame,
      zoomTag,
      thumb,
      thumbFrame,
      marker,
      thumbTag,
      titleLabel,
      captionLabel,
    );
    app.stage.addChild(side);

    return {
      side,
      update() {
        graphics.rotation = view.rotation;
        app.renderer.render({ container: scene, target: texture, clear: true, clearColor: CLEAR_COLOR });
        zoomed.position.set(loupeX + (LOUPE_W / 2) - (view.x * ZOOM), loupeY + (LOUPE_H / 2) - (view.y * ZOOM));
        marker.position.set(thumbX + view.x, thumbY + view.y);
      },
    };
  }

  const leftLoupeX = (width / 2) - 20 - LOUPE_W;
  const rightLoupeX = (width / 2) + 20;

  const sides = [
    createSide(
      drawArt(new Graphics()),
      leftLoupeX,
      leftLoupeX - GAP - RT_SIZE,
      'new Graphics()',
      'relies on MSAA, which render\ntextures lack: edges stair-step',
      0xffb9c8,
    ),
    createSide(
      drawArt(new SmoothGraphics()),
      rightLoupeX,
      rightLoupeX + LOUPE_W + GAP,
      'new SmoothGraphics()',
      'anti-aliased in the shader:\nsmooth edges, even without MSAA',
      0xb1e8ff,
    ),
  ];

  const footer = createLabel(
    `the same drawing code · two ${RT_SIZE}×${RT_SIZE} RenderTextures, magnified ${ZOOM}×`,
    width / 2,
    590,
    { size: 13, color: 0x9fb6cf },
  );
  app.stage.addChild(footer);

  // Re-render both textures every frame; only the transform changes, the shapes are never redrawn
  app.ticker.add(() => sides.forEach((s) => s.update()));

  // A slow spin keeps every edge crossing new pixels
  gsap.to(view, { rotation: Math.PI * 2, duration: 48, ease: 'none', repeat: -1 });

  // Pan the loupe between details: ring ticks, curve, star tips
  const halfW = LOUPE_W / ZOOM / 2;
  const halfH = LOUPE_H / ZOOM / 2;
  const stops = [
    { x: RT_SIZE - halfW - 2, y: halfH + 2 },
    { x: RT_SIZE / 2, y: RT_SIZE / 2 },
    { x: halfW + 2, y: RT_SIZE - halfH - 2 },
    { x: RT_SIZE - halfW - 2, y: RT_SIZE - halfH - 2 },
    { x: RT_SIZE / 2, y: RT_SIZE / 2 },
  ];
  const pan = gsap.timeline({ repeat: -1, defaults: { duration: 2.4, ease: 'sine.inOut' } });

  stops.forEach((stop) => pan.to(view, { ...stop, delay: 1.2 }));

  gsap.from(
    sides.map((s) => s.side),
    { alpha: 0, y: 14, duration: 0.7, ease: 'power2.out', stagger: 0.15 },
  );
})();
