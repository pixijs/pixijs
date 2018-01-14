import '@pixi/polyfill';

import { PIXI } from 'pixi.js';
import { autoDetectRenderer, CanvasRenderer } from '@pixi/canvas-renderer';
import { CanvasMeshRenderer } from '@pixi/canvas-mesh';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { CanvasSpriteRenderer, CanvasTinter } from '@pixi/canvas-sprite';
import * as canvasExtract from '@pixi/canvas-extract';
import * as canvasPrepare from '@pixi/canvas-prepare';
import '@pixi/canvas-sprite-tiling';
import '@pixi/canvas-particles';
import '@pixi/canvas-display';

CanvasRenderer.registerPlugin('accessibility', PIXI.accessibility.AccessibilityManager);
CanvasRenderer.registerPlugin('extract', canvasExtract.CanvasExtract);
CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);
CanvasRenderer.registerPlugin('interaction', PIXI.interaction.InteractionManager);
CanvasRenderer.registerPlugin('mesh', CanvasMeshRenderer);
CanvasRenderer.registerPlugin('prepare', canvasPrepare.CanvasPrepare);
CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);

Object.assign(PIXI.prepare, canvasPrepare);
Object.assign(PIXI.extract, canvasExtract);

PIXI.Application.prototype.createRenderer = autoDetectRenderer;

// Add to namespace window object for people doing `import 'pixi.js-legacy'`
Object.assign(PIXI, {
    autoDetectRenderer,
    CanvasRenderer,
    CanvasGraphicsRenderer,
    CanvasMeshRenderer,
    CanvasSpriteRenderer,
    CanvasTinter,
});

// Export ES for those importing specifically by name,
// e.g., `import {autoDetectRenderer} from 'pixi.js-legacy'`
export * from 'pixi.js';
export {
    autoDetectRenderer,
    CanvasRenderer,
    CanvasGraphicsRenderer,
    CanvasMeshRenderer,
    CanvasSpriteRenderer,
    CanvasTinter,
};
