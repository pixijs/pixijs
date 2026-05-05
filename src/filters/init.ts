import { extensions } from '../extensions/Extensions';
import { CanvasFilterSystem } from './CanvasFilterSystem';
import { FilterPipe } from './FilterPipe';
import { FilterSystem } from './FilterSystem';

extensions.add(FilterSystem, CanvasFilterSystem);
extensions.add(FilterPipe);
