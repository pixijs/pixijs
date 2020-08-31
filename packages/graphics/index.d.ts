import { BatchDrawCall } from '@pixi/core';
import { BatchGeometry } from '@pixi/core';
import { BLEND_MODES } from '@pixi/constants';
import { Bounds } from '@pixi/display';
import type { Circle } from '@pixi/math';
import { Container } from '@pixi/display';
import type { Ellipse } from '@pixi/math';
import type { IDestroyOptions } from '@pixi/display';
import type { IPointData } from '@pixi/math';
import type { IShape } from '@pixi/math';
import { Matrix } from '@pixi/math';
import { Point } from '@pixi/math';
import { Polygon } from '@pixi/math';
import type { Rectangle } from '@pixi/math';
import { Renderer } from '@pixi/core';
import type { RoundedRectangle } from '@pixi/math';
import { Shader } from '@pixi/core';
import type { SHAPES } from '@pixi/math';
import { Texture } from '@pixi/core';

/**
 * Utilities for arc curves
 * @class
 * @private
 */
declare class ArcUtils {
    /**
     * The arcTo() method creates an arc/curve between two tangents on the canvas.
     *
     * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
     *
     * @private
     * @param {number} x1 - The x-coordinate of the beginning of the arc
     * @param {number} y1 - The y-coordinate of the beginning of the arc
     * @param {number} x2 - The x-coordinate of the end of the arc
     * @param {number} y2 - The y-coordinate of the end of the arc
     * @param {number} radius - The radius of the arc
     * @return {object} If the arc length is valid, return center of circle, radius and other info otherwise `null`.
     */
    static curveTo(x1: number, y1: number, x2: number, y2: number, radius: number, points: Array<number>): IArcLikeShape;
    /**
     * The arc method creates an arc/curve (used to create circles, or parts of circles).
     *
     * @private
     * @param {number} startX - Start x location of arc
     * @param {number} startY - Start y location of arc
     * @param {number} cx - The x-coordinate of the center of the circle
     * @param {number} cy - The y-coordinate of the center of the circle
     * @param {number} radius - The radius of the circle
     * @param {number} startAngle - The starting angle, in radians (0 is at the 3 o'clock position
     *  of the arc's circle)
     * @param {number} endAngle - The ending angle, in radians
     * @param {boolean} anticlockwise - Specifies whether the drawing should be
     *  counter-clockwise or clockwise. False is default, and indicates clockwise, while true
     *  indicates counter-clockwise.
     * @param {number[]} points - Collection of points to add to
     */
    static arc(_startX: number, _startY: number, cx: number, cy: number, radius: number, startAngle: number, endAngle: number, _anticlockwise: boolean, points: Array<number>): void;
}

/**
 * A structure to hold interim batch objects for Graphics.
 * @class
 * @memberof PIXI.graphicsUtils
 */
declare class BatchPart {
    style: LineStyle | FillStyle;
    start: number;
    size: number;
    attribStart: number;
    attribSize: number;
    constructor();
    /**
     * Begin batch part
     *
     * @param {PIXI.FillStyle | PIXI.LineStyle} style
     * @param {number} startIndex
     * @param {number} attribStart
     */
    begin(style: LineStyle | FillStyle, startIndex: number, attribStart: number): void;
    /**
     * End batch part
     *
     * @param {number} endIndex
     * @param {number} endAttrib
     */
    end(endIndex: number, endAttrib: number): void;
    reset(): void;
}

/**
 * Utilities for bezier curves
 * @class
 * @private
 */
declare class BezierUtils {
    /**
     * Calculate length of bezier curve.
     * Analytical solution is impossible, since it involves an integral that does not integrate in general.
     * Therefore numerical solution is used.
     *
     * @private
     * @param {number} fromX - Starting point x
     * @param {number} fromY - Starting point y
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} cpX2 - Second Control point x
     * @param {number} cpY2 - Second Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @return {number} Length of bezier curve
     */
    static curveLength(fromX: number, fromY: number, cpX: number, cpY: number, cpX2: number, cpY2: number, toX: number, toY: number): number;
    /**
     * Calculate the points for a bezier curve and then draws it.
     *
     * Ignored from docs since it is not directly exposed.
     *
     * @ignore
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} cpX2 - Second Control point x
     * @param {number} cpY2 - Second Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @param {number[]} points - Path array to push points into
     */
    static curveTo(cpX: number, cpY: number, cpX2: number, cpY2: number, toX: number, toY: number, points: Array<number>): void;
}

/**
 * Builds a line to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.GraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {PIXI.GraphicsGeometry} graphicsGeometry - Geometry where to append output
 */
declare function buildLine(graphicsData: GraphicsData, graphicsGeometry: GraphicsGeometry): void;

/**
 * Fill style object for Graphics.
 *
 * @class
 * @memberof PIXI
 */
export declare class FillStyle {
    /**
     * The hex color value used when coloring the Graphics object.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    color: number;
    /**
     * The alpha value used when filling the Graphics object.
     *
     * @member {number}
     * @default 1
     */
    alpha: number;
    /**
     * The texture to be used for the fill.
     *
     * @member {PIXI.Texture}
     * @default 0
     */
    texture: Texture;
    /**
     * The transform aplpied to the texture.
     *
     * @member {PIXI.Matrix}
     * @default null
     */
    matrix: Matrix;
    /**
     * If the current fill is visible.
     *
     * @member {boolean}
     * @default false
     */
    visible: boolean;
    constructor();
    /**
     * Clones the object
     *
     * @return {PIXI.FillStyle}
     */
    clone(): FillStyle;
    /**
     * Reset
     */
    reset(): void;
    /**
     * Destroy and don't use after this
     */
    destroy(): void;
}

export declare interface Graphics extends GlobalMixins.Graphics, Container {
}

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
export declare class Graphics extends Container {
    /**
     * Temporary point to use for containsPoint
     *
     * @static
     * @private
     * @member {PIXI.Point}
     */
    static _TEMP_POINT: Point;
    shader: Shader;
    pluginName: string;
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
    private state;
    private _geometry;
    /**
     * Includes vertex positions, face indices, normals, colors, UVs, and
     * custom attributes within buffers, reducing the cost of passing all
     * this data to the GPU. Can be shared between multiple Mesh or Graphics objects.
     *
     * @member {PIXI.GraphicsGeometry}
     * @readonly
     */
    get geometry(): GraphicsGeometry;
    /**
     * @param {PIXI.GraphicsGeometry} [geometry=null] - Geometry to use, if omitted
     *        will create a new GraphicsGeometry instance.
     */
    constructor(geometry?: GraphicsGeometry);
    /**
     * Creates a new Graphics object with the same values as this one.
     * Note that only the geometry of the object is cloned, not its transform (position,scale,etc)
     *
     * @return {PIXI.Graphics} A clone of the graphics object
     */
    clone(): Graphics;
    /**
     * The blend mode to be applied to the graphic shape. Apply a value of
     * `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL;
     * @see PIXI.BLEND_MODES
     */
    set blendMode(value: BLEND_MODES);
    get blendMode(): BLEND_MODES;
    /**
     * The tint applied to the graphic shape. This is a hex value. A value of
     * 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    get tint(): number;
    set tint(value: number);
    /**
     * The current fill style.
     *
     * @member {PIXI.FillStyle}
     * @readonly
     */
    get fill(): FillStyle;
    /**
     * The current line style.
     *
     * @member {PIXI.LineStyle}
     * @readonly
     */
    get line(): LineStyle;
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
     * @param {PIXI.LINE_CAP}[options.cap=PIXI.LINE_CAP.BUTT] - line cap style
     * @param {PIXI.LINE_JOIN}[options.join=PIXI.LINE_JOIN.MITER] - line join style
     * @param {number}[options.miterLimit=10] - miter limit ratio
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    lineStyle(options?: ILineStyleOptions): this;
    /**
     * Like line style but support texture for line fill.
     *
     * @param {object} [options] - Collection of options for setting line style.
     * @param {number} [options.width=0] - width of the line to draw, will update the objects stored style
     * @param {PIXI.Texture} [options.texture=PIXI.Texture.WHITE] - Texture to use
     * @param {number} [options.color=0x0] - color of the line to draw, will update the objects stored style.
     *  Default 0xFFFFFF if texture present.
     * @param {number} [options.alpha=1] - alpha of the line to draw, will update the objects stored style
     * @param {PIXI.Matrix} [options.matrix=null] - Texture matrix to transform texture
     * @param {number} [options.alignment=0.5] - alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
     * @param {boolean} [options.native=false] - If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     * @param {PIXI.LINE_CAP}[options.cap=PIXI.LINE_CAP.BUTT] - line cap style
     * @param {PIXI.LINE_JOIN}[options.join=PIXI.LINE_JOIN.MITER] - line join style
     * @param {number}[options.miterLimit=10] - miter limit ratio
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    lineTextureStyle(options: ILineStyleOptions): this;
    /**
     * Start a polygon object internally
     * @protected
     */
    protected startPoly(): void;
    /**
     * Finish the polygon object.
     * @protected
     */
    finishPoly(): void;
    /**
     * Moves the current drawing position to x, y.
     *
     * @param {number} x - the X coordinate to move to
     * @param {number} y - the Y coordinate to move to
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    moveTo(x: number, y: number): this;
    /**
     * Draws a line using the current line style from the current drawing position to (x, y);
     * The current drawing position is then set to (x, y).
     *
     * @param {number} x - the X coordinate to draw to
     * @param {number} y - the Y coordinate to draw to
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    lineTo(x: number, y: number): this;
    /**
     * Initialize the curve
     *
     * @protected
     * @param {number} [x=0]
     * @param {number} [y=0]
     */
    protected _initCurve(x?: number, y?: number): void;
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
    quadraticCurveTo(cpX: number, cpY: number, toX: number, toY: number): this;
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
    bezierCurveTo(cpX: number, cpY: number, cpX2: number, cpY2: number, toX: number, toY: number): this;
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
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this;
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
    arc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): this;
    /**
     * Specifies a simple one-color fill that subsequent calls to other Graphics methods
     * (such as lineTo() or drawCircle()) use when drawing.
     *
     * @param {number} [color=0] - the color of the fill
     * @param {number} [alpha=1] - the alpha of the fill
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    beginFill(color?: number, alpha?: number): this;
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
    beginTextureFill(options: IFillStyleOptions): this;
    /**
     * Applies a fill to the lines and shapes that were added since the last call to the beginFill() method.
     *
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    endFill(): this;
    /**
     * Draws a rectangle shape.
     *
     * @param {number} x - The X coord of the top-left of the rectangle
     * @param {number} y - The Y coord of the top-left of the rectangle
     * @param {number} width - The width of the rectangle
     * @param {number} height - The height of the rectangle
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawRect(x: number, y: number, width: number, height: number): this;
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
    drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): this;
    /**
     * Draws a circle.
     *
     * @param {number} x - The X coordinate of the center of the circle
     * @param {number} y - The Y coordinate of the center of the circle
     * @param {number} radius - The radius of the circle
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawCircle(x: number, y: number, radius: number): this;
    /**
     * Draws an ellipse.
     *
     * @param {number} x - The X coordinate of the center of the ellipse
     * @param {number} y - The Y coordinate of the center of the ellipse
     * @param {number} width - The half width of the ellipse
     * @param {number} height - The half height of the ellipse
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawEllipse(x: number, y: number, width: number, height: number): this;
    drawPolygon(...path: Array<number> | Array<Point>): this;
    drawPolygon(path: Array<number> | Array<Point> | Polygon): this;
    /**
     * Draw any shape.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - Shape to draw
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawShape(shape: IShape): this;
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
    drawStar(x: number, y: number, points: number, radius: number, innerRadius: number, rotation?: number): this;
    /**
     * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
     *
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    clear(): this;
    /**
     * True if graphics consists of one rectangle, and thus, can be drawn like a Sprite and
     * masked with gl.scissor.
     *
     * @returns {boolean} True if only 1 rect.
     */
    isFastRect(): boolean;
    /**
     * Renders the object using the WebGL renderer
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _render(renderer: Renderer): void;
    /**
     * Populating batches for rendering
     *
     * @protected
     */
    protected _populateBatches(): void;
    /**
     * Renders the batches using the BathedRenderer plugin
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _renderBatched(renderer: Renderer): void;
    /**
     * Renders the graphics direct
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _renderDirect(renderer: Renderer): void;
    /**
     * Renders specific DrawCall
     *
     * @param {PIXI.Renderer} renderer
     * @param {PIXI.BatchDrawCall} drawCall
     */
    protected _renderDrawCallDirect(renderer: Renderer, drawCall: BatchDrawCall): void;
    /**
     * Resolves shader for direct rendering
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _resolveDirectShader(renderer: Renderer): Shader;
    /**
     * Retrieves the bounds of the graphic shape as a rectangle object
     *
     * @protected
     */
    protected _calculateBounds(): void;
    /**
     * Tests if a point is inside this graphics object
     *
     * @param {PIXI.IPointData} point - the point to test
     * @return {boolean} the result of the test
     */
    containsPoint(point: IPointData): boolean;
    /**
     * Recalcuate the tint by applying tin to batches using Graphics tint.
     * @protected
     */
    protected calculateTints(): void;
    /**
     * If there's a transform update or a change to the shape of the
     * geometry, recaculate the vertices.
     * @protected
     */
    protected calculateVertices(): void;
    /**
     * Closes the current path.
     *
     * @return {PIXI.Graphics} Returns itself.
     */
    closePath(): this;
    /**
     * Apply a matrix to the positional data.
     *
     * @param {PIXI.Matrix} matrix - Matrix to use for transform current shape.
     * @return {PIXI.Graphics} Returns itself.
     */
    setMatrix(matrix: Matrix): this;
    /**
     * Begin adding holes to the last draw shape
     * IMPORTANT: holes must be fully inside a shape to work
     * Also weirdness ensues if holes overlap!
     * Ellipses, Circles, Rectangles and Rounded Rectangles cannot be holes or host for holes in CanvasRenderer,
     * please use `moveTo` `lineTo`, `quadraticCurveTo` if you rely on pixi-legacy bundle.
     * @return {PIXI.Graphics} Returns itself.
     */
    beginHole(): this;
    /**
     * End adding holes to the last draw shape
     * @return {PIXI.Graphics} Returns itself.
     */
    endHole(): this;
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
    destroy(options: IDestroyOptions | boolean): void;
}

/**
 * Graphics curves resolution settings. If `adaptive` flag is set to `true`,
 * the resolution is calculated based on the curve's length to ensure better visual quality.
 * Adaptive draw works with `bezierCurveTo` and `quadraticCurveTo`.
 *
 * @static
 * @constant
 * @memberof PIXI
 * @name GRAPHICS_CURVES
 * @type {object}
 * @property {boolean} adaptive=false - flag indicating if the resolution should be adaptive
 * @property {number} maxLength=10 - maximal length of a single segment of the curve (if adaptive = false, ignored)
 * @property {number} minSegments=8 - minimal number of segments in the curve (if adaptive = false, ignored)
 * @property {number} maxSegments=2048 - maximal number of segments in the curve (if adaptive = false, ignored)
 */
export declare const GRAPHICS_CURVES: IGraphicsCurvesSettings;

/**
 * A class to contain data useful for Graphics objects
 *
 * @class
 * @memberof PIXI
 */
export declare class GraphicsData {
    shape: IShape;
    lineStyle: LineStyle;
    fillStyle: FillStyle;
    matrix: Matrix;
    type: SHAPES;
    points: number[];
    holes: Array<GraphicsData>;
    /**
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @param {PIXI.FillStyle} [fillStyle] - the width of the line to draw
     * @param {PIXI.LineStyle} [lineStyle] - the color of the line to draw
     * @param {PIXI.Matrix} [matrix] - Transform matrix
     */
    constructor(shape: IShape, fillStyle?: FillStyle, lineStyle?: LineStyle, matrix?: Matrix);
    /**
     * Creates a new GraphicsData object with the same values as this one.
     *
     * @return {PIXI.GraphicsData} Cloned GraphicsData object
     */
    clone(): GraphicsData;
    /**
     * Destroys the Graphics data.
     *
     */
    destroy(): void;
}

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * GraphicsGeometry is designed to not be continually updating the geometry since it's expensive
 * to re-tesselate using **earcut**. Consider using {@link PIXI.Mesh} for this use-case, it's much faster.
 *
 * @class
 * @extends PIXI.BatchGeometry
 * @memberof PIXI
 */
export declare class GraphicsGeometry extends BatchGeometry {
    /**
     * The maximum number of points to consider an object "batchable",
     * able to be batched by the renderer's batch system.
     *
     * @memberof PIXI.GraphicsGeometry
     * @static
     * @member {number} BATCHABLE_SIZE
     * @default 100
     */
    static BATCHABLE_SIZE: number;
    closePointEps: number;
    boundsPadding: number;
    uvsFloat32: Float32Array;
    indicesUint16: Uint16Array | Uint32Array;
    batchable: boolean;
    points: Array<number>;
    colors: Array<number>;
    uvs: Array<number>;
    indices: Array<number>;
    textureIds: Array<number>;
    graphicsData: Array<GraphicsData>;
    drawCalls: Array<BatchDrawCall>;
    batchDirty: number;
    batches: Array<BatchPart>;
    protected dirty: number;
    protected cacheDirty: number;
    protected clearDirty: number;
    protected shapeIndex: number;
    protected _bounds: Bounds;
    protected boundsDirty: number;
    constructor();
    /**
     * Get the current bounds of the graphic geometry.
     *
     * @member {PIXI.Bounds}
     * @readonly
     */
    get bounds(): Bounds;
    /**
     * Call if you changed graphicsData manually.
     * Empties all batch buffers.
     */
    protected invalidate(): void;
    /**
     * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
     *
     * @return {PIXI.GraphicsGeometry} This GraphicsGeometry object. Good for chaining method calls
     */
    clear(): GraphicsGeometry;
    /**
     * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @param {PIXI.FillStyle} fillStyle - Defines style of the fill.
     * @param {PIXI.LineStyle} lineStyle - Defines style of the lines.
     * @param {PIXI.Matrix} matrix - Transform applied to the points of the shape.
     * @return {PIXI.GraphicsGeometry} Returns geometry for chaining.
     */
    drawShape(shape: IShape_2, fillStyle?: FillStyle, lineStyle?: LineStyle, matrix?: Matrix): GraphicsGeometry;
    /**
     * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @param {PIXI.Matrix} matrix - Transform applied to the points of the shape.
     * @return {PIXI.GraphicsGeometry} Returns geometry for chaining.
     */
    drawHole(shape: IShape_2, matrix?: Matrix): GraphicsGeometry;
    /**
     * Destroys the GraphicsGeometry object.
     *
     */
    destroy(): void;
    /**
     * Check to see if a point is contained within this geometry.
     *
     * @param {PIXI.IPointData} point - Point to check if it's contained.
     * @return {Boolean} `true` if the point is contained within geometry.
     */
    containsPoint(point: IPointData): boolean;
    /**
     * Generates intermediate batch data. Either gets converted to drawCalls
     * or used to convert to batch objects directly by the Graphics object.
     *
     * @param {boolean} [aloow32Indices] - Allow using 32-bit indices for preventings artefacts when more that 65535 vertices
     */
    updateBatches(allow32Indices?: boolean): void;
    /**
     * Affinity check
     *
     * @param {PIXI.FillStyle | PIXI.LineStyle} styleA
     * @param {PIXI.FillStyle | PIXI.LineStyle} styleB
     */
    protected _compareStyles(styleA: FillStyle | LineStyle, styleB: FillStyle | LineStyle): boolean;
    /**
     * Test geometry for batching process.
     *
     * @protected
     */
    protected validateBatching(): boolean;
    /**
     * Offset the indices so that it works with the batcher.
     *
     * @protected
     */
    protected packBatches(): void;
    /**
     * Checks to see if this graphics geometry can be batched.
     * Currently it needs to be small enough and not contain any native lines.
     *
     * @protected
     */
    protected isBatchable(): boolean;
    /**
     * Converts intermediate batches data to drawCalls.
     *
     * @protected
     */
    protected buildDrawCalls(): void;
    /**
     * Packs attributes to single buffer.
     *
     * @protected
     */
    protected packAttributes(): void;
    /**
     * Process fill part of Graphics.
     *
     * @param {PIXI.GraphicsData} data
     * @protected
     */
    protected processFill(data: GraphicsData): void;
    /**
     * Process line part of Graphics.
     *
     * @param {PIXI.GraphicsData} data
     * @protected
     */
    protected processLine(data: GraphicsData): void;
    /**
     * Process the holes data.
     *
     * @param {PIXI.GraphicsData[]} holes - Holes to render
     * @protected
     */
    protected processHoles(holes: Array<GraphicsData>): void;
    /**
     * Update the local bounds of the object. Expensive to use performance-wise.
     *
     * @protected
     */
    protected calculateBounds(): void;
    /**
     * Transform points using matrix.
     *
     * @protected
     * @param {number[]} points - Points to transform
     * @param {PIXI.Matrix} matrix - Transform matrix
     */
    protected transformPoints(points: Array<number>, matrix: Matrix): void;
    /**
     * Add colors.
     *
     * @protected
     * @param {number[]} colors - List of colors to add to
     * @param {number} color - Color to add
     * @param {number} alpha - Alpha to use
     * @param {number} size - Number of colors to add
     */
    protected addColors(colors: Array<number>, color: number, alpha: number, size: number): void;
    /**
     * Add texture id that the shader/fragment wants to use.
     *
     * @protected
     * @param {number[]} textureIds
     * @param {number} id
     * @param {number} size
     */
    protected addTextureIds(textureIds: Array<number>, id: number, size: number): void;
    /**
     * Generates the UVs for a shape.
     *
     * @protected
     * @param {number[]} verts - Vertices
     * @param {number[]} uvs - UVs
     * @param {PIXI.Texture} texture - Reference to Texture
     * @param {number} start - Index buffer start index.
     * @param {number} size - The size/length for index buffer.
     * @param {PIXI.Matrix} [matrix] - Optional transform for all points.
     */
    protected addUvs(verts: Array<number>, uvs: Array<number>, texture: Texture, start: number, size: number, matrix?: Matrix): void;
    /**
     * Modify uvs array according to position of texture region
     * Does not work with rotated or trimmed textures
     *
     * @param {number[]} uvs - array
     * @param {PIXI.Texture} texture - region
     * @param {number} start - starting index for uvs
     * @param {number} size - how many points to adjust
     */
    protected adjustUvs(uvs: Array<number>, texture: Texture, start: number, size: number): void;
}

export declare const graphicsUtils: {
    buildPoly: IShapeBuildCommand;
    buildCircle: IShapeBuildCommand;
    buildRectangle: IShapeBuildCommand;
    buildRoundedRectangle: IShapeBuildCommand;
    buildLine: typeof buildLine;
    Star: typeof Star;
    ArcUtils: typeof ArcUtils;
    BezierUtils: typeof BezierUtils;
    QuadraticUtils: typeof QuadraticUtils;
    BatchPart: typeof BatchPart;
};

declare interface IArcLikeShape {
    cx: number;
    cy: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    anticlockwise: boolean;
}

export declare interface IFillStyleOptions {
    color?: number;
    alpha?: number;
    texture?: Texture;
    matrix?: Matrix;
}

/**
 * Batch element computed from Graphics geometry
 */
export declare interface IGraphicsBatchElement {
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

export declare interface IGraphicsCurvesSettings {
    adaptive: boolean;
    maxLength: number;
    minSegments: number;
    maxSegments: number;
    epsilon: number;
    _segmentsCount(length: number, defaultSegments?: number): number;
}

export declare interface ILineStyleOptions extends IFillStyleOptions {
    width?: number;
    alignment?: number;
    native?: boolean;
    cap?: LINE_CAP;
    join?: LINE_JOIN;
    miterLimit?: number;
}

declare type IShape_2 = Circle | Ellipse | Polygon | Rectangle | RoundedRectangle;

declare interface IShapeBuildCommand {
    build(graphicsData: GraphicsData): void;
    triangulate(graphicsData: GraphicsData, target: GraphicsGeometry): void;
}

/**
 * Support line caps in `PIXI.LineStyle` for graphics.
 *
 * @see PIXI.Graphics#lineStyle
 *
 * @name LINE_CAP
 * @memberof PIXI
 * @static
 * @enum {string}
 * @property {string} BUTT - 'butt': don't add any cap at line ends (leaves orthogonal edges)
 * @property {string} ROUND - 'round': add semicircle at ends
 * @property {string} SQUARE - 'square': add square at end (like `BUTT` except more length at end)
 */
export declare enum LINE_CAP {
    BUTT = "butt",
    ROUND = "round",
    SQUARE = "square"
}

/**
 * Supported line joints in `PIXI.LineStyle` for graphics.
 *
 * @see PIXI.Graphics#lineStyle
 * @see https://graphicdesign.stackexchange.com/questions/59018/what-is-a-bevel-join-of-two-lines-exactly-illustrator
 *
 * @name LINE_JOIN
 * @memberof PIXI
 * @static
 * @enum {string}
 * @property {string} MITER - 'miter': make a sharp corner where outer part of lines meet
 * @property {string} BEVEL - 'bevel': add a square butt at each end of line segment and fill the triangle at turn
 * @property {string} ROUND - 'round': add an arc at the joint
 */
export declare enum LINE_JOIN {
    MITER = "miter",
    BEVEL = "bevel",
    ROUND = "round"
}

/**
 * Represents the line style for Graphics.
 * @memberof PIXI
 * @class
 * @extends PIXI.FillStyle
 */
export declare class LineStyle extends FillStyle {
    /**
     * The width (thickness) of any lines drawn.
     *
     * @member {number}
     * @default 0
     */
    width: number;
    /**
     * The alignment of any lines drawn (0.5 = middle, 1 = outer, 0 = inner).
     *
     * @member {number}
     * @default 0.5
     */
    alignment: number;
    /**
     * If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     *
     * @member {boolean}
     * @default false
     */
    native: boolean;
    /**
     * Line cap style.
     *
     * @member {PIXI.LINE_CAP}
     * @default PIXI.LINE_CAP.BUTT
     */
    cap: LINE_CAP;
    /**
     * Line join style.
     *
     * @member {PIXI.LINE_JOIN}
     * @default PIXI.LINE_JOIN.MITER
     */
    join: LINE_JOIN;
    /**
     * Miter limit.
     *
     * @member {number}
     * @default 10
     */
    miterLimit: number;
    /**
     * Clones the object
     *
     * @return {PIXI.LineStyle}
     */
    clone(): LineStyle;
    /**
     * Reset the line style to default.
     */
    reset(): void;
}

/**
 * Utilities for quadratic curves
 * @class
 * @private
 */
declare class QuadraticUtils {
    /**
     * Calculate length of quadratic curve
     * @see {@link http://www.malczak.linuxpl.com/blog/quadratic-bezier-curve-length/}
     * for the detailed explanation of math behind this.
     *
     * @private
     * @param {number} fromX - x-coordinate of curve start point
     * @param {number} fromY - y-coordinate of curve start point
     * @param {number} cpX - x-coordinate of curve control point
     * @param {number} cpY - y-coordinate of curve control point
     * @param {number} toX - x-coordinate of curve end point
     * @param {number} toY - y-coordinate of curve end point
     * @return {number} Length of quadratic curve
     */
    static curveLength(fromX: number, fromY: number, cpX: number, cpY: number, toX: number, toY: number): number;
    /**
     * Calculate the points for a quadratic bezier curve and then draws it.
     * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
     *
     * @private
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @param {number[]} points - Points to add segments to.
     */
    static curveTo(cpX: number, cpY: number, toX: number, toY: number, points: Array<number>): void;
}

/**
 * Draw a star shape with an arbitrary number of points.
 *
 * @class
 * @extends PIXI.Polygon
 * @memberof PIXI.graphicsUtils
 * @param {number} x - Center X position of the star
 * @param {number} y - Center Y position of the star
 * @param {number} points - The number of points of the star, must be > 1
 * @param {number} radius - The outer radius of the star
 * @param {number} [innerRadius] - The inner radius between points, default half `radius`
 * @param {number} [rotation=0] - The rotation of the star in radians, where 0 is vertical
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
declare class Star extends Polygon {
    constructor(x: number, y: number, points: number, radius: number, innerRadius: number, rotation?: number);
}

export { }
