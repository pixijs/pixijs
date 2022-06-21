import { extensions } from 'pixi.js';
import { CanvasRenderer, canvasUtils } from '@pixi/canvas-renderer';
import { CanvasMeshRenderer } from '@pixi/canvas-mesh';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';
import { CanvasExtract } from '@pixi/canvas-extract';
import { CanvasPrepare } from '@pixi/canvas-prepare';
import '@pixi/canvas-sprite-tiling';
import '@pixi/canvas-particle-container';
import '@pixi/canvas-display';
import '@pixi/canvas-text';

extensions.add(
    CanvasExtract,
    CanvasGraphicsRenderer,
    CanvasMeshRenderer,
    CanvasPrepare,
    CanvasSpriteRenderer
);

// Export ES for those importing specifically by name,
// e.g., `import {autoDetectRenderer} from 'pixi.js-legacy'`
export * from 'pixi.js';
export {
    CanvasRenderer,
    CanvasGraphicsRenderer,
    CanvasMeshRenderer,
    CanvasSpriteRenderer,
    CanvasExtract,
    CanvasPrepare,
    canvasUtils,
};
