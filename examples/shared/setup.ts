import { Application, Assets, Filter, Sprite } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
import { DustMotesFilter } from './DustMotesFilter';

import type { UnresolvedAsset } from 'pixi.js';

export const ASSET_BASE = 'https://pixijs.com/assets/standard';
export const DESIGN_W = 1280;
export const DESIGN_H = 720;

export function getAssetUrl(name: string) {
  const shape = name.split('-')[0];

  return `${ASSET_BASE}/${shape}/${name}.png`;
}

export async function setup(extraAssets: UnresolvedAsset[] = []) {
  const app = new Application();

  await app.init({ resizeTo: window, antialias: true, backgroundAlpha: 0 });
  document.body.appendChild(app.canvas);

  document.body.style.background = 'radial-gradient(ellipse at center, #2a3a50 0%, #131a26 55%, #060a10 100%)';

  Filter.defaultOptions.resolution = 'inherit';
  Filter.defaultOptions.antialias = true;

  await Assets.load([{ alias: 'background', src: `${ASSET_BASE}/bg-3.png` }, ...extraAssets]);

  const width = DESIGN_W;
  const height = DESIGN_H;

  const bg = Sprite.from('background');
  bg.anchor.set(0.5);
  bg.scale.set(1.5);
  bg.position.set(width / 2, height / 2);
  bg.filters = [
    new DustMotesFilter({ count: 60, speed: 1.0, size: 0.006, alpha: 0.6 }),
    new DropShadowFilter({ color: 0x000000, alpha: 0.5, blur: 4, quality: 10 }),
  ];
  app.stage.addChild(bg);

  function updateScale() {
    const scale = Math.min(app.screen.width / DESIGN_W, app.screen.height / DESIGN_H);
    app.stage.scale.set(scale);
    app.stage.position.set((app.screen.width - (DESIGN_W * scale)) / 2, (app.screen.height - (DESIGN_H * scale)) / 2);
  }

  updateScale();
  app.renderer.on('resize', updateScale);

  return { app, width, height };
}
