import { ObservablePoint } from '../maths/point/ObservablePoint';
import { Point } from '../maths/point/Point';
import { mixins } from './pointExtras';
import './rectangleExtras';

Object.assign(Point.prototype, mixins);
Object.assign(ObservablePoint.prototype, mixins);
