// dependencies: { "pixi.js": "latest", "gsap": "latest", "pixi-filters": "latest" }
// description: This example demonstrates DashLineShader, which dashes every stroke of a SmoothGraphics context; dash and gap are uniforms, so tweening them never rebuilds the geometry.
import { gsap } from 'gsap';
import { Container, DashLineShader, SmoothGraphics, Text } from 'pixi.js';
import { setup } from '../shared/setup';

const PINK = 0xff5ea8;
const CYAN = 0x20dcff;
const YELLOW = 0xffd166;

const HUB = { x: 640, y: 365, color: YELLOW, radius: 20, rim: 68 };

const NODES = {
  a: { x: 300, y: 255, color: PINK, radius: 14 },
  b: { x: 255, y: 450, color: CYAN, radius: 12 },
  c: { x: 465, y: 505, color: YELLOW, radius: 10 },
  d: { x: 985, y: 250, color: CYAN, radius: 14 },
  e: { x: 1030, y: 440, color: PINK, radius: 12 },
  f: { x: 820, y: 510, color: YELLOW, radius: 10 },
};

// [from, to, bend]: the bend pushes the curve sideways from the straight line
const ROUTES = [
  [HUB, NODES.a, -40],
  [HUB, NODES.b, 30],
  [HUB, NODES.d, 40],
  [HUB, NODES.e, -30],
  [NODES.a, NODES.b, -36],
  [NODES.b, NODES.c, -30],
  [NODES.d, NODES.e, 36],
  [NODES.e, NODES.f, 30],
  [NODES.a, NODES.d, -90],
  [NODES.c, NODES.f, 50],
] as const;

const PRESETS = [
  { dash: 4, gap: 10 },
  { dash: 26, gap: 8 },
  { dash: 12, gap: 6 },
];

function createLabel(text, x, y, options: { size?: number; color?: number; fontWeight?: '400' | '600' | '700' } = {}) {
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

// Moves `distance` from `from` towards `to`, so routes stop short of the node rims
function towards(from, to, distance) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);

  return { x: from.x + ((dx / length) * distance), y: from.y + ((dy / length) * distance) };
}

function routeCurve(from, to, bend) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const control = {
    x: ((from.x + to.x) / 2) - ((dy / length) * bend),
    y: ((from.y + to.y) / 2) + ((dx / length) * bend),
  };

  return {
    start: towards(from, control, from.rim ?? from.radius + 12),
    control,
    end: towards(to, control, to.rim ?? to.radius + 12),
  };
}

function pointOnCurve({ start, control, end }, t) {
  const u = 1 - t;

  return {
    x: (u * u * start.x) + (2 * u * t * control.x) + (t * t * end.x),
    y: (u * u * start.y) + (2 * u * t * control.y) + (t * t * end.y),
  };
}

function createNode({ x, y, color, radius }) {
  const node = new SmoothGraphics();

  node.circle(0, 0, radius + 9).fill({ color, alpha: 0.18 });
  node.circle(0, 0, radius).fill(color);
  node.circle(0, 0, radius * 0.4).fill(0xffffff);
  node.position.set(x, y);

  return node;
}

(async () => {
  const { app, width } = await setup();

  const scene = new Container();
  app.stage.addChild(scene);

  // One DashLineShader dashes every stroke of each context it is set on.
  // dash and gap are uniforms: changing them never rebuilds the geometry.
  const dashes = new DashLineShader({ dash: 12, gap: 6 });

  const routes = new SmoothGraphics();
  routes.context.customShader = dashes;

  const curves = ROUTES.map(([from, to, bend]) => {
    const curve = routeCurve(from, to, bend);
    const color = from === HUB ? to.color : from.color;

    routes
      .moveTo(curve.start.x, curve.start.y)
      .quadraticCurveTo(curve.control.x, curve.control.y, curve.end.x, curve.end.y)
      .stroke({ width: 5, color });

    return { ...curve, color };
  });

  // The ring and the hexagon are their own objects so they can spin; the dashes march with them
  const ring = new SmoothGraphics();
  ring.context.customShader = dashes;
  ring.circle(0, 0, 40).stroke({ width: 4, color: YELLOW });
  ring.position.set(HUB.x, HUB.y);

  const hexagon = new SmoothGraphics();
  hexagon.context.customShader = dashes;
  hexagon.regularPoly(0, 0, 62, 6).stroke({ width: 3, color: 0xffffff, alpha: 0.6 });
  hexagon.position.set(HUB.x, HUB.y);

  // Fills are skipped by the dash shader, so the nodes are separate SmoothGraphics
  const hub = createNode(HUB);
  const nodes = Object.values(NODES).map(createNode);

  scene.addChild(routes, ring, hexagon, ...nodes, hub);

  // Packets travel along the hub routes towards the hub
  for (const [index, curve] of curves.slice(0, 4).entries()) {
    const packet = new SmoothGraphics();
    packet.circle(0, 0, 12).fill({ color: curve.color, alpha: 0.25 });
    packet.circle(0, 0, 6).fill(0xffffff);
    packet.alpha = 0;
    scene.addChild(packet);

    const travel = { t: 0 };

    gsap.to(travel, {
      t: 1,
      duration: 2.4,
      delay: index * 0.6,
      repeat: -1,
      repeatDelay: 1.2,
      ease: 'sine.inOut',
      onUpdate: () => {
        const { x, y } = pointOnCurve(curve, 1 - travel.t);

        packet.position.set(x, y);
        packet.alpha = Math.sin(travel.t * Math.PI);
      },
    });
  }

  const valueLabel = createLabel('dash: 12  gap:  6', width / 2, 112, { size: 26, color: 0xffb9c8, fontWeight: '700' });
  const valueNote = createLabel('dash and gap are uniforms: tweening them never rebuilds the geometry', width / 2, 146, {
    size: 14,
    color: 0x9fb6cf,
  });
  const captionTop = createLabel('one DashLineShader dashes every stroke of the contexts it is set on', width / 2, 600, {
    size: 15,
    color: 0x9fb6cf,
  });
  const captionBottom = createLabel('fills are skipped, so the nodes are drawn by their own SmoothGraphics', width / 2, 628, {
    size: 15,
    color: 0x9fb6cf,
  });

  scene.addChild(valueLabel, valueNote, captionTop, captionBottom);

  const pad = (value) => String(Math.round(value)).padStart(2);
  const updateLabel = () => {
    // padded so the centered label doesn't shift between one and two digits
    valueLabel.text = `dash: ${pad(dashes.dash)}  gap: ${pad(dashes.gap)}`;
  };

  // Tween the uniforms through a few presets
  const loop = gsap.timeline({ repeat: -1, onUpdate: updateLabel });

  for (const preset of PRESETS) {
    loop.to(dashes, { ...preset, duration: 1.4, ease: 'sine.inOut', delay: 1.2 });
    loop.fromTo(
      valueLabel.scale,
      { x: 1.06, y: 1.06 },
      { x: 1, y: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: false },
      '<',
    );
  }

  gsap.to(ring, { rotation: Math.PI * 2, duration: 18, repeat: -1, ease: 'none' });
  gsap.to(hexagon, { rotation: -Math.PI * 2, duration: 30, repeat: -1, ease: 'none' });

  // Nodes breathe gently; transforms are cheap, the contexts are never redrawn
  gsap.to([hub, ...nodes].map((node) => node.scale), {
    x: 1.12,
    y: 1.12,
    duration: 1.3,
    ease: 'sine.inOut',
    stagger: { each: 0.25, repeat: -1, yoyo: true },
  });
})();
