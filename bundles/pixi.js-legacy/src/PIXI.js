import '@pixi/polyfill';

export * from 'pixi.js/src/PIXI';
export * from '@pixi/canvas-renderer';
export * from '@pixi/canvas-graphics';
export * from '@pixi/canvas-mesh';
export * from '@pixi/canvas-sprite';

import { Application, accessibility, interaction, prepare, extract } from 'pixi.js/src/PIXI';
import { CanvasRenderer, autoDetectRenderer } from '@pixi/canvas-renderer';
import { CanvasMeshRenderer } from '@pixi/canvas-mesh';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';
import * as canvasExtract from '@pixi/canvas-extract';
import * as canvasPrepare from '@pixi/canvas-prepare';

CanvasRenderer.registerPlugin('accessibility', accessibility.AccessibilityManager);
CanvasRenderer.registerPlugin('extract', canvasExtract.CanvasExtract);
CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);
CanvasRenderer.registerPlugin('interaction', interaction.InteractionManager);
CanvasRenderer.registerPlugin('mesh', CanvasMeshRenderer);
CanvasRenderer.registerPlugin('prepare', canvasPrepare.CanvasPrepare);
CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);

Object.assign(prepare, canvasPrepare);
Object.assign(extract, canvasExtract);

Application.prototype.createRenderer = autoDetectRenderer;

import '@pixi/canvas-sprite-tiling';
import '@pixi/canvas-display';
