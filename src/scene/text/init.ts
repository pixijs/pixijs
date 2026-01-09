import { extensions } from '../../extensions/Extensions';
import { CanvasTextPipe } from './canvas/CanvasTextPipe';
import { CanvasTextSystem } from './canvas/CanvasTextSystem';
import { GpuTextSystem } from './shared/GpuTextSystem';

extensions.add(CanvasTextSystem);
extensions.add(GpuTextSystem);
extensions.add(CanvasTextPipe);
