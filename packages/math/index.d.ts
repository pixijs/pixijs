/**
 * The Circle object is used to help draw graphics and can also be used to specify a hit area for displayObjects.
 *
 * @class
 * @memberof PIXI
 */
export declare class Circle
{
    x: number;
    y: number;
    radius: number;
    readonly type: SHAPES.CIRC;
    /**
     * @param {number} [x=0] - The X coordinate of the center of this circle
     * @param {number} [y=0] - The Y coordinate of the center of this circle
     * @param {number} [radius=0] - The radius of the circle
     */
    constructor(x?: number, y?: number, radius?: number);
    /**
     * Creates a clone of this Circle instance
     *
     * @return {PIXI.Circle} a copy of the Circle
     */
    clone(): Circle;
    /**
     * Checks whether the x and y coordinates given are contained within this circle
     *
     * @param {number} x - The X coordinate of the point to test
     * @param {number} y - The Y coordinate of the point to test
     * @return {boolean} Whether the x/y coordinates are within this Circle
     */
    contains(x: number, y: number): boolean;
    /**
    * Returns the framing rectangle of the circle as a Rectangle object
    *
    * @return {PIXI.Rectangle} the framing rectangle
    */
    getBounds(): Rectangle;
}

/**
 * Conversion factor for converting degrees to radians.
 *
 * @static
 * @member {number}
 * @memberof PIXI
 */
export declare const DEG_TO_RAD: number;

/**
 * The Ellipse object is used to help draw graphics and can also be used to specify a hit area for displayObjects.
 *
 * @class
 * @memberof PIXI
 */
export declare class Ellipse
{
    x: number;
    y: number;
    width: number;
    height: number;
    readonly type: SHAPES.ELIP;
    /**
     * @param {number} [x=0] - The X coordinate of the center of this ellipse
     * @param {number} [y=0] - The Y coordinate of the center of this ellipse
     * @param {number} [halfWidth=0] - The half width of this ellipse
     * @param {number} [halfHeight=0] - The half height of this ellipse
     */
    constructor(x?: number, y?: number, halfWidth?: number, halfHeight?: number);
    /**
     * Creates a clone of this Ellipse instance
     *
     * @return {PIXI.Ellipse} a copy of the ellipse
     */
    clone(): Ellipse;
    /**
     * Checks whether the x and y coordinates given are contained within this ellipse
     *
     * @param {number} x - The X coordinate of the point to test
     * @param {number} y - The Y coordinate of the point to test
     * @return {boolean} Whether the x/y coords are within this ellipse
     */
    contains(x: number, y: number): boolean;
    /**
     * Returns the framing rectangle of the ellipse as a Rectangle object
     *
     * @return {PIXI.Rectangle} the framing rectangle
     */
    getBounds(): Rectangle;
}

declare type GD8Symmetry = number;

/**
 * Implements the dihedral group D8, which is similar to
 * [group D4]{@link http://mathworld.wolfram.com/DihedralGroupD4.html};
 * D8 is the same but with diagonals, and it is used for texture
 * rotations.
 *
 * The directions the U- and V- axes after rotation
 * of an angle of `a: GD8Constant` are the vectors `(uX(a), uY(a))`
 * and `(vX(a), vY(a))`. These aren't necessarily unit vectors.
 *
 * **Origin:**<br>
 *  This is the small part of gameofbombs.com portal system. It works.
 *
 * @see PIXI.groupD8.E
 * @see PIXI.groupD8.SE
 * @see PIXI.groupD8.S
 * @see PIXI.groupD8.SW
 * @see PIXI.groupD8.W
 * @see PIXI.groupD8.NW
 * @see PIXI.groupD8.N
 * @see PIXI.groupD8.NE
 * @author Ivan @ivanpopelyshev
 * @namespace PIXI.groupD8
 * @memberof PIXI
 */
export declare const groupD8: {
    /**
     * | Rotation | Direction |
     * |----------|-----------|
     * | 0°       | East      |
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    E: number;
    /**
     * | Rotation | Direction |
     * |----------|-----------|
     * | 45°↻     | Southeast |
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    SE: number;
    /**
     * | Rotation | Direction |
     * |----------|-----------|
     * | 90°↻     | South     |
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    S: number;
    /**
     * | Rotation | Direction |
     * |----------|-----------|
     * | 135°↻    | Southwest |
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    SW: number;
    /**
     * | Rotation | Direction |
     * |----------|-----------|
     * | 180°     | West      |
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    W: number;
    /**
     * | Rotation    | Direction    |
     * |-------------|--------------|
     * | -135°/225°↻ | Northwest    |
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    NW: number;
    /**
     * | Rotation    | Direction    |
     * |-------------|--------------|
     * | -90°/270°↻  | North        |
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    N: number;
    /**
     * | Rotation    | Direction    |
     * |-------------|--------------|
     * | -45°/315°↻  | Northeast    |
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    NE: number;
    /**
     * Reflection about Y-axis.
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    MIRROR_VERTICAL: number;
    /**
     * Reflection about the main diagonal.
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    MAIN_DIAGONAL: number;
    /**
     * Reflection about X-axis.
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    MIRROR_HORIZONTAL: number;
    /**
     * Reflection about reverse diagonal.
     *
     * @memberof PIXI.groupD8
     * @constant {PIXI.GD8Symmetry}
     */
    REVERSE_DIAGONAL: number;
    /**
     * @memberof PIXI.groupD8
     * @param {PIXI.GD8Symmetry} ind - sprite rotation angle.
     * @return {PIXI.GD8Symmetry} The X-component of the U-axis
     *    after rotating the axes.
     */
    uX: (ind: GD8Symmetry) => GD8Symmetry;
    /**
     * @memberof PIXI.groupD8
     * @param {PIXI.GD8Symmetry} ind - sprite rotation angle.
     * @return {PIXI.GD8Symmetry} The Y-component of the U-axis
     *    after rotating the axes.
     */
    uY: (ind: GD8Symmetry) => GD8Symmetry;
    /**
     * @memberof PIXI.groupD8
     * @param {PIXI.GD8Symmetry} ind - sprite rotation angle.
     * @return {PIXI.GD8Symmetry} The X-component of the V-axis
     *    after rotating the axes.
     */
    vX: (ind: GD8Symmetry) => GD8Symmetry;
    /**
     * @memberof PIXI.groupD8
     * @param {PIXI.GD8Symmetry} ind - sprite rotation angle.
     * @return {PIXI.GD8Symmetry} The Y-component of the V-axis
     *    after rotating the axes.
     */
    vY: (ind: GD8Symmetry) => GD8Symmetry;
    /**
     * @memberof PIXI.groupD8
     * @param {PIXI.GD8Symmetry} rotation - symmetry whose opposite
     *   is needed. Only rotations have opposite symmetries while
     *   reflections don't.
     * @return {PIXI.GD8Symmetry} The opposite symmetry of `rotation`
     */
    inv: (rotation: GD8Symmetry) => GD8Symmetry;
    /**
     * Composes the two D8 operations.
     *
     * Taking `^` as reflection:
     *
     * |       | E=0 | S=2 | W=4 | N=6 | E^=8 | S^=10 | W^=12 | N^=14 |
     * |-------|-----|-----|-----|-----|------|-------|-------|-------|
     * | E=0   | E   | S   | W   | N   | E^   | S^    | W^    | N^    |
     * | S=2   | S   | W   | N   | E   | S^   | W^    | N^    | E^    |
     * | W=4   | W   | N   | E   | S   | W^   | N^    | E^    | S^    |
     * | N=6   | N   | E   | S   | W   | N^   | E^    | S^    | W^    |
     * | E^=8  | E^  | N^  | W^  | S^  | E    | N     | W     | S     |
     * | S^=10 | S^  | E^  | N^  | W^  | S    | E     | N     | W     |
     * | W^=12 | W^  | S^  | E^  | N^  | W    | S     | E     | N     |
     * | N^=14 | N^  | W^  | S^  | E^  | N    | W     | S     | E     |
     *
     * [This is a Cayley table]{@link https://en.wikipedia.org/wiki/Cayley_table}
     * @memberof PIXI.groupD8
     * @param {PIXI.GD8Symmetry} rotationSecond - Second operation, which
     *   is the row in the above cayley table.
     * @param {PIXI.GD8Symmetry} rotationFirst - First operation, which
     *   is the column in the above cayley table.
     * @return {PIXI.GD8Symmetry} Composed operation
     */
    add: (rotationSecond: GD8Symmetry, rotationFirst: GD8Symmetry) => GD8Symmetry;
    /**
     * Reverse of `add`.
     *
     * @memberof PIXI.groupD8
     * @param {PIXI.GD8Symmetry} rotationSecond - Second operation
     * @param {PIXI.GD8Symmetry} rotationFirst - First operation
     * @return {PIXI.GD8Symmetry} Result
     */
    sub: (rotationSecond: GD8Symmetry, rotationFirst: GD8Symmetry) => GD8Symmetry;
    /**
     * Adds 180 degrees to rotation, which is a commutative
     * operation.
     *
     * @memberof PIXI.groupD8
     * @param {number} rotation - The number to rotate.
     * @returns {number} Rotated number
     */
    rotate180: (rotation: number) => number;
    /**
     * Checks if the rotation angle is vertical, i.e. south
     * or north. It doesn't work for reflections.
     *
     * @memberof PIXI.groupD8
     * @param {PIXI.GD8Symmetry} rotation - The number to check.
     * @returns {boolean} Whether or not the direction is vertical
     */
    isVertical: (rotation: GD8Symmetry) => boolean;
    /**
     * Approximates the vector `V(dx,dy)` into one of the
     * eight directions provided by `groupD8`.
     *
     * @memberof PIXI.groupD8
     * @param {number} dx - X-component of the vector
     * @param {number} dy - Y-component of the vector
     * @return {PIXI.GD8Symmetry} Approximation of the vector into
     *  one of the eight symmetries.
     */
    byDirection: (dx: number, dy: number) => GD8Symmetry;
    /**
     * Helps sprite to compensate texture packer rotation.
     *
     * @memberof PIXI.groupD8
     * @param {PIXI.Matrix} matrix - sprite world matrix
     * @param {PIXI.GD8Symmetry} rotation - The rotation factor to use.
     * @param {number} tx - sprite anchoring
     * @param {number} ty - sprite anchoring
     */
    matrixAppendRotationInv: (matrix: Matrix, rotation: GD8Symmetry, tx?: number, ty?: number) => void;
};

export declare interface IPoint extends IPointData {
    copyFrom(p: IPointData): this;
    copyTo<T extends IPoint>(p: T): T;
    equals(p: IPointData): boolean;
    set(x?: number, y?: number): void;
}

export declare interface IPointData {
    x: number;
    y: number;
}

export declare type IShape = Circle | Ellipse | Polygon | Rectangle | RoundedRectangle;

export declare interface ISize {
    width: number;
    height: number;
}

/**
 * The PixiJS Matrix as a class makes it a lot faster.
 *
 * Here is a representation of it:
 * ```js
 * | a | c | tx|
 * | b | d | ty|
 * | 0 | 0 | 1 |
 * ```
 * @class
 * @memberof PIXI
 */
export declare class Matrix
{
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
    array: Float32Array | null;
    /**
     * @param {number} [a=1] - x scale
     * @param {number} [b=0] - x skew
     * @param {number} [c=0] - y skew
     * @param {number} [d=1] - y scale
     * @param {number} [tx=0] - x translation
     * @param {number} [ty=0] - y translation
     */
    constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
    /**
     * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
     *
     * a = array[0]
     * b = array[1]
     * c = array[3]
     * d = array[4]
     * tx = array[2]
     * ty = array[5]
     *
     * @param {number[]} array - The array that the matrix will be populated from.
     */
    fromArray(array: number[]): void;
    /**
     * sets the matrix properties
     *
     * @param {number} a - Matrix component
     * @param {number} b - Matrix component
     * @param {number} c - Matrix component
     * @param {number} d - Matrix component
     * @param {number} tx - Matrix component
     * @param {number} ty - Matrix component
     *
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    set(a: number, b: number, c: number, d: number, tx: number, ty: number): this;
    /**
     * Creates an array from the current Matrix object.
     *
     * @param {boolean} transpose - Whether we need to transpose the matrix or not
     * @param {Float32Array} [out=new Float32Array(9)] - If provided the array will be assigned to out
     * @return {number[]} the newly created array which contains the matrix
     */
    toArray(transpose: boolean, out?: Float32Array): Float32Array;
    /**
     * Get a new position with the current transformation applied.
     * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
     *
     * @param {PIXI.IPointData} pos - The origin
     * @param {PIXI.Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
     * @return {PIXI.Point} The new point, transformed through this matrix
     */
    apply<P extends IPointData = Point>(pos: IPointData, newPos?: P): P;
    /**
     * Get a new position with the inverse of the current transformation applied.
     * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
     *
     * @param {PIXI.IPointData} pos - The origin
     * @param {PIXI.Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
     * @return {PIXI.Point} The new point, inverse-transformed through this matrix
     */
    applyInverse<P extends IPointData = Point>(pos: IPointData, newPos?: P): P;
    /**
     * Translates the matrix on the x and y.
     *
     * @param {number} x - How much to translate x by
     * @param {number} y - How much to translate y by
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    translate(x: number, y: number): this;
    /**
     * Applies a scale transformation to the matrix.
     *
     * @param {number} x - The amount to scale horizontally
     * @param {number} y - The amount to scale vertically
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    scale(x: number, y: number): this;
    /**
     * Applies a rotation transformation to the matrix.
     *
     * @param {number} angle - The angle in radians.
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    rotate(angle: number): this;
    /**
     * Appends the given Matrix to this Matrix.
     *
     * @param {PIXI.Matrix} matrix - The matrix to append.
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    append(matrix: Matrix): this;
    /**
     * Sets the matrix based on all the available properties
     *
     * @param {number} x - Position on the x axis
     * @param {number} y - Position on the y axis
     * @param {number} pivotX - Pivot on the x axis
     * @param {number} pivotY - Pivot on the y axis
     * @param {number} scaleX - Scale on the x axis
     * @param {number} scaleY - Scale on the y axis
     * @param {number} rotation - Rotation in radians
     * @param {number} skewX - Skew on the x axis
     * @param {number} skewY - Skew on the y axis
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    setTransform(x: number, y: number, pivotX: number, pivotY: number, scaleX: number, scaleY: number, rotation: number, skewX: number, skewY: number): this;
    /**
     * Prepends the given Matrix to this Matrix.
     *
     * @param {PIXI.Matrix} matrix - The matrix to prepend
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    prepend(matrix: Matrix): this;
    /**
     * Decomposes the matrix (x, y, scaleX, scaleY, and rotation) and sets the properties on to a transform.
     *
     * @param {PIXI.Transform} transform - The transform to apply the properties to.
     * @return {PIXI.Transform} The transform with the newly applied properties
     */
    decompose(transform: Transform): Transform;
    /**
     * Inverts this matrix
     *
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    invert(): this;
    /**
     * Resets this Matrix to an identity (default) matrix.
     *
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    identity(): this;
    /**
     * Creates a new Matrix object with the same values as this one.
     *
     * @return {PIXI.Matrix} A copy of this matrix. Good for chaining method calls.
     */
    clone(): Matrix;
    /**
     * Changes the values of the given matrix to be the same as the ones in this matrix
     *
     * @param {PIXI.Matrix} matrix - The matrix to copy to.
     * @return {PIXI.Matrix} The matrix given in parameter with its values updated.
     */
    copyTo(matrix: Matrix): Matrix;
    /**
     * Changes the values of the matrix to be the same as the ones in given matrix
     *
     * @param {PIXI.Matrix} matrix - The matrix to copy from.
     * @return {PIXI.Matrix} this
     */
    copyFrom(matrix: Matrix): this;
    /**
     * A default (identity) matrix
     *
     * @static
     * @const
     * @member {PIXI.Matrix}
     */
    static get IDENTITY(): Matrix;
    /**
     * A temp matrix
     *
     * @static
     * @const
     * @member {PIXI.Matrix}
     */
    static get TEMP_MATRIX(): Matrix;
}

/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * An ObservablePoint is a point that triggers a callback when the point's position is changed.
 *
 * @class
 * @memberof PIXI
 * @implements IPoint
 */
export declare class ObservablePoint<T = any> implements IPoint
{
    cb: (this: T) => any;
    scope: any;
    _x: number;
    _y: number;
    /**
     * @param {Function} cb - callback when changed
     * @param {object} scope - owner of callback
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    constructor(cb: (this: T) => any, scope: T, x?: number, y?: number);
    /**
     * Creates a clone of this point.
     * The callback and scope params can be overidden otherwise they will default
     * to the clone object's values.
     *
     * @override
     * @param {Function} [cb=null] - callback when changed
     * @param {object} [scope=null] - owner of callback
     * @return {PIXI.ObservablePoint} a copy of the point
     */
    clone(cb?: (this: T) => any, scope?: any): ObservablePoint;
    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     *
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=x] - position of the point on the y axis
     * @returns {this} Returns itself.
     */
    set(x?: number, y?: number): this;
    /**
     * Copies x and y from the given point
     *
     * @param {PIXI.IPointData} p - The point to copy from.
     * @returns {this} Returns itself.
     */
    copyFrom(p: IPointData): this;
    /**
     * Copies x and y into the given point
     *
     * @param {PIXI.IPoint} p - The point to copy.
     * @returns {PIXI.IPoint} Given point with values updated
     */
    copyTo<T extends IPoint>(p: T): T;
    /**
     * Returns true if the given point is equal to this point
     *
     * @param {PIXI.IPointData} p - The point to check
     * @returns {boolean} Whether the given point equal to this point
     */
    equals(p: IPointData): boolean;
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     */
    get x(): number;
    set x(value: number);
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     */
    get y(): number;
    set y(value: number);
}

/**
 * Two Pi.
 *
 * @static
 * @member {number}
 * @memberof PIXI
 */
export declare const PI_2: number;

/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @memberof PIXI
 * @implements IPoint
 */
export declare class Point implements IPoint
{
    x: number;
    y: number;
    /**
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    constructor(x?: number, y?: number);
    /**
     * Creates a clone of this point
     *
     * @return {PIXI.Point} a copy of the point
     */
    clone(): Point;
    /**
     * Copies x and y from the given point
     *
     * @param {PIXI.IPointData} p - The point to copy from
     * @returns {this} Returns itself.
     */
    copyFrom(p: IPointData): this;
    /**
     * Copies x and y into the given point
     *
     * @param {PIXI.IPoint} p - The point to copy.
     * @returns {PIXI.IPoint} Given point with values updated
     */
    copyTo<T extends IPoint>(p: T): T;
    /**
     * Returns true if the given point is equal to this point
     *
     * @param {PIXI.IPointData} p - The point to check
     * @returns {boolean} Whether the given point equal to this point
     */
    equals(p: IPointData): boolean;
    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     *
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=x] - position of the point on the y axis
     * @returns {this} Returns itself.
     */
    set(x?: number, y?: number): this;
}

/**
 * A class to define a shape via user defined co-orinates.
 *
 * @class
 * @memberof PIXI
 */
export declare class Polygon
{
    points: number[];
    closeStroke: boolean;
    readonly type: SHAPES.POLY;
    constructor(points: IPoint[] | number[]);
    constructor(...points: IPoint[] | number[]);
    /**
     * Creates a clone of this polygon
     *
     * @return {PIXI.Polygon} a copy of the polygon
     */
    clone(): Polygon;
    /**
     * Checks whether the x and y coordinates passed to this function are contained within this polygon
     *
     * @param {number} x - The X coordinate of the point to test
     * @param {number} y - The Y coordinate of the point to test
     * @return {boolean} Whether the x/y coordinates are within this polygon
     */
    contains(x: number, y: number): boolean;
}

/**
 * Conversion factor for converting radians to degrees.
 *
 * @static
 * @member {number} RAD_TO_DEG
 * @memberof PIXI
 */
export declare const RAD_TO_DEG: number;

/**
 * Size object, contains width and height
 *
 * @memberof PIXI
 * @typedef {object} ISize@typedef {object} ISize
 * @property {number} width - Width component
 * @property {number} height - Height component
 */
/**
 * Rectangle object is an area defined by its position, as indicated by its top-left corner
 * point (x, y) and by its width and its height.
 *
 * @class
 * @memberof PIXI
 */
export declare class Rectangle
{
    x: number;
    y: number;
    width: number;
    height: number;
    readonly type: SHAPES.RECT;
    /**
     * @param {number} [x=0] - The X coordinate of the upper-left corner of the rectangle
     * @param {number} [y=0] - The Y coordinate of the upper-left corner of the rectangle
     * @param {number} [width=0] - The overall width of this rectangle
     * @param {number} [height=0] - The overall height of this rectangle
     */
    constructor(x?: number, y?: number, width?: number, height?: number);
    /**
     * returns the left edge of the rectangle
     *
     * @member {number}
     */
    get left(): number;
    /**
     * returns the right edge of the rectangle
     *
     * @member {number}
     */
    get right(): number;
    /**
     * returns the top edge of the rectangle
     *
     * @member {number}
     */
    get top(): number;
    /**
     * returns the bottom edge of the rectangle
     *
     * @member {number}
     */
    get bottom(): number;
    /**
     * A constant empty rectangle.
     *
     * @static
     * @constant
     * @member {PIXI.Rectangle}
     * @return {PIXI.Rectangle} An empty rectangle
     */
    static get EMPTY(): Rectangle;
    /**
     * Creates a clone of this Rectangle
     *
     * @return {PIXI.Rectangle} a copy of the rectangle
     */
    clone(): Rectangle;
    /**
     * Copies another rectangle to this one.
     *
     * @param {PIXI.Rectangle} rectangle - The rectangle to copy from.
     * @return {PIXI.Rectangle} Returns itself.
     */
    copyFrom(rectangle: Rectangle): Rectangle;
    /**
     * Copies this rectangle to another one.
     *
     * @param {PIXI.Rectangle} rectangle - The rectangle to copy to.
     * @return {PIXI.Rectangle} Returns given parameter.
     */
    copyTo(rectangle: Rectangle): Rectangle;
    /**
     * Checks whether the x and y coordinates given are contained within this Rectangle
     *
     * @param {number} x - The X coordinate of the point to test
     * @param {number} y - The Y coordinate of the point to test
     * @return {boolean} Whether the x/y coordinates are within this Rectangle
     */
    contains(x: number, y: number): boolean;
    /**
     * Pads the rectangle making it grow in all directions.
     * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
     *
     * @param {number} [paddingX=0] - The horizontal padding amount.
     * @param {number} [paddingY=0] - The vertical padding amount.
     * @return {PIXI.Rectangle} Returns itself.
     */
    pad(paddingX?: number, paddingY?: number): this;
    /**
     * Fits this rectangle around the passed one.
     *
     * @param {PIXI.Rectangle} rectangle - The rectangle to fit.
     * @return {PIXI.Rectangle} Returns itself.
     */
    fit(rectangle: Rectangle): this;
    /**
     * Enlarges rectangle that way its corners lie on grid
     *
     * @param {number} [resolution=1] - resolution
     * @param {number} [eps=0.001] - precision
     * @return {PIXI.Rectangle} Returns itself.
     */
    ceil(resolution?: number, eps?: number): this;
    /**
     * Enlarges this rectangle to include the passed rectangle.
     *
     * @param {PIXI.Rectangle} rectangle - The rectangle to include.
     * @return {PIXI.Rectangle} Returns itself.
     */
    enlarge(rectangle: Rectangle): this;
}

/**
 * The Rounded Rectangle object is an area that has nice rounded corners, as indicated by its
 * top-left corner point (x, y) and by its width and its height and its radius.
 *
 * @class
 * @memberof PIXI
 */
export declare class RoundedRectangle
{
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    readonly type: SHAPES.RREC;
    /**
     * @param {number} [x=0] - The X coordinate of the upper-left corner of the rounded rectangle
     * @param {number} [y=0] - The Y coordinate of the upper-left corner of the rounded rectangle
     * @param {number} [width=0] - The overall width of this rounded rectangle
     * @param {number} [height=0] - The overall height of this rounded rectangle
     * @param {number} [radius=20] - Controls the radius of the rounded corners
     */
    constructor(x?: number, y?: number, width?: number, height?: number, radius?: number);
    /**
     * Creates a clone of this Rounded Rectangle
     *
     * @return {PIXI.RoundedRectangle} a copy of the rounded rectangle
     */
    clone(): RoundedRectangle;
    /**
     * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
     *
     * @param {number} x - The X coordinate of the point to test
     * @param {number} y - The Y coordinate of the point to test
     * @return {boolean} Whether the x/y coordinates are within this Rounded Rectangle
     */
    contains(x: number, y: number): boolean;
}

/**
 * Constants that identify shapes, mainly to prevent `instanceof` calls.
 *
 * @static
 * @memberof PIXI
 * @enum {number}
 * @property {number} POLY Polygon
 * @property {number} RECT Rectangle
 * @property {number} CIRC Circle
 * @property {number} ELIP Ellipse
 * @property {number} RREC Rounded Rectangle
 */
export declare enum SHAPES {
    POLY = 0,
    RECT = 1,
    CIRC = 2,
    ELIP = 3,
    RREC = 4
}

/**
 * Transform that takes care about its versions
 *
 * @class
 * @memberof PIXI
 */
export declare class Transform
{
    /**
     * A default (identity) transform
     *
     * @static
     * @constant
     * @member {PIXI.Transform}
     */
    static readonly IDENTITY: Transform;
    worldTransform: Matrix;
    localTransform: Matrix;
    position: ObservablePoint;
    scale: ObservablePoint;
    pivot: ObservablePoint;
    skew: ObservablePoint;
    _parentID: number;
    _worldID: number;
    protected _rotation: number;
    protected _cx: number;
    protected _sx: number;
    protected _cy: number;
    protected _sy: number;
    protected _localID: number;
    protected _currentLocalID: number;
    constructor();
    /**
     * Called when a value changes.
     *
     * @protected
     */
    protected onChange(): void;
    /**
     * Called when the skew or the rotation changes.
     *
     * @protected
     */
    protected updateSkew(): void;
    /**
     * Updates the local transformation matrix.
     */
    updateLocalTransform(): void;
    /**
     * Updates the local and the world transformation matrices.
     *
     * @param {PIXI.Transform} parentTransform - The parent transform
     */
    updateTransform(parentTransform: Transform): void;
    /**
     * Decomposes a matrix and sets the transforms properties based on it.
     *
     * @param {PIXI.Matrix} matrix - The matrix to decompose
     */
    setFromMatrix(matrix: Matrix): void;
    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     */
    get rotation(): number;
    set rotation(value: number);
}

export { };
