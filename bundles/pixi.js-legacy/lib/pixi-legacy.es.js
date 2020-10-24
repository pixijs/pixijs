/*!
 * pixi.js-legacy - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * pixi.js-legacy is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { AccessibilityManager, InteractionManager } from 'pixi.js';
export * from 'pixi.js';
import { CanvasRenderer } from '@pixi/canvas-renderer';
export { CanvasRenderer, canvasUtils } from '@pixi/canvas-renderer';
import { CanvasMeshRenderer } from '@pixi/canvas-mesh';
export { CanvasMeshRenderer } from '@pixi/canvas-mesh';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
export { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';
export { CanvasSpriteRenderer } from '@pixi/canvas-sprite';
import { CanvasExtract } from '@pixi/canvas-extract';
export { CanvasExtract } from '@pixi/canvas-extract';
import { CanvasPrepare } from '@pixi/canvas-prepare';
export { CanvasPrepare } from '@pixi/canvas-prepare';
import '@pixi/canvas-sprite-tiling';
import '@pixi/canvas-particles';
import '@pixi/canvas-display';
import '@pixi/canvas-text';

CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);
CanvasRenderer.registerPlugin('extract', CanvasExtract);
CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);
CanvasRenderer.registerPlugin('interaction', InteractionManager);
CanvasRenderer.registerPlugin('mesh', CanvasMeshRenderer);
CanvasRenderer.registerPlugin('prepare', CanvasPrepare);
CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);
//# sourceMappingURL=pixi-legacy.es.js.map
