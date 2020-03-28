import {
    Circle,
    Ellipse,
    PI_2,
    Point,
    Polygon,
    Rectangle,
    RoundedRectangle,
    Matrix,
    SHAPES,
} from '@pixi/math';

import { Texture, UniformGroup, State, Renderer, BatchDrawCall } from '@pixi/core';
import { BezierUtils, QuadraticUtils, ArcUtils, Star } from './utils';
import { hex2rgb, deprecation } from '@pixi/utils';
import { GraphicsGeometry } from './GraphicsGeometry';
import { FillStyle } from './styles/FillStyle';
import { LineStyle } from './styles/LineStyle';
import { BLEND_MODES, LINE_JOIN, LINE_CAP } from '@pixi/constants';
import { Container } from '@pixi/display';
import { Shader } from '@pixi/core';

import type { IShape } from '@pixi/math';
import type { IDestroyOptions } from '@pixi/display';

/**
 * Batch element computed from Graphics geometry
 */
export interface IGraphicsBatchElement {
    vertexData: Float32Array;
    blendMode: BLEND_MODES;
    indices: Uint16Array | Uint32Array;
    uvs: Float32Array;
    alpha: number;
    worldAlpha: number;
    _batchRGB: number[];
    _tintRGB: number;
    _texture: Texture;
}

export interface IFillStyleOptions {
    color?: number;
    alpha?: number;
    texture?: Texture;
    matrix?: Matrix;
}

export interface ILineStyleOptions extends IFillStyleOptions {
    width?: number;
    alignment?: number;
    native?: boolean;
    join?: LINE_JOIN;
    miterLimit?: number;
}

const temp = new Float32Array(3);

// a default shaders map used by graphics..
const DEFAULT_SHADERS: {[key: string]: Shader} = {};

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * Note that because Graphics can share a GraphicsGeometry with other instances,
 * it is necessary to call `destroy()` to properly dereference the underlying
 * GraphicsGeometry and avoid a memory leak. Alternatively, keep using the same
 * Graphics instance and call `clear()` between redraws.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export class Graphics extends Container
{
    /**
     * Temporary point to use for containsPoint
     *
     * @static
     * @private
     * @member {PIXI.Point}
     */

    static _TEMP_POINT = new Point();

    public shader: Shader;
    public pluginName: string;

    protected currentPath: Polygon;
    protected batches: Array<IGraphicsBatchElement>;
    protected batchTint: number;
    protected batchDirty: number;
    protected vertexData: Float32Array;

    protected _fillStyle: FillStyle;
    protected _lineStyle: LineStyle;
    protected _matrix: Matrix;
    protected _holeMode: boolean;
    protected _transformID: number;
    protected _tint: number;

    private state: State;
    private _geometry: GraphicsGeometry;

    /**
     * Includes vertex positions, face indices, normals, colors, UVs, and
     * custom attributes within buffers, reducing the cost of passing all
     * this data to the GPU. Can be shared between multiple Mesh or Graphics objects.
     *
     * @member {PIXI.GraphicsGeometry}
     * @readonly
     */
    public get geometry(): GraphicsGeometry
    {
        return this._geometry;
    }

    /**
     * @param {PIXI.GraphicsGeometry} [geometry=null] - Geometry to use, if omitted
     *        will create a new GraphicsGeometry instance.
     */
    constructor(geometry: GraphicsGeometry = null)
    {
        super();

        this._geometry = geometry || new GraphicsGeometry();
        this._geometry.refCount++;

        /**
         * Represents the vertex and fragment shaders that processes the geometry and runs on the GPU.
         * Can be shared between multiple Graphics objects.
         *
         * @member {PIXI.Shader}
         */
        this.shader = null;

        /**
         * Represents the WebGL state the Graphics required to render, excludes shader and geometry. E.g.,
         * blend mode, culling, depth testing, direction of rendering triangles, backface, etc.
         *
         * @member {PIXI.State}
         */
        this.state = State.for2d();

        /**
         * Current fill style
         *
         * @member {PIXI.FillStyle}
         * @protected
         */
        this._fillStyle = new FillStyle();

        /**
         * Current line style
         *
         * @member {PIXI.LineStyle}
         * @protected
         */
        this._lineStyle = new LineStyle();

        /**
         * Current shape transform matrix.
         *
         * @member {PIXI.Matrix}
         * @protected
         */
        this._matrix = null;

        /**
         * Current hole mode is enabled.
         *
         * @member {boolean}
         * @default false
         * @protected
         */
        this._holeMode = false;

        /**
         * Current path
         *
         * @member {PIXI.Polygon}
         * @protected
         */
        this.currentPath = null;

        /**
         * When cacheAsBitmap is set to true the graphics object will be rendered as if it was a sprite.
         * This is useful if your graphics element does not change often, as it will speed up the rendering
         * of the object in exchange for taking up texture memory. It is also useful if you need the graphics
         * object to be anti-aliased, because it will be rendered using canvas. This is not recommended if
         * you are constantly redrawing the graphics element.
         *
         * @name cacheAsBitmap
         * @member {boolean}
         * @memberof PIXI.Graphics#
         * @default false
         */

        /**
         * A collections of batches! These can be drawn by the renderer batch system.
         *
         * @protected
         * @member {object[]}
         */
        this.batches = [];

        /**
         * Update dirty for limiting calculating tints for batches.
         *
         * @protected
         * @member {number}
         * @default -1
         */
        this.batchTint = -1;

        /**
         * Update dirty for limiting calculating batches.
         *
         * @protected
         * @member {number}
         * @default -1
         */
        this.batchDirty = -1;

        /**
         * Copy of the object vertex data.
         *
         * @protected
         * @member {Float32Array}
         */
        this.vertexData = null;

        /**
         * Renderer plugin for batching
         *
         * @member {string}
         * @default 'batch'
         */
        this.pluginName = 'batch';

        this._transformID = -1;

        // Set default
        this.tint = 0xFFFFFF;
        this.blendMode = BLEND_MODES.NORMAL;
    }

    /**
     * Creates a new Graphics object with the same values as this one.
     * Note that the only the properties of the object are cloned, not its transform (position,scale,etc)
     *
     * @return {PIXI.Graphics} A clone of the graphics object
     */
    public clone(): Graphics
    {
        this.finishPoly();

        return new Graphics(this._geometry);
    }

    /**
     * The blend mode to be applied to the graphic shape. Apply a value of
     * `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL;
     * @see PIXI.BLEND_MODES
     */
    public set blendMode(value: BLEND_MODES)
    {
        this.state.blendMode = value;
    }

    public get blendMode(): BLEND_MODES
    {
        return this.state.blendMode;
    }

    /**
     * The tint applied to the graphic shape. This is a hex value. A value of
     * 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    public get tint(): number
    {
        return this._tint;
    }

    public set tint(value)
    {
        this._tint = value;
    }

    /**
     * The current fill style.
     *
     * @member {PIXI.FillStyle}
     * @readonly
     */
    public get fill(): FillStyle
    {
        return this._fillStyle;
    }

    /**
     * The current line style.
     *
     * @member {PIXI.LineStyle}
     * @readonly
     */
    public get line(): LineStyle
    {
        return this._lineStyle;
    }

    /**
     * Specifies the line style used for subsequent calls to Graphics methods such as the lineTo()
     * method or the drawCircle() method.
     *
     * @method PIXI.Graphics#lineStyle
     * @param {number} [width=0] - width of the line to draw, will update the objects stored style
     * @param {number} [color=0x0] - color of the line to draw, will update the objects stored style
     * @param {number} [alpha=1] - alpha of the line to draw, will update the objects stored style
     * @param {number} [alignment=0.5] - alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
     * @param {boolean} [native=false] - If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    /**
     * Specifies the line style used for subsequent calls to Graphics methods such as the lineTo()
     * method or the drawCircle() method.
     *
     * @param {object} [options] - Line style options
     * @param {number} [options.width=0] - width of the line to draw, will update the objects stored style
     * @param {number} [options.color=0x0] - color of the line to draw, will update the objects stored style
     * @param {number} [options.alpha=1] - alpha of the line to draw, will update the objects stored style
     * @param {number} [options.alignment=0.5] - alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
     * @param {boolean} [options.native=false] - If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public lineStyle(options: ILineStyleOptions = null): this
    {
        // Support non-object params: (width, color, alpha, alignment, native)
        if (typeof options === 'number')
        {
            // eslint-disable-next-line
            const args = arguments;

            options = {
                width: args[0] || 0,
                color: args[1] || 0x0,
                alpha: args[2] !== undefined ? args[2] : 1,
                alignment: args[3] !== undefined ? args[3] : 0.5,
                native: !!args[4],
            };
        }

        return this.lineTextureStyle(options);
    }

    /**
     * Like line style but support texture for line fill.
     *
     * @param {object} [options] - Collection of options for setting line style.
     * @param {number} [options.width=0] - width of the line to draw, will update the objects stored style
     * @param {PIXI.Texture} [options.texture=PIXI.Texture.WHITE] - Texture to use
     * @param {number} [options.color=0x0] - color of the line to draw, will update the objects stored style.
     *  Default 0xFFFFFF if texture present.
     * @param {number} [options.alpha=1] - alpha of the line to draw, will update the objects stored style
     * @param {PIXI.Matrix} [options.matrix=null] Texture matrix to transform texture
     * @param {number} [options.alignment=0.5] - alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
     * @param {boolean} [options.native=false] - If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public lineTextureStyle(options: ILineStyleOptions): this
    {
        // backward compatibility with params: (width, texture,
        // color, alpha, matrix, alignment, native)
        if (typeof options === 'number')
        {
            deprecation('v5.2.0', 'Please use object-based options for Graphics#lineTextureStyle');

            // eslint-disable-next-line
            const [width, texture, color, alpha, matrix, alignment, native] = arguments as any;

            options = { width, texture, color, alpha, matrix, alignment, native };

            // Remove undefined keys
            Object.keys(options).forEach((key) => (options as any)[key] === undefined && delete (options as any)[key]);
        }

        // Apply defaults
        options = Object.assign({
            width: 0,
            texture: Texture.WHITE,
            color: (options && options.texture) ? 0xFFFFFF : 0x0,
            alpha: 1,
            matrix: null,
            alignment: 0.5,
            native: false,
            cap: LINE_CAP.BUTT,
            join: LINE_JOIN.MITER,
            miterLimit: 10,
        }, options);

        if (this.currentPath)
        {
            this.startPoly();
        }

        const visible = options.width > 0 && options.alpha > 0;

        if (!visible)
        {
            this._lineStyle.reset();
        }
        else
        {
            if (options.matrix)
            {
                options.matrix = options.matrix.clone();
                options.matrix.invert();
            }

            Object.assign(this._lineStyle, { visible }, options);
        }

        return this;
    }

    /**
     * Start a polygon object internally
     * @protected
     */
    protected startPoly(): void
    {
        if (this.currentPath)
        {
            const points = this.currentPath.points;
            const len = this.currentPath.points.length;

            if (len > 2)
            {
                this.drawShape(this.currentPath);
                this.currentPath = new Polygon();
                this.currentPath.closeStroke = false;
                this.currentPath.points.push(points[len - 2], points[len - 1]);
            }
        }
        else
        {
            this.currentPath = new Polygon();
            this.currentPath.closeStroke = false;
        }
    }

    /**
     * Finish the polygon object.
     * @protected
     */
    finishPoly(): void
    {
        if (this.currentPath)
        {
            if (this.currentPath.points.length > 2)
            {
                this.drawShape(this.currentPath);
                this.currentPath = null;
            }
            else
            {
                this.currentPath.points.length = 0;
            }
        }
    }

    /**
     * Moves the current drawing position to x, y.
     *
     * @param {number} x - the X coordinate to move to
     * @param {number} y - the Y coordinate to move to
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public moveTo(x: number, y: number): this
    {
        this.startPoly();
        this.currentPath.points[0] = x;
        this.currentPath.points[1] = y;

        return this;
    }

    /**
     * Draws a line using the current line style from the current drawing position to (x, y);
     * The current drawing position is then set to (x, y).
     *
     * @param {number} x - the X coordinate to draw to
     * @param {number} y - the Y coordinate to draw to
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public lineTo(x: number, y: number): this
    {
        if (!this.currentPath)
        {
            this.moveTo(0, 0);
        }

        // remove duplicates..
        const points = this.currentPath.points;
        const fromX = points[points.length - 2];
        const fromY = points[points.length - 1];

        if (fromX !== x || fromY !== y)
        {
            points.push(x, y);
        }

        return this;
    }

    /**
     * Initialize the curve
     *
     * @protected
     * @param {number} [x=0]
     * @param {number} [y=0]
     */
    protected _initCurve(x = 0, y = 0): void
    {
        if (this.currentPath)
        {
            if (this.currentPath.points.length === 0)
            {
                this.currentPath.points = [x, y];
            }
        }
        else
        {
            this.moveTo(x, y);
        }
    }

    /**
     * Calculate the points for a quadratic bezier curve and then draws it.
     * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
     *
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public quadraticCurveTo(cpX: number, cpY: number, toX: number, toY: number): this
    {
        this._initCurve();

        const points = this.currentPath.points;

        if (points.length === 0)
        {
            this.moveTo(0, 0);
        }

        QuadraticUtils.curveTo(cpX, cpY, toX, toY, points);

        return this;
    }

    /**
     * Calculate the points for a bezier curve and then draws it.
     *
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} cpX2 - Second Control point x
     * @param {number} cpY2 - Second Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public bezierCurveTo(cpX: number, cpY: number, cpX2: number, cpY2: number, toX: number, toY: number): this
    {
        this._initCurve();

        BezierUtils.curveTo(cpX, cpY, cpX2, cpY2, toX, toY, this.currentPath.points);

        return this;
    }

    /**
     * The arcTo() method creates an arc/curve between two tangents on the canvas.
     *
     * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
     *
     * @param {number} x1 - The x-coordinate of the first tangent point of the arc
     * @param {number} y1 - The y-coordinate of the first tangent point of the arc
     * @param {number} x2 - The x-coordinate of the end of the arc
     * @param {number} y2 - The y-coordinate of the end of the arc
     * @param {number} radius - The radius of the arc
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this
    {
        this._initCurve(x1, y1);

        const points = this.currentPath.points;

        const result = ArcUtils.curveTo(x1, y1, x2, y2, radius, points);

        if (result)
        {
            const { cx, cy, radius, startAngle, endAngle, anticlockwise } = result;

            this.arc(cx, cy, radius, startAngle, endAngle, anticlockwise);
        }

        return this;
    }

    /**
     * The arc method creates an arc/curve (used to create circles, or parts of circles).
     *
     * @param {number} cx - The x-coordinate of the center of the circle
     * @param {number} cy - The y-coordinate of the center of the circle
     * @param {number} radius - The radius of the circle
     * @param {number} startAngle - The starting angle, in radians (0 is at the 3 o'clock position
     *  of the arc's circle)
     * @param {number} endAngle - The ending angle, in radians
     * @param {boolean} [anticlockwise=false] - Specifies whether the drawing should be
     *  counter-clockwise or clockwise. False is default, and indicates clockwise, while true
     *  indicates counter-clockwise.
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public arc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, anticlockwise = false): this
    {
        if (startAngle === endAngle)
        {
            return this;
        }

        if (!anticlockwise && endAngle <= startAngle)
        {
            endAngle += PI_2;
        }
        else if (anticlockwise && startAngle <= endAngle)
        {
            startAngle += PI_2;
        }

        const sweep = endAngle - startAngle;

        if (sweep === 0)
        {
            return this;
        }

        const startX = cx + (Math.cos(startAngle) * radius);
        const startY = cy + (Math.sin(startAngle) * radius);
        const eps = this._geometry.closePointEps;

        // If the currentPath exists, take its points. Otherwise call `moveTo` to start a path.
        let points = this.currentPath ? this.currentPath.points : null;

        if (points)
        {
            // TODO: make a better fix.

            // We check how far our start is from the last existing point
            const xDiff = Math.abs(points[points.length - 2] - startX);
            const yDiff = Math.abs(points[points.length - 1] - startY);

            if (xDiff < eps && yDiff < eps)
            {
                // If the point is very close, we don't add it, since this would lead to artifacts
                // during tessellation due to floating point imprecision.
            }
            else
            {
                points.push(startX, startY);
            }
        }
        else
        {
            this.moveTo(startX, startY);
            points = this.currentPath.points;
        }

        ArcUtils.arc(startX, startY, cx, cy, radius, startAngle, endAngle, anticlockwise, points);

        return this;
    }

    /**
     * Specifies a simple one-color fill that subsequent calls to other Graphics methods
     * (such as lineTo() or drawCircle()) use when drawing.
     *
     * @param {number} [color=0] - the color of the fill
     * @param {number} [alpha=1] - the alpha of the fill
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public beginFill(color = 0, alpha = 1): this
    {
        return this.beginTextureFill({ texture: Texture.WHITE, color, alpha });
    }

    /**
     * Begin the texture fill
     *
     * @param {object} [options] - Object object.
     * @param {PIXI.Texture} [options.texture=PIXI.Texture.WHITE] - Texture to fill
     * @param {number} [options.color=0xffffff] - Background to fill behind texture
     * @param {number} [options.alpha=1] - Alpha of fill
     * @param {PIXI.Matrix} [options.matrix=null] - Transform matrix
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    beginTextureFill(options: IFillStyleOptions): this
    {
        // backward compatibility with params: (texture, color, alpha, matrix)
        if (options instanceof Texture)
        {
            deprecation('v5.2.0', 'Please use object-based options for Graphics#beginTextureFill');

            // eslint-disable-next-line
            const [texture, color, alpha, matrix] = arguments as any;

            options = { texture, color, alpha, matrix };

            // Remove undefined keys
            Object.keys(options).forEach((key) => (options as any)[key] === undefined && delete (options as any)[key]);
        }

        // Apply defaults
        options = Object.assign({
            texture: Texture.WHITE,
            color: 0xFFFFFF,
            alpha: 1,
            matrix: null,
        }, options) as IFillStyleOptions;

        if (this.currentPath)
        {
            this.startPoly();
        }

        const visible = options.alpha > 0;

        if (!visible)
        {
            this._fillStyle.reset();
        }
        else
        {
            if (options.matrix)
            {
                options.matrix = options.matrix.clone();
                options.matrix.invert();
            }

            Object.assign(this._fillStyle, { visible }, options);
        }

        return this;
    }

    /**
     * Applies a fill to the lines and shapes that were added since the last call to the beginFill() method.
     *
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public endFill(): this
    {
        this.finishPoly();

        this._fillStyle.reset();

        return this;
    }

    /**
     * Draws a rectangle shape.
     *
     * @param {number} x - The X coord of the top-left of the rectangle
     * @param {number} y - The Y coord of the top-left of the rectangle
     * @param {number} width - The width of the rectangle
     * @param {number} height - The height of the rectangle
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public drawRect(x: number, y: number, width: number, height: number): this
    {
        return this.drawShape(new Rectangle(x, y, width, height));
    }

    /**
     * Draw a rectangle shape with rounded/beveled corners.
     *
     * @param {number} x - The X coord of the top-left of the rectangle
     * @param {number} y - The Y coord of the top-left of the rectangle
     * @param {number} width - The width of the rectangle
     * @param {number} height - The height of the rectangle
     * @param {number} radius - Radius of the rectangle corners
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): this
    {
        return this.drawShape(new RoundedRectangle(x, y, width, height, radius));
    }

    /**
     * Draws a circle.
     *
     * @param {number} x - The X coordinate of the center of the circle
     * @param {number} y - The Y coordinate of the center of the circle
     * @param {number} radius - The radius of the circle
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public drawCircle(x: number, y: number, radius: number): this
    {
        return this.drawShape(new Circle(x, y, radius));
    }

    /**
     * Draws an ellipse.
     *
     * @param {number} x - The X coordinate of the center of the ellipse
     * @param {number} y - The Y coordinate of the center of the ellipse
     * @param {number} width - The half width of the ellipse
     * @param {number} height - The half height of the ellipse
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public drawEllipse(x: number, y: number, width: number, height: number): this
    {
        return this.drawShape(new Ellipse(x, y, width, height));
    }

    public drawPolygon(...path: Array<number> | Array<Point>): this
    public drawPolygon(path: Array<number> | Array<Point> | Polygon): this

    /**
     * Draws a polygon using the given path.
     *
     * @param {number[]|PIXI.Point[]|PIXI.Polygon} path - The path data used to construct the polygon.
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public drawPolygon(...path: any[]): this
    {
        let points: Array<number> | Array<Point>;
        let closeStroke = true;// !!this._fillStyle;

        const poly = path[0] as Polygon;

        // check if data has points..
        if (poly.points)
        {
            closeStroke = poly.closeStroke;
            points = poly.points;
        }
        else
        if (Array.isArray(path[0]))
        {
            points = path[0];
        }
        else
        {
            points = path;
        }

        const shape = new Polygon(points);

        shape.closeStroke = closeStroke;

        this.drawShape(shape);

        return this;
    }

    /**
     * Draw any shape.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - Shape to draw
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public drawShape(shape: IShape): this
    {
        if (!this._holeMode)
        {
            this._geometry.drawShape(
                shape,
                this._fillStyle.clone(),
                this._lineStyle.clone(),
                this._matrix
            );
        }
        else
        {
            this._geometry.drawHole(shape, this._matrix);
        }

        return this;
    }

    /**
     * Draw a star shape with an arbitrary number of points.
     *
     * @param {number} x - Center X position of the star
     * @param {number} y - Center Y position of the star
     * @param {number} points - The number of points of the star, must be > 1
     * @param {number} radius - The outer radius of the star
     * @param {number} [innerRadius] - The inner radius between points, default half `radius`
     * @param {number} [rotation=0] - The rotation of the star in radians, where 0 is vertical
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public drawStar(x: number, y: number, points: number, radius: number, innerRadius: number, rotation = 0): this
    {
        return this.drawPolygon(new Star(x, y, points, radius, innerRadius, rotation) as Polygon);
    }

    /**
     * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
     *
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    public clear(): this
    {
        this._geometry.clear();
        this._lineStyle.reset();
        this._fillStyle.reset();

        this._boundsID++;
        this._matrix = null;
        this._holeMode = false;
        this.currentPath = null;

        return this;
    }

    /**
     * True if graphics consists of one rectangle, and thus, can be drawn like a Sprite and
     * masked with gl.scissor.
     *
     * @returns {boolean} True if only 1 rect.
     */
    public isFastRect(): boolean
    {
        const data = this._geometry.graphicsData;

        return data.length === 1
            && data[0].shape.type === SHAPES.RECT
            && !(data[0].lineStyle.visible && data[0].lineStyle.width);
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _render(renderer: Renderer): void
    {
        this.finishPoly();

        const geometry = this._geometry;
        const hasuit32 = renderer.context.supports.uint32Indices;
        // batch part..
        // batch it!

        geometry.updateBatches(hasuit32);

        if (geometry.batchable)
        {
            if (this.batchDirty !== geometry.batchDirty)
            {
                this._populateBatches();
            }

            this._renderBatched(renderer);
        }
        else
        {
            // no batching...
            renderer.batch.flush();

            this._renderDirect(renderer);
        }
    }

    /**
     * Populating batches for rendering
     *
     * @protected
     */
    protected _populateBatches(): void
    {
        const geometry = this._geometry;
        const blendMode = this.blendMode;
        const len = geometry.batches.length;

        this.batchTint = -1;
        this._transformID = -1;
        this.batchDirty = geometry.batchDirty;
        this.batches.length = len;

        this.vertexData = new Float32Array(geometry.points);

        for (let i = 0; i < len; i++)
        {
            const gI = geometry.batches[i];
            const color = gI.style.color;
            const vertexData = new Float32Array(this.vertexData.buffer,
                gI.attribStart * 4 * 2,
                gI.attribSize * 2);

            const uvs = new Float32Array(geometry.uvsFloat32.buffer,
                gI.attribStart * 4 * 2,
                gI.attribSize * 2);

            const indices = new Uint16Array(geometry.indicesUint16.buffer,
                gI.start * 2,
                gI.size);

            const batch = {
                vertexData,
                blendMode,
                indices,
                uvs,
                _batchRGB: hex2rgb(color) as Array<number>,
                _tintRGB: color,
                _texture: gI.style.texture,
                alpha: gI.style.alpha,
                worldAlpha: 1 };

            this.batches[i] = batch;
        }
    }

    /**
     * Renders the batches using the BathedRenderer plugin
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _renderBatched(renderer: Renderer): void
    {
        if (!this.batches.length)
        {
            return;
        }

        renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);

        this.calculateVertices();
        this.calculateTints();

        for (let i = 0, l = this.batches.length; i < l; i++)
        {
            const batch = this.batches[i];

            batch.worldAlpha = this.worldAlpha * batch.alpha;

            renderer.plugins[this.pluginName].render(batch);
        }
    }

    /**
     * Renders the graphics direct
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _renderDirect(renderer: Renderer): void
    {
        const shader = this._resolveDirectShader(renderer);

        const geometry = this._geometry;
        const tint = this.tint;
        const worldAlpha = this.worldAlpha;
        const uniforms = shader.uniforms;
        const drawCalls = geometry.drawCalls;

        // lets set the transfomr
        uniforms.translationMatrix = this.transform.worldTransform;

        // and then lets set the tint..
        uniforms.tint[0] = (((tint >> 16) & 0xFF) / 255) * worldAlpha;
        uniforms.tint[1] = (((tint >> 8) & 0xFF) / 255) * worldAlpha;
        uniforms.tint[2] = ((tint & 0xFF) / 255) * worldAlpha;
        uniforms.tint[3] = worldAlpha;

        // the first draw call, we can set the uniforms of the shader directly here.

        // this means that we can tack advantage of the sync function of pixi!
        // bind and sync uniforms..
        // there is a way to optimise this..
        renderer.shader.bind(shader);
        renderer.geometry.bind(geometry, shader);

        // set state..
        renderer.state.set(this.state);

        // then render the rest of them...
        for (let i = 0, l = drawCalls.length; i < l; i++)
        {
            this._renderDrawCallDirect(renderer, geometry.drawCalls[i]);
        }
    }

    /**
     * Renders specific DrawCall
     *
     * @param {PIXI.Renderer} renderer
     * @param {PIXI.BatchDrawCall} drawCall
     */
    protected _renderDrawCallDirect(renderer: Renderer, drawCall: BatchDrawCall): void
    {
        const { texArray, type, size, start } = drawCall;
        const groupTextureCount = texArray.count;

        for (let j = 0; j < groupTextureCount; j++)
        {
            renderer.texture.bind(texArray.elements[j], j);
        }

        renderer.geometry.draw(type, size, start);
    }

    /**
     * Resolves shader for direct rendering
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _resolveDirectShader(renderer: Renderer): Shader
    {
        let shader = this.shader;

        const pluginName = this.pluginName;

        if (!shader)
        {
            // if there is no shader here, we can use the default shader.
            // and that only gets created if we actually need it..
            // but may be more than one plugins for graphics
            if (!DEFAULT_SHADERS[pluginName])
            {
                const sampleValues = new Int32Array(16);

                for (let i = 0; i < 16; i++)
                {
                    sampleValues[i] = i;
                }

                const uniforms = {
                    tint: new Float32Array([1, 1, 1, 1]),
                    translationMatrix: new Matrix(),
                    default: UniformGroup.from({ uSamplers: sampleValues }, true),
                };

                const program = renderer.plugins[pluginName]._shader.program;

                DEFAULT_SHADERS[pluginName] = new Shader(program, uniforms);
            }

            shader = DEFAULT_SHADERS[pluginName];
        }

        return shader;
    }

    /**
     * Retrieves the bounds of the graphic shape as a rectangle object
     *
     * @protected
     */
    protected _calculateBounds(): void
    {
        this.finishPoly();

        const geometry = this._geometry;

        // skipping when graphics is empty, like a container
        if (!geometry.graphicsData.length)
        {
            return;
        }

        const { minX, minY, maxX, maxY } = geometry.bounds;

        this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
    }

    /**
     * Tests if a point is inside this graphics object
     *
     * @param {PIXI.Point} point - the point to test
     * @return {boolean} the result of the test
     */
    public containsPoint(point: Point): boolean
    {
        this.worldTransform.applyInverse(point, Graphics._TEMP_POINT);

        return this._geometry.containsPoint(Graphics._TEMP_POINT);
    }

    /**
     * Recalcuate the tint by applying tin to batches using Graphics tint.
     * @protected
     */
    protected calculateTints(): void
    {
        if (this.batchTint !== this.tint)
        {
            this.batchTint = this.tint;

            const tintRGB = hex2rgb(this.tint, temp);

            for (let i = 0; i < this.batches.length; i++)
            {
                const batch = this.batches[i];

                const batchTint = batch._batchRGB;

                const r = (tintRGB[0] * batchTint[0]) * 255;
                const g = (tintRGB[1] * batchTint[1]) * 255;
                const b = (tintRGB[2] * batchTint[2]) * 255;

                // TODO Ivan, can this be done in one go?
                const color = (r << 16) + (g << 8) + (b | 0);

                batch._tintRGB = (color >> 16)
                        + (color & 0xff00)
                        + ((color & 0xff) << 16);
            }
        }
    }

    /**
     * If there's a transform update or a change to the shape of the
     * geometry, recaculate the vertices.
     * @protected
     */
    protected calculateVertices(): void
    {
        const wtID = this.transform._worldID;

        if (this._transformID === wtID)
        {
            return;
        }

        this._transformID = wtID;

        const wt = this.transform.worldTransform;
        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        const data = this._geometry.points;// batch.vertexDataOriginal;
        const vertexData = this.vertexData;

        let count = 0;

        for (let i = 0; i < data.length; i += 2)
        {
            const x = data[i];
            const y = data[i + 1];

            vertexData[count++] = (a * x) + (c * y) + tx;
            vertexData[count++] = (d * y) + (b * x) + ty;
        }
    }

    /**
     * Closes the current path.
     *
     * @return {PIXI.Graphics} Returns itself.
     */
    public closePath(): this
    {
        const currentPath = this.currentPath;

        if (currentPath)
        {
            // we don't need to add extra point in the end because buildLine will take care of that
            currentPath.closeStroke = true;
        }

        return this;
    }

    /**
     * Apply a matrix to the positional data.
     *
     * @param {PIXI.Matrix} matrix - Matrix to use for transform current shape.
     * @return {PIXI.Graphics} Returns itself.
     */
    public setMatrix(matrix: Matrix): this
    {
        this._matrix = matrix;

        return this;
    }

    /**
     * Begin adding holes to the last draw shape
     * IMPORTANT: holes must be fully inside a shape to work
     * Also weirdness ensues if holes overlap!
     * Ellipses, Circles, Rectangles and Rounded Rectangles cannot be holes or host for holes in CanvasRenderer,
     * please use `moveTo` `lineTo`, `quadraticCurveTo` if you rely on pixi-legacy bundle.
     * @return {PIXI.Graphics} Returns itself.
     */
    public beginHole(): this
    {
        this.finishPoly();
        this._holeMode = true;

        return this;
    }

    /**
     * End adding holes to the last draw shape
     * @return {PIXI.Graphics} Returns itself.
     */
    public endHole(): this
    {
        this.finishPoly();
        this._holeMode = false;

        return this;
    }

    /**
     * Destroys the Graphics object.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all
     *  options have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have
     *  their destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the texture of the child sprite
     * @param {boolean} [options.baseTexture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the base texture of the child sprite
     */
    public destroy(options: IDestroyOptions|boolean): void
    {
        super.destroy(options);

        this._geometry.refCount--;
        if (this._geometry.refCount === 0)
        {
            this._geometry.dispose();
        }

        this._matrix = null;
        this.currentPath = null;
        this._lineStyle.destroy();
        this._lineStyle = null;
        this._fillStyle.destroy();
        this._fillStyle = null;
        this._geometry = null;
        this.shader = null;
        this.vertexData = null;
        this.batches.length = 0;
        this.batches = null;

        super.destroy(options);
    }
}
