import { extensions } from '../../extensions/Extensions';
import { CanvasGraphicsContextSystem } from './canvas/CanvasGraphicsContextSystem';
import { CanvasGraphicsPipe } from './canvas/CanvasGraphicsPipe';
import { GraphicsContextSystem } from './shared/GraphicsContextSystem';
import { GraphicsPipe } from './shared/GraphicsPipe';

extensions.add(CanvasGraphicsPipe);
extensions.add(GraphicsPipe);
extensions.add(CanvasGraphicsContextSystem);
extensions.add(GraphicsContextSystem);
