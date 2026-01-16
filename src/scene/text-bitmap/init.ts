import { extensions } from '../../extensions/Extensions';
import { CanvasBitmapTextPipe } from './CanvasBitmapTextPipe';
import { BitmapTextPipe } from './GpuBitmapTextPipe';

extensions.add(CanvasBitmapTextPipe);
extensions.add(BitmapTextPipe);
