import { extensions } from '../extensions/Extensions';
import { CullerPlugin } from './CullerPlugin';
import { ResizePlugin } from './ResizePlugin';
import { TickerPlugin } from './TickerPlugin';

extensions.add(ResizePlugin);
extensions.add(TickerPlugin);
extensions.add(CullerPlugin);
