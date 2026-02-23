import { extensions } from '../../extensions/Extensions';
import { CanvasTextPipe } from './canvas/CanvasTextPipe';
import { CanvasRendererTextSystem } from './canvas/CanvasTextSystem';
import { CanvasTextSystem } from './shared/GpuTextSystem';

extensions.add(CanvasRendererTextSystem);
extensions.add(CanvasTextSystem);
extensions.add(CanvasTextPipe);
