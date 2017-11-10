import { InteractionManager } from '@pixi/interaction';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { CanvasMeshRenderer } from '@pixi/canvas-mesh';
import { CanvasExtract } from '@pixi/canvas-extract';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { CanvasPrepare } from '@pixi/canvas-prepare';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';
import { AccessibilityManager } from '@pixi/accessibility';

CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);
CanvasRenderer.registerPlugin('extract', CanvasExtract);
CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);
CanvasRenderer.registerPlugin('interaction', InteractionManager);
CanvasRenderer.registerPlugin('mesh', CanvasMeshRenderer);
CanvasRenderer.registerPlugin('prepare', CanvasPrepare);
CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);
