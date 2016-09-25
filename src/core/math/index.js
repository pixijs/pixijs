import Point from './Point';
import ObservablePoint from './ObservablePoint';
import Matrix from './Matrix';
import GroupD8 from './GroupD8';

import Circle from './shapes/Circle';
import Ellipse from './shapes/Ellipse';
import Polygon from './shapes/Polygon';
import Rectangle from './shapes/Rectangle';
import RoundedRectangle from './shapes/RoundedRectangle';

/**
 * Math classes and utilities mixed into PIXI namespace.
 *
 * @lends PIXI
 */
export default {
    // These will be mixed to be made publicly available,
    // while this module is used internally in core
    // to avoid circular dependencies and cut down on
    // internal module requires.

    Point,
    ObservablePoint,
    Matrix,
    GroupD8,

    Circle,
    Ellipse,
    Polygon,
    Rectangle,
    RoundedRectangle
};
