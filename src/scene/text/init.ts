import { extensions } from '../../extensions/Extensions';
import { CanvasTextPipe } from './canvas/CanvasTextPipe';
import { CanvasTextSystem } from './canvas/CanvasTextSystem';
import './utils/text-split/canvasTextSplit';

extensions.add(CanvasTextSystem);
extensions.add(CanvasTextPipe);
