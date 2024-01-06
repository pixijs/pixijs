import { ObservablePoint } from '../maths/point/ObservablePoint';
import { Point } from '../maths/point/Point';
import { Rectangle } from '../maths/shapes/Rectangle';
import { pointExtraMixins } from './pointExtras';
import { rectangleExtraMixins } from './rectangleExtras';

Object.assign(Point.prototype, pointExtraMixins);
Object.assign(ObservablePoint.prototype, pointExtraMixins);
Object.assign(Rectangle.prototype, rectangleExtraMixins);
