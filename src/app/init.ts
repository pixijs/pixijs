import { extensions } from '../extensions/Extensions';
import { TickerPlugin } from '../ticker/TickerPlugin';
import { ResizePlugin } from './ResizePlugin';

extensions.add(ResizePlugin);
extensions.add(TickerPlugin);
