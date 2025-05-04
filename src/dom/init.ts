import { extensions } from '../extensions/Extensions';
import { DOMPipe } from './DOMPipe';

export * from './index';

extensions.add(DOMPipe);
