import '@pixi/polyfill';

export * from 'pixi-modern';
export * from '@pixi/canvas-renderer';
export * from '@pixi/canvas-graphics';
export * from '@pixi/canvas-mesh';
export * from '@pixi/canvas-sprite';

import { InteractionManager } from '@pixi/interaction';
import { CanvasRenderer, autoDetectRenderer } from '@pixi/canvas-renderer';
import { CanvasMeshRenderer } from '@pixi/canvas-mesh';
import * as canvasExtract from '@pixi/canvas-extract';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import * as canvasPrepare from '@pixi/canvas-prepare';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';
import { AccessibilityManager } from '@pixi/accessibility';

CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);
CanvasRenderer.registerPlugin('extract', canvasExtract.CanvasExtract);
CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);
CanvasRenderer.registerPlugin('interaction', InteractionManager);
CanvasRenderer.registerPlugin('mesh', CanvasMeshRenderer);
CanvasRenderer.registerPlugin('prepare', canvasPrepare.CanvasPrepare);
CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);

import { prepare, extract } from 'pixi-modern';
Object.assign(prepare, canvasPrepare);
Object.assign(extract, canvasExtract);

import { Application } from '@pixi/app';
Application.prototype.createRenderer = autoDetectRenderer;

import '@pixi/canvas-sprite-tiling';
