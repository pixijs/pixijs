import { deprecation, v8_0_0 } from '../../../utils/logging/deprecation';
import { ViewContainer } from '../../view/View';
import { GraphicsContext } from './GraphicsContext';

import type { ColorSource } from '../../../color/Color';
import type { Matrix } from '../../../maths/matrix/Matrix';
import type { PointData } from '../../../maths/point/PointData';
import type { Instruction } from '../../../rendering/renderers/shared/instructions/Instruction';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Bounds } from '../../container/bounds/Bounds';
import type { ContainerOptions } from '../../container/Container';
import type { ContextDestroyOptions, DestroyOptions } from '../../container/destroyTypes';
import type { FillInput, FillStyle, StrokeStyle } from './FillTypes';
import type { GraphicsPath } from './path/GraphicsPath';
import type { RoundedPoint } from './path/roundShape';

/**
 * Constructor options used for `Graphics` instances.
 * ```js
 * const graphics = new Graphics({
 *    fillStyle: { color: 0xff0000, alpha: 0.5 },
 *    strokeStyle: { color: 0x00ff00, width: 2 },
 * });
 * ```
 * @see {@link scene.Graphics}
 * @memberof scene
 */
export interface GraphicsOptions extends ContainerOptions
{
    /** The GraphicsContext to use, useful for reuse and optimisation */
    context?: GraphicsContext;
    /** Whether or not to round the x/y position. */
    roundPixels?: boolean;
}

/**
 * The Graphics class is primarily used to render primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.  However, you can also use a Graphics
 * object to build a list of primitives to use as a mask, or as a complex hitArea.
 * @memberof scene
 * @extends scene.Container
 */
export class Graphics extends ViewContainer implements Instruction
{
    public override readonly renderPipeId: string = 'graphics';
    public batched: boolean;

    public _didGraphicsUpdate: boolean;

    private _context: GraphicsContext;
    private readonly _ownedContext: GraphicsContext;

    /**
     * @param options - Options for the Graphics.
     */
    constructor(options?: GraphicsOptions | GraphicsContext)
    {
        if (options instanceof GraphicsContext)
        {
            options = { context: options };
        }

        const { context, roundPixels, ...rest } = options || {};

        super({
            label: 'Graphics',
            ...rest
        });

        if (!context)
        {
            this._context = this._ownedContext = new GraphicsContext();
        }
        else
        {
            this._context = context;
        }

        this._context.on('update', this.onViewUpdate, this);

        this.allowChildren = false;
        this.roundPixels = roundPixels ?? false;
    }

    set context(context: GraphicsContext)
    {
        if (context === this._context) return;

        this._context.off('update', this.onViewUpdate, this);

        this._context = context;

        // TODO store this bound function somewhere else..
        this._context.on('update', this.onViewUpdate, this);

        this.onViewUpdate();
    }

    get context(): GraphicsContext
    {
        return this._context;
    }

    /**
     * The local bounds of the graphic.
     * @type {rendering.Bounds}
     */
    override get bounds(): Bounds
    {
        return this._context.bounds;
    }

    /**
     * Graphics objects do not need to update their bounds as the context handles this.
     * @private
     */
    protected updateBounds(): void { /** */ }

    /**
     * Checks if the object contains the given point.
     * @param point - The point to check
     */
    public override containsPoint(point: PointData)
    {
        return this._context.containsPoint(point);
    }

    protected override onViewUpdate()
    {
        this._didViewChangeTick++;

        this._didGraphicsUpdate = true;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.onChildViewUpdate(this);
        }
    }

    /**
     * Destroys this graphics renderable and optionally its context.
     * @param options - Options parameter. A boolean will act as if all options
     *
     * If the context was created by this graphics and `destroy(false)` or `destroy()` is called
     * then the context will still be destroyed.
     *
     * If you want to explicitly not destroy this context that this graphics created,
     * then you should pass destroy({ context: false })
     *
     * If the context was passed in as an argument to the constructor then it will not be destroyed
     * @param {boolean} [options.texture=false] - Should destroy the texture of the graphics context
     * @param {boolean} [options.textureSource=false] - Should destroy the texture source of the graphics context
     * @param {boolean} [options.context=false] - Should destroy the context
     */
    public override destroy(options?: DestroyOptions): void
    {
        if (this._ownedContext && !options)
        {
            this._ownedContext.destroy(options);
        }
        else if (options === true || (options as ContextDestroyOptions)?.context === true)
        {
            this._context.destroy(options);
        }

        (this._ownedContext as null) = null;
        this._context = null;

        super.destroy(options);
    }

    private _callContextMethod(method: keyof GraphicsContext, args: any[]): this
    {
        (this.context as any)[method](...args);

        return this;
    }

    // --------------------------------------- GraphicsContext methods ---------------------------------------
    /**
     * Sets the current fill style of the graphics context. The fill style can be a color, gradient,
     * pattern, or a more complex style defined by a FillStyle object.
     * @param {FillInput} args - The fill style to apply. This can be a simple color, a gradient or
     * pattern object, or a FillStyle or ConvertedFillStyle object.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public setFillStyle(...args: Parameters<GraphicsContext['setFillStyle']>): this
    {
        return this._callContextMethod('setFillStyle', args);
    }

    /**
     * Sets the current stroke style of the graphics context. Similar to fill styles, stroke styles can
     * encompass colors, gradients, patterns, or more detailed configurations via a StrokeStyle object.
     * @param {StrokeInput} args - The stroke style to apply. Can be defined as a color, a gradient or pattern,
     * or a StrokeStyle or ConvertedStrokeStyle object.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public setStrokeStyle(...args: Parameters<GraphicsContext['setStrokeStyle']>): this
    {
        return this._callContextMethod('setStrokeStyle', args);
    }

    /**
     * Fills the current or given path with the current fill style. This method can optionally take
     * a color and alpha for a simple fill, or a more complex FillStyle object for advanced fills.
     * @param {FillInput} style - (Optional) The style to fill the path with. Can be a color, gradient, pattern, or a
     * complex style object. If omitted, uses the current fill style.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public fill(style?: FillInput): this;
    /** @deprecated 8.0.0 */
    public fill(color: ColorSource, alpha?: number): this;
    public fill(...args: [FillStyle | ColorSource, number?]): this
    {
        return this._callContextMethod('fill', args);
    }
    /**
     * Strokes the current path with the current stroke style. This method can take an optional
     * FillStyle parameter to define the stroke's appearance, including its color, width, and other properties.
     * @param {FillStyle} args - (Optional) The stroke style to apply. Can be defined as a simple color or a more
     * complex style object. If omitted, uses the current stroke style.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public stroke(...args: Parameters<GraphicsContext['stroke']>): this
    {
        return this._callContextMethod('stroke', args);
    }
    /**
     * Adds a texture to the graphics context. This method supports multiple overloads for specifying the texture,
     * tint, and dimensions. If only a texture is provided, it uses the texture's width and height for drawing.
     * Additional parameters allow for specifying a tint color, and custom dimensions for the texture drawing area.
     * @param texture - The Texture object to use.
     * @param tint - (Optional) A ColorSource to tint the texture. If not provided, defaults to white (0xFFFFFF).
     * @param dx - (Optional) The x-coordinate in the destination canvas at which to place the top-left corner of
     * the source image.
     * @param dy - (Optional) The y-coordinate in the destination canvas at which to place the top-left corner of
     * the source image.
     * @param dw - (Optional) The width of the rectangle within the source image to draw onto the destination canvas.
     * If not provided, uses the texture's frame width.
     * @param dh - (Optional) The height of the rectangle within the source image to draw onto the destination canvas.
     * If not provided, uses the texture's frame height.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public texture(texture: Texture, tint?: ColorSource, dx?: number, dy?: number, dw?: number, dh?: number): this;
    public texture(texture: Texture): this;
    public texture(...args: [Texture, number?, number?, number?, number?, number?]): this
    {
        return this._callContextMethod('texture', args);
    }
    /**
     * Resets the current path. Any previous path and its commands are discarded and a new path is
     * started. This is typically called before beginning a new shape or series of drawing commands.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public beginPath(): this
    {
        return this._callContextMethod('beginPath', []);
    }
    /**
     * Applies a cutout to the last drawn shape. This is used to create holes or complex shapes by
     * subtracting a path from the previously drawn path. If a hole is not completely in a shape, it will
     * fail to cut correctly!
     */
    public cut(): this
    {
        return this._callContextMethod('cut', []);
    }
    /**
     * Adds an arc to the current path, which is centered at (x, y) with the specified radius,
     * starting and ending angles, and direction.
     * @param x - The x-coordinate of the arc's center.
     * @param y - The y-coordinate of the arc's center.
     * @param radius - The arc's radius.
     * @param startAngle - The starting angle, in radians.
     * @param endAngle - The ending angle, in radians.
     * @param counterclockwise - (Optional) Specifies whether the arc is drawn counterclockwise (true) or clockwise
     * (false). Defaults to false.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): this;
    public arc(...args: Parameters<GraphicsContext['arc']>): this
    {
        return this._callContextMethod('arc', args);
    }
    /**
     * Adds an arc to the current path with the given control points and radius, connected to the previous point
     * by a straight line if necessary.
     * @param x1 - The x-coordinate of the first control point.
     * @param y1 - The y-coordinate of the first control point.
     * @param x2 - The x-coordinate of the second control point.
     * @param y2 - The y-coordinate of the second control point.
     * @param radius - The arc's radius.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this;
    public arcTo(...args: Parameters<GraphicsContext['arcTo']>): this
    {
        return this._callContextMethod('arcTo', args);
    }
    /**
     * Adds an SVG-style arc to the path, allowing for elliptical arcs based on the SVG spec.
     * @param rx - The x-radius of the ellipse.
     * @param ry - The y-radius of the ellipse.
     * @param xAxisRotation - The rotation of the ellipse's x-axis relative
     * to the x-axis of the coordinate system, in degrees.
     * @param largeArcFlag - Determines if the arc should be greater than or less than 180 degrees.
     * @param sweepFlag - Determines if the arc should be swept in a positive angle direction.
     * @param x - The x-coordinate of the arc's end point.
     * @param y - The y-coordinate of the arc's end point.
     * @returns The instance of the current object for chaining.
     */
    public arcToSvg(
        rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number
    ): this;
    public arcToSvg(...args: Parameters<GraphicsContext['arcToSvg']>): this
    {
        return this._callContextMethod('arcToSvg', args);
    }
    /**
     * Adds a cubic Bezier curve to the path.
     * It requires three points: the first two are control points and the third one is the end point.
     * The starting point is the last point in the current path.
     * @param cp1x - The x-coordinate of the first control point.
     * @param cp1y - The y-coordinate of the first control point.
     * @param cp2x - The x-coordinate of the second control point.
     * @param cp2y - The y-coordinate of the second control point.
     * @param x - The x-coordinate of the end point.
     * @param y - The y-coordinate of the end point.
     * @param smoothness - Optional parameter to adjust the smoothness of the curve.
     * @returns The instance of the current object for chaining.
     */
    public bezierCurveTo(
        cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, smoothness?: number
    ): this;
    public bezierCurveTo(...args: Parameters<GraphicsContext['bezierCurveTo']>): this
    {
        return this._callContextMethod('bezierCurveTo', args);
    }
    /**
     * Closes the current path by drawing a straight line back to the start.
     * If the shape is already closed or there are no points in the path, this method does nothing.
     * @returns The instance of the current object for chaining.
     */
    public closePath(): this
    {
        return this._callContextMethod('closePath', []);
    }
    /**
     * Draws an ellipse at the specified location and with the given x and y radii.
     * An optional transformation can be applied, allowing for rotation, scaling, and translation.
     * @param x - The x-coordinate of the center of the ellipse.
     * @param y - The y-coordinate of the center of the ellipse.
     * @param radiusX - The horizontal radius of the ellipse.
     * @param radiusY - The vertical radius of the ellipse.
     * @returns The instance of the current object for chaining.
     */
    public ellipse(x: number, y: number, radiusX: number, radiusY: number): this;
    public ellipse(...args: Parameters<GraphicsContext['ellipse']>): this
    {
        return this._callContextMethod('ellipse', args);
    }
    /**
     * Draws a circle shape. This method adds a new circle path to the current drawing.
     * @param x - The x-coordinate of the center of the circle.
     * @param y - The y-coordinate of the center of the circle.
     * @param radius - The radius of the circle.
     * @returns The instance of the current object for chaining.
     */
    public circle(x: number, y: number, radius: number): this;
    public circle(...args: Parameters<GraphicsContext['circle']>): this
    {
        return this._callContextMethod('circle', args);
    }
    /**
     * Adds another `GraphicsPath` to this path, optionally applying a transformation.
     * @param path - The `GraphicsPath` to add.
     * @returns The instance of the current object for chaining.
     */
    public path(path: GraphicsPath): this;
    public path(...args: Parameters<GraphicsContext['path']>): this
    {
        return this._callContextMethod('path', args);
    }
    /**
     * Connects the current point to a new point with a straight line. This method updates the current path.
     * @param x - The x-coordinate of the new point to connect to.
     * @param y - The y-coordinate of the new point to connect to.
     * @returns The instance of the current object for chaining.
     */
    public lineTo(x: number, y: number): this;
    public lineTo(...args: Parameters<GraphicsContext['lineTo']>): this
    {
        return this._callContextMethod('lineTo', args);
    }
    /**
     * Sets the starting point for a new sub-path. Any subsequent drawing commands are considered part of this path.
     * @param x - The x-coordinate for the starting point.
     * @param y - The y-coordinate for the starting point.
     * @returns The instance of the current object for chaining.
     */
    public moveTo(x: number, y: number): this;
    public moveTo(...args: Parameters<GraphicsContext['moveTo']>): this
    {
        return this._callContextMethod('moveTo', args);
    }
    /**
     * Adds a quadratic curve to the path. It requires two points: the control point and the end point.
     * The starting point is the last point in the current path.
     * @param cpx - The x-coordinate of the control point.
     * @param cpy - The y-coordinate of the control point.
     * @param x - The x-coordinate of the end point.
     * @param y - The y-coordinate of the end point.
     * @param smoothness - Optional parameter to adjust the smoothness of the curve.
     * @returns The instance of the current object for chaining.
     */
    public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number, smoothness?: number): this;
    public quadraticCurveTo(...args: Parameters<GraphicsContext['quadraticCurveTo']>): this
    {
        return this._callContextMethod('quadraticCurveTo', args);
    }
    /**
     * Draws a rectangle shape. This method adds a new rectangle path to the current drawing.
     * @param x - The x-coordinate of the top-left corner of the rectangle.
     * @param y - The y-coordinate of the top-left corner of the rectangle.
     * @param w - The width of the rectangle.
     * @param h - The height of the rectangle.
     * @returns The instance of the current object for chaining.
     */
    public rect(x: number, y: number, w: number, h: number): this;
    public rect(...args: Parameters<GraphicsContext['rect']>): this
    {
        return this._callContextMethod('rect', args);
    }
    /**
     * Draws a rectangle with rounded corners.
     * The corner radius can be specified to determine how rounded the corners should be.
     * An optional transformation can be applied, which allows for rotation, scaling, and translation of the rectangle.
     * @param x - The x-coordinate of the top-left corner of the rectangle.
     * @param y - The y-coordinate of the top-left corner of the rectangle.
     * @param w - The width of the rectangle.
     * @param h - The height of the rectangle.
     * @param radius - The radius of the rectangle's corners. If not specified, corners will be sharp.
     * @returns The instance of the current object for chaining.
     */
    public roundRect(x: number, y: number, w: number, h: number, radius?: number): this;
    public roundRect(...args: Parameters<GraphicsContext['roundRect']>): this
    {
        return this._callContextMethod('roundRect', args);
    }
    /**
     * Draws a polygon shape by specifying a sequence of points. This method allows for the creation of complex polygons,
     * which can be both open and closed. An optional transformation can be applied, enabling the polygon to be scaled,
     * rotated, or translated as needed.
     * @param points - An array of numbers, or an array of PointData objects eg [{x,y}, {x,y}, {x,y}]
     * representing the x and y coordinates, of the polygon's vertices, in sequence.
     * @param close - A boolean indicating whether to close the polygon path. True by default.
     * @returns The instance of the current object for chaining further drawing commands.
     */
    public poly(points: number[] | PointData[], close?: boolean): this;
    public poly(...args: Parameters<GraphicsContext['poly']>): this
    {
        return this._callContextMethod('poly', args);
    }
    /**
     * Draws a regular polygon with a specified number of sides. All sides and angles are equal.
     * @param x - The x-coordinate of the center of the polygon.
     * @param y - The y-coordinate of the center of the polygon.
     * @param radius - The radius of the circumscribed circle of the polygon.
     * @param sides - The number of sides of the polygon. Must be 3 or more.
     * @param rotation - The rotation angle of the polygon, in radians. Zero by default.
     * @param transform - An optional `Matrix` object to apply a transformation to the polygon.
     * @returns The instance of the current object for chaining.
     */
    public regularPoly(x: number, y: number, radius: number, sides: number, rotation?: number, transform?: Matrix): this;
    public regularPoly(...args: Parameters<GraphicsContext['regularPoly']>): this
    {
        return this._callContextMethod('regularPoly', args);
    }
    /**
     * Draws a polygon with rounded corners.
     * Similar to `regularPoly` but with the ability to round the corners of the polygon.
     * @param x - The x-coordinate of the center of the polygon.
     * @param y - The y-coordinate of the center of the polygon.
     * @param radius - The radius of the circumscribed circle of the polygon.
     * @param sides - The number of sides of the polygon. Must be 3 or more.
     * @param corner - The radius of the rounding of the corners.
     * @param rotation - The rotation angle of the polygon, in radians. Zero by default.
     * @returns The instance of the current object for chaining.
     */
    public roundPoly(x: number, y: number, radius: number, sides: number, corner: number, rotation?: number): this;
    public roundPoly(...args: Parameters<GraphicsContext['roundPoly']>): this
    {
        return this._callContextMethod('roundPoly', args);
    }
    /**
     * Draws a shape with rounded corners. This function supports custom radius for each corner of the shape.
     * Optionally, corners can be rounded using a quadratic curve instead of an arc, providing a different aesthetic.
     * @param points - An array of `RoundedPoint` representing the corners of the shape to draw.
     * A minimum of 3 points is required.
     * @param radius - The default radius for the corners.
     * This radius is applied to all corners unless overridden in `points`.
     * @param useQuadratic - If set to true, rounded corners are drawn using a quadraticCurve
     *  method instead of an arc method. Defaults to false.
     * @param smoothness - Specifies the smoothness of the curve when `useQuadratic` is true.
     * Higher values make the curve smoother.
     * @returns The instance of the current object for chaining.
     */
    public roundShape(points: RoundedPoint[], radius: number, useQuadratic?: boolean, smoothness?: number): this;
    public roundShape(...args: Parameters<GraphicsContext['roundShape']>): this
    {
        return this._callContextMethod('roundShape', args);
    }
    /**
     * Draw Rectangle with fillet corners. This is much like rounded rectangle
     * however it support negative numbers as well for the corner radius.
     * @param x - Upper left corner of rect
     * @param y - Upper right corner of rect
     * @param width - Width of rect
     * @param height - Height of rect
     * @param fillet - accept negative or positive values
     */
    public filletRect(x: number, y: number, width: number, height: number, fillet: number): this;
    public filletRect(...args: Parameters<GraphicsContext['filletRect']>): this
    {
        return this._callContextMethod('filletRect', args);
    }
    /**
     * Draw Rectangle with chamfer corners. These are angled corners.
     * @param x - Upper left corner of rect
     * @param y - Upper right corner of rect
     * @param width - Width of rect
     * @param height - Height of rect
     * @param chamfer - non-zero real number, size of corner cutout
     * @param transform
     */
    public chamferRect(x: number, y: number, width: number, height: number, chamfer: number, transform?: Matrix): this;
    public chamferRect(...args: Parameters<GraphicsContext['chamferRect']>): this
    {
        return this._callContextMethod('chamferRect', args);
    }
    /**
     * Draws a star shape centered at a specified location. This method allows for the creation
     *  of stars with a variable number of points, outer radius, optional inner radius, and rotation.
     * The star is drawn as a closed polygon with alternating outer and inner vertices to create the star's points.
     * An optional transformation can be applied to scale, rotate, or translate the star as needed.
     * @param x - The x-coordinate of the center of the star.
     * @param y - The y-coordinate of the center of the star.
     * @param points - The number of points of the star.
     * @param radius - The outer radius of the star (distance from the center to the outer points).
     * @param innerRadius - Optional. The inner radius of the star
     * (distance from the center to the inner points between the outer points).
     * If not provided, defaults to half of the `radius`.
     * @param rotation - Optional. The rotation of the star in radians, where 0 is aligned with the y-axis.
     * Defaults to 0, meaning one point is directly upward.
     * @returns The instance of the current object for chaining further drawing commands.
     */
    public star(x: number, y: number, points: number, radius: number, innerRadius?: number, rotation?: number): this;
    public star(...args: Parameters<GraphicsContext['star']>): this
    {
        return this._callContextMethod('star', args);
    }
    /**
     * Parses and renders an SVG string into the graphics context. This allows for complex shapes and paths
     * defined in SVG format to be drawn within the graphics context.
     * @param svg - The SVG string to be parsed and rendered.
     */
    public svg(svg: string): this;
    public svg(...args: Parameters<GraphicsContext['svg']>): this
    {
        return this._callContextMethod('svg', args);
    }
    /**
     * Restores the most recently saved graphics state by popping the top of the graphics state stack.
     * This includes transformations, fill styles, and stroke styles.
     */
    public restore(): this;
    public restore(...args: Parameters<GraphicsContext['restore']>): this
    {
        return this._callContextMethod('restore', args);
    }
    /** Saves the current graphics state, including transformations, fill styles, and stroke styles, onto a stack. */
    public save(): this
    {
        return this._callContextMethod('save', []);
    }
    /**
     * Returns the current transformation matrix of the graphics context.
     * @returns The current transformation matrix.
     */
    public getTransform(): Matrix
    {
        return this.context.getTransform();
    }
    /**
     * Resets the current transformation matrix to the identity matrix, effectively removing
     * any transformations (rotation, scaling, translation) previously applied.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public resetTransform(): this
    {
        return this._callContextMethod('resetTransform', []);
    }
    /**
     * Applies a rotation transformation to the graphics context around the current origin.
     * @param angle - The angle of rotation in radians.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public rotateTransform(angle: number): this;
    public rotateTransform(...args: Parameters<GraphicsContext['rotate']>): this
    {
        return this._callContextMethod('rotate', args);
    }
    /**
     * Applies a scaling transformation to the graphics context, scaling drawings by x horizontally and by y vertically.
     * @param x - The scale factor in the horizontal direction.
     * @param y - (Optional) The scale factor in the vertical direction.
     * If not specified, the x value is used for both directions.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public scaleTransform(x: number, y?: number): this;
    public scaleTransform(...args: Parameters<GraphicsContext['scale']>): this
    {
        return this._callContextMethod('scale', args);
    }
    /**
     * Sets the current transformation matrix of the graphics context to the specified matrix or values.
     * This replaces the current transformation matrix.
     * @param a - The value for the a property of the matrix, or a Matrix object to use directly.
     * @param b - The value for the b property of the matrix.
     * @param c - The value for the c property of the matrix.
     * @param d - The value for the d property of the matrix.
     * @param dx - The value for the tx (translate x) property of the matrix.
     * @param dy - The value for the ty (translate y) property of the matrix.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public setTransform(transform: Matrix): this;
    public setTransform(a: number, b: number, c: number, d: number, dx: number, dy: number): this;
    public setTransform(a: number | Matrix, b?: number, c?: number, d?: number, dx?: number, dy?: number): this;
    public setTransform(...args: [Matrix] | [number, number, number, number, number, number]): this
    {
        return this._callContextMethod('setTransform', args);
    }
    /**
     * Applies the specified transformation matrix to the current graphics context by multiplying
     * the current matrix with the specified matrix.
     * @param a - The value for the a property of the matrix, or a Matrix object to use directly.
     * @param b - The value for the b property of the matrix.
     * @param c - The value for the c property of the matrix.
     * @param d - The value for the d property of the matrix.
     * @param dx - The value for the tx (translate x) property of the matrix.
     * @param dy - The value for the ty (translate y) property of the matrix.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public transform(transform: Matrix): this;
    public transform(a: number, b: number, c: number, d: number, dx: number, dy: number): this;
    public transform(a: number | Matrix, b?: number, c?: number, d?: number, dx?: number, dy?: number): this;
    public transform(...args: [Matrix] | [number, number, number, number, number, number]): this
    {
        return this._callContextMethod('transform', args);
    }
    /**
     * Applies a translation transformation to the graphics context, moving the origin by the specified amounts.
     * @param x - The amount to translate in the horizontal direction.
     * @param y - (Optional) The amount to translate in the vertical direction. If not specified,
     * the x value is used for both directions.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public translateTransform(x: number, y?: number): this;
    public translateTransform(...args: Parameters<GraphicsContext['translate']>): this
    {
        return this._callContextMethod('translate', args);
    }
    /**
     * Clears all drawing commands from the graphics context, effectively resetting it. This includes clearing the path,
     * and optionally resetting transformations to the identity matrix.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public clear(): this
    {
        return this._callContextMethod('clear', []);
    }
    /**
     * The fill style to use.
     * @type {ConvertedFillStyle}
     */
    get fillStyle(): GraphicsContext['fillStyle']
    {
        return this._context.fillStyle;
    }
    set fillStyle(value: FillInput)
    {
        this._context.fillStyle = value;
    }
    /**
     * The stroke style to use.
     * @type {ConvertedStrokeStyle}
     */
    get strokeStyle(): GraphicsContext['strokeStyle']
    {
        return this._context.strokeStyle;
    }
    set strokeStyle(value: StrokeStyle)
    {
        this._context.strokeStyle = value;
    }

    /**
     * Creates a new Graphics object.
     * Note that only the context of the object is cloned, not its transform (position,scale,etc)
     * @param deep - Whether to create a deep clone of the graphics object. If false, the context
     * will be shared between the two objects (default false). If true, the context will be
     * cloned (recommended if you need to modify the context in any way).
     * @returns - A clone of the graphics object
     */
    public clone(deep = false): Graphics
    {
        if (deep)
        {
            return new Graphics(this._context.clone());
        }

        (this._ownedContext as null) = null;
        const clone = new Graphics(this._context);

        return clone;
    }

    // -------- v7 deprecations ---------

    /**
     * @param width
     * @param color
     * @param alpha
     * @deprecated since 8.0.0 Use {@link Graphics#setStrokeStyle} instead
     */
    public lineStyle(width?: number, color?: ColorSource, alpha?: number): this
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'Graphics#lineStyle is no longer needed. Use Graphics#setStrokeStyle to set the stroke style.');
        // #endif

        const strokeStyle: Partial<StrokeStyle> = {};

        // avoid undefined assignment
        width && (strokeStyle.width = width);
        color && (strokeStyle.color = color);
        alpha && (strokeStyle.alpha = alpha);

        this.context.strokeStyle = strokeStyle;

        return this;
    }

    /**
     * @param color
     * @param alpha
     * @deprecated since 8.0.0 Use {@link Graphics#fill} instead
     */
    public beginFill(color: ColorSource, alpha?: number)
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'Graphics#beginFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.');
        // #endif

        const fillStyle: Partial<FillStyle> = {};

        // avoid undefined assignment
        color && (fillStyle.color = color);
        alpha && (fillStyle.alpha = alpha);

        this.context.fillStyle = fillStyle;

        return this;
    }

    /**
     * @deprecated since 8.0.0 Use {@link Graphics#fill} instead
     */
    public endFill()
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'Graphics#endFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.');
        // #endif

        this.context.fill();
        const strokeStyle = this.context.strokeStyle;

        if (strokeStyle.width !== GraphicsContext.defaultStrokeStyle.width
            || strokeStyle.color !== GraphicsContext.defaultStrokeStyle.color
            || strokeStyle.alpha !== GraphicsContext.defaultStrokeStyle.alpha)
        {
            this.context.stroke();
        }

        return this;
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0 Use {@link Graphics#circle} instead
     */
    public drawCircle(...args: Parameters<GraphicsContext['circle']>): this
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'Graphics#drawCircle has been renamed to Graphics#circle');
        // #endif

        return this._callContextMethod('circle', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0 Use {@link Graphics#ellipse} instead
     */
    public drawEllipse(...args: Parameters<GraphicsContext['ellipse']>): this
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'Graphics#drawEllipse has been renamed to Graphics#ellipse');
        // #endif

        return this._callContextMethod('ellipse', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0 Use {@link Graphics#poly} instead
     */
    public drawPolygon(...args: Parameters<GraphicsContext['poly']>): this
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'Graphics#drawPolygon has been renamed to Graphics#poly');
        // #endif

        return this._callContextMethod('poly', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0 Use {@link Graphics#rect} instead
     */
    public drawRect(...args: Parameters<GraphicsContext['rect']>): this
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'Graphics#drawRect has been renamed to Graphics#rect');
        // #endif

        return this._callContextMethod('rect', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0 Use {@link Graphics#roundRect} instead
     */
    public drawRoundedRect(...args: Parameters<GraphicsContext['roundRect']>): this
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'Graphics#drawRoundedRect has been renamed to Graphics#roundRect');
        // #endif

        return this._callContextMethod('roundRect', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0 Use {@link Graphics#star} instead
     */
    public drawStar(...args: Parameters<GraphicsContext['star']>): this
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'Graphics#drawStar has been renamed to Graphics#star');
        // #endif

        return this._callContextMethod('star', args);
    }
}
