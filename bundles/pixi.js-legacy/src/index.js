import { accessibility, interaction, prepare, extract } from 'pixi.js';
import { CanvasRenderer, CanvasTinter } from '@pixi/canvas-renderer';
import { CanvasMeshRenderer } from '@pixi/canvas-mesh';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';
import * as canvasExtract from '@pixi/canvas-extract';
import * as canvasPrepare from '@pixi/canvas-prepare';
import '@pixi/canvas-sprite-tiling';
import '@pixi/canvas-particles';
import '@pixi/canvas-display';

CanvasRenderer.registerPlugin('accessibility', accessibility.AccessibilityManager);
CanvasRenderer.registerPlugin('extract', canvasExtract.CanvasExtract);
CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);
CanvasRenderer.registerPlugin('interaction', interaction.InteractionManager);
CanvasRenderer.registerPlugin('mesh', CanvasMeshRenderer);
CanvasRenderer.registerPlugin('prepare', canvasPrepare.CanvasPrepare);
CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);

Object.assign(prepare, canvasPrepare);
Object.assign(extract, canvasExtract);

// Export ES for those importing specifically by name,
// e.g., `import {autoDetectRenderer} from 'pixi.js-legacy'`
export * from 'pixi.js';
export {
    CanvasRenderer,
    CanvasGraphicsRenderer,
    CanvasMeshRenderer,
    CanvasSpriteRenderer,
    CanvasTinter,
};
