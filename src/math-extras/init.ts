import { ObservablePoint } from '../maths/point/ObservablePoint';
import { Point } from '../maths/point/Point';
import { mixins } from './pointExtras';
import './MathExtraMixins.d.ts';

// Point.mixin(mixins);
Object.assign(Point.prototype, mixins);
Object.assign(ObservablePoint.prototype, mixins);
