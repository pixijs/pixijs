import { deprecation, v8_0_0 } from '../../../utils/logging/deprecation';
import { ViewContainer, type ViewContainerOptions } from '../../view/ViewContainer';
import { GraphicsContext } from './GraphicsContext';
import { type GraphicsGpuData } from './GraphicsPipe';

import type { ColorSource } from '../../../color/Color';
import type { Matrix } from '../../../maths/matrix/Matrix';
import type { PointData } from '../../../maths/point/PointData';
import type { Instruction } from '../../../rendering/renderers/shared/instructions/Instruction';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Bounds } from '../../container/bounds/Bounds';
import type { ContextDestroyOptions, DestroyOptions } from '../../container/destroyTypes';
import type { FillInput, FillStyle, StrokeStyle } from './FillTypes';
import type { GraphicsPath } from './path/GraphicsPath';
import type { RoundedPoint } from './path/roundShape';

/**
 * Constructor options used for Graphics instances.
 * Configures the initial state and behavior of a Graphics object.
 * @example
 * ```ts
 * const graphics = new Graphics({
 *     roundPixels: true,
 *     position: { x: 100.5, y: 100.5 }
 * });
 *
 * // Reuse graphics context
 * const sharedContext = new GraphicsContext();
 * const graphics1 = new Graphics({ context: sharedContext });
 * const graphics2 = new Graphics({ context: sharedContext });
 * ```
 * @see {@link Graphics} For the graphics class implementation
 * @see {@link GraphicsContext} For the graphics context API
 * @category scene
 * @standard
 */
export interface GraphicsOptions extends PixiMixins.GraphicsOptions, ViewContainerOptions
{
    /**
     * The GraphicsContext to use, useful for reuse and optimisation
     * If not provided, a new GraphicsContext will be created.
     * @example
     * ```ts
     * const sharedContext = new GraphicsContext();
     * const graphics1 = new Graphics({ context: sharedContext });
     * const graphics2 = new Graphics({ context: sharedContext });
     * ```
     */
    context?: GraphicsContext;
    /**
     * Whether or not to round the x/y position.
     * @default false
     * @example
     * ```ts
     * const graphics = new Graphics({ roundPixels: true });
     * ```
     */
    roundPixels?: boolean;
}
// eslint-disable-next-line requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface Graphics extends PixiMixins.Graphics, ViewContainer<GraphicsGpuData> {}

/**
 * The Graphics class is primarily used to render primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them. It can also be used to create complex
 * masks and hit areas for interaction.
 * @example
 * ```ts
 * // Create a new graphics object
 * const graphics = new Graphics();
 *
 * // Draw a filled rectangle with a stroke
 * graphics
 *     .rect(0, 0, 100, 100)
 *     .fill({ color: 0xff0000 }) // Fill with red
 *     .stroke({ width: 2, color: 0x000000 }); // Stroke with black
 *
 * // Draw a complex shape
 * graphics
 *     .moveTo(50, 50)
 *     .lineTo(100, 100)
 *     .arc(100, 100, 50, 0, Math.PI)
 *     .closePath()
 *     .fill({ color: 0x00ff00, alpha: 0.5 }); // Fill the shape
 *
 * // Use as a mask
 * sprite.mask = graphics;
 * ```
 * @see {@link GraphicsContext} For the underlying drawing API
 * @see {@link GraphicsPath} For path creation
 * @category scene
 * @standard
 */
export class Graphics extends ViewContainer<GraphicsGpuData> implements Instruction
{
    /** @internal */
    public override readonly renderPipeId: string = 'graphics';
    /** @internal */
    public batched: boolean;

    private _context: GraphicsContext;
    private readonly _ownedContext: GraphicsContext;

    /**
     * Creates a new Graphics object.
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

        this.didViewUpdate = true;

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

    /**
     * The underlying graphics context used for drawing operations.
     * Controls how shapes and paths are rendered.
     * @example
     * ```ts
     * // Create a shared context
     * const sharedContext = new GraphicsContext();
     *
     * // Create graphics objects sharing the same context
     * const graphics1 = new Graphics();
     * const graphics2 = new Graphics();
     *
     * // Assign shared context
     * graphics1.context = sharedContext;
     * graphics2.context = sharedContext;
     *
     * // Both graphics will show the same shapes
     * sharedContext
     *     .rect(0, 0, 100, 100)
     *     .fill({ color: 0xff0000 });
     * ```
     * @see {@link GraphicsContext} For drawing operations
     * @see {@link GraphicsOptions} For context configuration
     */
    get context(): GraphicsContext
    {
        return this._context;
    }

    /**
     * The local bounds of the graphics object.
     * Returns the boundaries after all graphical operations but before any transforms.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a shape
     * graphics
     *     .rect(0, 0, 100, 100)
     *     .fill({ color: 0xff0000 });
     *
     * // Get bounds information
     * const bounds = graphics.bounds;
     * console.log(bounds.width);  // 100
     * console.log(bounds.height); // 100
     * ```
     * @readonly
     * @see {@link Bounds} For bounds operations
     * @see {@link Container#getBounds} For transformed bounds
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
     * Returns true if the point lies within the Graphics object's rendered area.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a shape
     * graphics
     *     .rect(0, 0, 100, 100)
     *     .fill({ color: 0xff0000 });
     *
     * // Check point intersection
     * if (graphics.containsPoint({ x: 50, y: 50 })) {
     *     console.log('Point is inside rectangle!');
     * }
     * ```
     * @param point - The point to check in local coordinates
     * @returns True if the point is inside the Graphics object
     * @see {@link Graphics#bounds} For bounding box checks
     * @see {@link PointData} For point data structure
     */
    public override containsPoint(point: PointData)
    {
        return this._context.containsPoint(point);
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
     * @example
     * ```ts
     * // Destroy the graphics and its context
     * graphics.destroy();
     * graphics.destroy(true);
     * graphics.destroy({ context: true, texture: true, textureSource: true });
     * ```
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
     * Sets the current fill style of the graphics context.
     * The fill style can be a color, gradient, pattern, or a complex style object.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Basic color fill
     * graphics
     *     .setFillStyle({ color: 0xff0000 }) // Red fill
     *     .rect(0, 0, 100, 100)
     *     .fill();
     *
     * // Gradient fill
     * const gradient = new FillGradient({
     *    end: { x: 1, y: 0 },
     *    colorStops: [
     *         { offset: 0, color: 0xff0000 }, // Red at start
     *         { offset: 0.5, color: 0x00ff00 }, // Green at middle
     *         { offset: 1, color: 0x0000ff }, // Blue at end
     *    ],
     * });
     *
     * graphics
     *     .setFillStyle(gradient)
     *     .circle(100, 100, 50)
     *     .fill();
     *
     * // Pattern fill
     * const pattern = new FillPattern(texture);
     * graphics
     *     .setFillStyle({
     *         fill: pattern,
     *         alpha: 0.5
     *     })
     *     .rect(0, 0, 200, 200)
     *     .fill();
     * ```
     * @param {FillInput} args - The fill style to apply
     * @returns The Graphics instance for chaining
     * @see {@link FillStyle} For fill style options
     * @see {@link FillGradient} For gradient fills
     * @see {@link FillPattern} For pattern fills
     */
    public setFillStyle(...args: Parameters<GraphicsContext['setFillStyle']>): this
    {
        return this._callContextMethod('setFillStyle', args);
    }

    /**
     * Sets the current stroke style of the graphics context.
     * Similar to fill styles, stroke styles can encompass colors, gradients, patterns, or more detailed configurations.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Basic color stroke
     * graphics
     *     .setStrokeStyle({
     *         width: 2,
     *         color: 0x000000
     *     })
     *     .rect(0, 0, 100, 100)
     *     .stroke();
     *
     * // Complex stroke style
     * graphics
     *     .setStrokeStyle({
     *         width: 4,
     *         color: 0xff0000,
     *         alpha: 0.5,
     *         join: 'round',
     *         cap: 'round',
     *         alignment: 0.5
     *     })
     *     .circle(100, 100, 50)
     *     .stroke();
     *
     * // Gradient stroke
     * const gradient = new FillGradient({
     *    end: { x: 1, y: 0 },
     *    colorStops: [
     *         { offset: 0, color: 0xff0000 }, // Red at start
     *         { offset: 0.5, color: 0x00ff00 }, // Green at middle
     *         { offset: 1, color: 0x0000ff }, // Blue at end
     *    ],
     * });
     *
     * graphics
     *     .setStrokeStyle({
     *         width: 10,
     *         fill: gradient
     *     })
     *     .poly([0,0, 100,50, 0,100])
     *     .stroke();
     * ```
     * @param {StrokeInput} args - The stroke style to apply
     * @returns The Graphics instance for chaining
     * @see {@link StrokeStyle} For stroke style options
     * @see {@link FillGradient} For gradient strokes
     * @see {@link FillPattern} For pattern strokes
     */
    public setStrokeStyle(...args: Parameters<GraphicsContext['setStrokeStyle']>): this
    {
        return this._callContextMethod('setStrokeStyle', args);
    }

    /**
     * Fills the current or given path with the current fill style or specified style.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Fill with direct color
     * graphics
     *     .circle(50, 50, 25)
     *     .fill('red'); // Red fill
     *
     * // Fill with texture
     * graphics
     *    .rect(0, 0, 100, 100)
     *    .fill(myTexture); // Fill with texture
     *
     * // Fill with complex style
     * graphics
     *     .rect(0, 0, 100, 100)
     *     .fill({
     *         color: 0x00ff00,
     *         alpha: 0.5,
     *         texture: myTexture,
     *         matrix: new Matrix()
     *     });
     *
     * // Fill with gradient
     * const gradient = new FillGradient({
     *     end: { x: 1, y: 0 },
     *     colorStops: [
     *         { offset: 0, color: 0xff0000 },
     *         { offset: 0.5, color: 0x00ff00 },
     *         { offset: 1, color: 0x0000ff },
     *     ],
     * });
     *
     * graphics
     *     .circle(100, 100, 50)
     *     .fill(gradient);
     * ```
     * @param {FillInput} style - The style to fill the path with. Can be:
     * - A ColorSource
     * - A gradient
     * - A pattern
     * - A complex style object
     * If omitted, uses current fill style.
     * @returns The Graphics instance for chaining
     * @see {@link FillStyle} For fill style options
     * @see {@link FillGradient} For gradient fills
     * @see {@link FillPattern} For pattern fills
     */
    public fill(style?: FillInput): this;
    /** @deprecated 8.0.0 */
    public fill(color: ColorSource, alpha?: number): this;
    public fill(...args: [FillStyle | ColorSource, number?]): this
    {
        return this._callContextMethod('fill', args);
    }
    /**
     * Strokes the current path with the current stroke style or specified style.
     * Outlines the shape using the stroke settings.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Stroke with direct color
     * graphics
     *     .circle(50, 50, 25)
     *     .stroke({
     *         width: 2,
     *         color: 0xff0000
     *     }); // 2px red stroke
     *
     * // Fill with texture
     * graphics
     *    .rect(0, 0, 100, 100)
     *    .stroke(myTexture); // Fill with texture
     *
     * // Stroke with gradient
     * const gradient = new FillGradient({
     *     end: { x: 1, y: 0 },
     *     colorStops: [
     *         { offset: 0, color: 0xff0000 },
     *         { offset: 0.5, color: 0x00ff00 },
     *         { offset: 1, color: 0x0000ff },
     *     ],
     * });
     *
     * graphics
     *     .rect(0, 0, 100, 100)
     *     .stroke({
     *         width: 4,
     *         fill: gradient,
     *         alignment: 0.5,
     *         join: 'round'
     *     });
     * ```
     * @param {StrokeStyle} args - Optional stroke style to apply. Can be:
     * - A stroke style object with width, color, etc.
     * - A gradient
     * - A pattern
     * If omitted, uses current stroke style.
     * @returns The Graphics instance for chaining
     * @see {@link StrokeStyle} For stroke style options
     * @see {@link FillGradient} For gradient strokes
     * @see {@link setStrokeStyle} For setting default stroke style
     */
    public stroke(...args: Parameters<GraphicsContext['stroke']>): this
    {
        return this._callContextMethod('stroke', args);
    }
    /**
     * Adds a texture to the graphics context. This method supports multiple ways to draw textures
     * including basic textures, tinted textures, and textures with custom dimensions.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Basic texture drawing
     * graphics.texture(myTexture);
     *
     * // Tinted texture with position
     * graphics.texture(myTexture, 0xff0000); // Red tint
     *
     * // Texture with custom position and dimensions
     * graphics
     *     .texture(
     *         myTexture,    // texture
     *         0xffffff,     // white tint
     *         100, 100,     // position
     *         200, 150      // dimensions
     *     );
     * ```
     * Basic texture drawing:
     * @param texture - The Texture object to use.
     * @returns The instance of the current Graphics for chaining.
     *
     * Extended texture drawing:
     * @param texture - The Texture object to use.
     *        tint - A ColorSource to tint the texture (defaults to white).
     *        dx - The x-coordinate for the texture placement.
     *        dy - The y-coordinate for the texture placement.
     *        dw - The width to draw the texture (defaults to texture width).
     *        dh - The height to draw the texture (defaults to texture height).
     * @returns The instance of the current Graphics for chaining.
     * @see {@link Texture} For texture creation
     * @see {@link FillPattern} For pattern fills
     */
    public texture(texture: Texture): this;
    public texture(texture: Texture, tint?: ColorSource, dx?: number, dy?: number, dw?: number, dh?: number): this;
    public texture(...args: [Texture, number?, number?, number?, number?, number?]): this
    {
        return this._callContextMethod('texture', args);
    }
    /**
     * Resets the current path. Any previous path and its commands are discarded and a new path is
     * started. This is typically called before beginning a new shape or series of drawing commands.
     * @example
     * ```ts
     * const graphics = new Graphics();
     * graphics
     *     .circle(150, 150, 50)
     *     .fill({ color: 0x00ff00 })
     *     .beginPath() // Starts a new path
     *     .circle(250, 150, 50)
     *     .fill({ color: 0x0000ff });
     * ```
     * @returns The Graphics instance for chaining
     * @see {@link Graphics#moveTo} For starting a new subpath
     * @see {@link Graphics#closePath} For closing the current path
     */
    public beginPath(): this
    {
        return this._callContextMethod('beginPath', []);
    }
    /**
     * Applies a cutout to the last drawn shape. This is used to create holes or complex shapes by
     * subtracting a path from the previously drawn path.
     *
     * If a hole is not completely in a shape, it will fail to cut correctly.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw outer circle
     * graphics
     *     .circle(100, 100, 50)
     *     .fill({ color: 0xff0000 });
     *     .circle(100, 100, 25) // Inner circle
     *     .cut() // Cuts out the inner circle from the outer circle
     * ```
     */
    public cut(): this
    {
        return this._callContextMethod('cut', []);
    }
    /**
     * Adds an arc to the current path, which is centered at (x, y) with the specified radius,
     * starting and ending angles, and direction.
     * @example
     * ```ts
     * // Draw a simple arc (quarter circle)
     * const graphics = new Graphics();
     * graphics
     *     .arc(100, 100, 50, 0, Math.PI/2)
     *     .stroke({ width: 2, color: 0xff0000 });
     *
     * // Draw a full circle using an arc
     * graphics
     *     .arc(200, 200, 30, 0, Math.PI * 2)
     *     .stroke({ color: 0x00ff00 });
     *
     * // Draw a counterclockwise arc
     * graphics
     *     .arc(150, 150, 40, Math.PI, 0, true)
     *     .stroke({ width: 2, color: 0x0000ff });
     * ```
     * @param x - The x-coordinate of the arc's center
     * @param y - The y-coordinate of the arc's center
     * @param radius - The arc's radius (must be positive)
     * @param startAngle - The starting point of the arc, in radians
     * @param endAngle - The end point of the arc, in radians
     * @param counterclockwise - Optional. If true, draws the arc counterclockwise.
     *                          If false (default), draws clockwise.
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#circle} For drawing complete circles
     * @see {@link Graphics#arcTo} For drawing arcs between points
     * @see {@link Graphics#arcToSvg} For SVG-style arc drawing
     */
    public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): this;
    public arc(...args: Parameters<GraphicsContext['arc']>): this
    {
        return this._callContextMethod('arc', args);
    }
    /**
     * Adds an arc to the current path that connects two points using a radius.
     * The arc is drawn between the current point and the specified end point,
     * using the given control point to determine the curve of the arc.
     * @example
     * ```ts
     * // Draw a simple curved corner
     * const graphics = new Graphics();
     * graphics
     *     .moveTo(50, 50)
     *     .arcTo(100, 50, 100, 100, 20) // Rounded corner with 20px radius
     *     .stroke({ width: 2, color: 0xff0000 });
     *
     * // Create a rounded rectangle using arcTo
     * graphics
     *     .moveTo(150, 150)
     *     .arcTo(250, 150, 250, 250, 30) // Top right corner
     *     .arcTo(250, 250, 150, 250, 30) // Bottom right corner
     *     .arcTo(150, 250, 150, 150, 30) // Bottom left corner
     *     .arcTo(150, 150, 250, 150, 30) // Top left corner
     *     .fill({ color: 0x00ff00 });
     * ```
     * @param x1 - The x-coordinate of the control point
     * @param y1 - The y-coordinate of the control point
     * @param x2 - The x-coordinate of the end point
     * @param y2 - The y-coordinate of the end point
     * @param radius - The radius of the arc in pixels (must be positive)
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#arc} For drawing arcs using center point and angles
     * @see {@link Graphics#arcToSvg} For SVG-style arc drawing
     * @see {@link Graphics#roundRect} For drawing rectangles with rounded corners
     */
    public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this;
    public arcTo(...args: Parameters<GraphicsContext['arcTo']>): this
    {
        return this._callContextMethod('arcTo', args);
    }
    /**
     * Adds an SVG-style arc to the path, allowing for elliptical arcs based on the SVG spec.
     * This is particularly useful when converting SVG paths to Graphics or creating complex curved shapes.
     * @example
     * ```ts
     * // Draw a simple elliptical arc
     * const graphics = new Graphics();
     * graphics
     *     .moveTo(100, 100)
     *     .arcToSvg(50, 30, 0, 0, 1, 200, 100)
     *     .stroke({ width: 2, color: 0xff0000 });
     *
     * // Create a complex path with rotated elliptical arc
     * graphics
     *     .moveTo(150, 150)
     *     .arcToSvg(
     *         60,    // rx
     *         30,    // ry
     *         45,    // x-axis rotation (45 degrees)
     *         1,     // large arc flag
     *         0,     // sweep flag
     *         250,   // end x
     *         200    // end y
     *     )
     *     .stroke({ width: 4, color: 0x00ff00 });
     *
     * // Chain multiple arcs for complex shapes
     * graphics
     *     .moveTo(300, 100)
     *     .arcToSvg(40, 20, 0, 0, 1, 350, 150)
     *     .arcToSvg(40, 20, 0, 0, 1, 300, 200)
     *     .fill({ color: 0x0000ff, alpha: 0.5 });
     * ```
     * @param rx - The x-radius of the ellipse (must be non-negative)
     * @param ry - The y-radius of the ellipse (must be non-negative)
     * @param xAxisRotation - The rotation of the ellipse's x-axis relative to the x-axis, in degrees
     * @param largeArcFlag - Either 0 or 1, determines if the larger of the two possible arcs is chosen (1) or not (0)
     * @param sweepFlag - Either 0 or 1, determines if the arc should be swept in
     *                    a positive angle direction (1) or negative (0)
     * @param x - The x-coordinate of the arc's end point
     * @param y - The y-coordinate of the arc's end point
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#arc} For simple circular arcs
     * @see {@link Graphics#arcTo} For connecting points with circular arcs
     * @see {@link Graphics#svg} For parsing complete SVG paths
     */
    public arcToSvg(
        rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number
    ): this;
    public arcToSvg(...args: Parameters<GraphicsContext['arcToSvg']>): this
    {
        return this._callContextMethod('arcToSvg', args);
    }
    /**
     * Adds a cubic Bézier curve to the path, from the current point to the specified end point.
     * The curve is influenced by two control points that define its shape and curvature.
     * @example
     * ```ts
     * // Draw a simple curved line
     * const graphics = new Graphics();
     * graphics
     *     .moveTo(50, 50)
     *     .bezierCurveTo(
     *         100, 25,   // First control point
     *         150, 75,   // Second control point
     *         200, 50    // End point
     *     )
     *     .stroke({ width: 2, color: 0xff0000 });
     *
     * // Adjust curve smoothness
     * graphics
     *     .moveTo(50, 200)
     *     .bezierCurveTo(
     *         100, 150,
     *         200, 250,
     *         250, 200,
     *         0.5         // Smoothness factor
     *     )
     *     .stroke({ width: 4, color: 0x0000ff });
     * ```
     * @param cp1x - The x-coordinate of the first control point
     * @param cp1y - The y-coordinate of the first control point
     * @param cp2x - The x-coordinate of the second control point
     * @param cp2y - The y-coordinate of the second control point
     * @param x - The x-coordinate of the end point
     * @param y - The y-coordinate of the end point
     * @param smoothness - Optional parameter to adjust the curve's smoothness (0-1)
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#quadraticCurveTo} For simpler curves with one control point
     * @see {@link Graphics#arc} For circular arcs
     * @see {@link Graphics#arcTo} For connecting points with circular arcs
     */
    public bezierCurveTo(
        cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, smoothness?: number
    ): this;
    public bezierCurveTo(...args: Parameters<GraphicsContext['bezierCurveTo']>): this
    {
        return this._callContextMethod('bezierCurveTo', args);
    }
    /**
     * Closes the current path by drawing a straight line back to the start point.
     *
     * This is useful for completing shapes and ensuring they are properly closed for fills.
     * @example
     * ```ts
     * // Create a triangle with closed path
     * const graphics = new Graphics();
     * graphics
     *     .moveTo(50, 50)
     *     .lineTo(100, 100)
     *     .lineTo(0, 100)
     *     .closePath()
     * ```
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#beginPath} For starting a new path
     * @see {@link Graphics#fill} For filling closed paths
     * @see {@link Graphics#stroke} For stroking paths
     */
    public closePath(): this
    {
        return this._callContextMethod('closePath', []);
    }
    /**
     * Draws an ellipse at the specified location and with the given x and y radii.
     * An optional transformation can be applied, allowing for rotation, scaling, and translation.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a basic ellipse
     * graphics
     *     .ellipse(100, 100, 50, 30)
     *     .fill({ color: 0xff0000 });
     *
     * // Draw an ellipse with stroke
     * graphics
     *     .ellipse(200, 100, 70, 40)
     *     .stroke({ width: 2, color: 0x00ff00 });
     * ```
     * @param x - The x-coordinate of the center of the ellipse
     * @param y - The y-coordinate of the center of the ellipse
     * @param radiusX - The horizontal radius of the ellipse
     * @param radiusY - The vertical radius of the ellipse
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#circle} For drawing perfect circles
     * @see {@link Graphics#arc} For drawing partial circular arcs
     */
    public ellipse(x: number, y: number, radiusX: number, radiusY: number): this;
    public ellipse(...args: Parameters<GraphicsContext['ellipse']>): this
    {
        return this._callContextMethod('ellipse', args);
    }
    /**
     * Draws a circle shape at the specified location with the given radius.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a simple filled circle
     * graphics
     *     .circle(100, 100, 50)
     *     .fill({ color: 0xff0000 });
     *
     * // Draw a circle with gradient fill
     * const gradient = new FillGradient({
     *     end: { x: 1, y: 0 },
     *     colorStops: [
     *           { offset: 0, color: 0xff0000 }, // Red at start
     *           { offset: 0.5, color: 0x00ff00 }, // Green at middle
     *           { offset: 1, color: 0x0000ff }, // Blue at end
     *     ],
     * });
     *
     * graphics
     *     .circle(250, 100, 40)
     *     .fill({ fill: gradient });
     * ```
     * @param x - The x-coordinate of the center of the circle
     * @param y - The y-coordinate of the center of the circle
     * @param radius - The radius of the circle
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#ellipse} For drawing ellipses
     * @see {@link Graphics#arc} For drawing partial circles
     */
    public circle(x: number, y: number, radius: number): this;
    public circle(...args: Parameters<GraphicsContext['circle']>): this
    {
        return this._callContextMethod('circle', args);
    }
    /**
     * Adds another `GraphicsPath` to this path, optionally applying a transformation.
     * This allows for reuse of complex paths and shapes across different graphics instances.
     * @example
     * ```ts
     * const graphics = new Graphics();
     * // Create a reusable path
     * const heartPath = new GraphicsPath()
     *     .moveTo(0, 0)
     *     .bezierCurveTo(-50, -25, -50, -75, 0, -100)
     *     .bezierCurveTo(50, -75, 50, -25, 0, 0);
     *
     * // Use the path multiple times
     * graphics
     *     .path(heartPath)
     *     .fill({ color: 0xff0000 })
     *     .translateTransform(200, 200)
     *     .path(heartPath)
     *     .fill({ color: 0xff0000, alpha: 0.5 });
     * ```
     * @param path - The `GraphicsPath` to add to the current path
     * @returns The Graphics instance for method chaining
     * @see {@link GraphicsPath} For creating reusable paths
     * @see {@link Matrix} For creating transformations
     * @see {@link Graphics#transform} For applying transformations
     */
    public path(path: GraphicsPath): this;
    public path(...args: Parameters<GraphicsContext['path']>): this
    {
        return this._callContextMethod('path', args);
    }
    /**
     * Connects the current point to a new point with a straight line.
     * Any subsequent drawing commands will start from this new point.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a triangle
     * graphics
     *     .moveTo(50, 50)
     *     .lineTo(100, 100)
     *     .lineTo(0, 100)
     *     .fill({ color: 0xff0000 });
     *
     * // Create a complex shape with multiple lines
     * graphics
     *     .moveTo(200, 50)
     *     .lineTo(250, 50)
     *     .lineTo(250, 100)
     *     .lineTo(200, 100)
     *     .stroke({ width: 2, color: 0x00ff00 });
     * ```
     * @param x - The x-coordinate of the line's end point
     * @param y - The y-coordinate of the line's end point
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#moveTo} For starting a new sub-path
     */
    public lineTo(x: number, y: number): this;
    public lineTo(...args: Parameters<GraphicsContext['lineTo']>): this
    {
        return this._callContextMethod('lineTo', args);
    }
    /**
     * Sets the starting point for a new sub-path.
     *
     * Moves the "pen" to a new location without drawing a line.
     * Any subsequent drawing commands will start from this point.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Create multiple separate lines
     * graphics
     *     .moveTo(50, 50)
     *     .lineTo(100, 50)
     *     .moveTo(50, 100)    // Start a new line
     *     .lineTo(100, 100)
     *     .stroke({ width: 2, color: 0xff0000 });
     *
     * // Create disconnected shapes
     * graphics
     *     .moveTo(150, 50)
     *     .rect(150, 50, 50, 50)
     *     .fill({ color: 0x00ff00 })
     *     .moveTo(250, 50)    // Start a new shape
     *     .circle(250, 75, 25)
     *     .fill({ color: 0x0000ff });
     *
     * // Position before curved paths
     * graphics
     *     .moveTo(300, 50)
     *     .bezierCurveTo(
     *         350, 25,   // Control point 1
     *         400, 75,   // Control point 2
     *         450, 50    // End point
     *     )
     *     .stroke({ width: 3, color: 0xff00ff });
     * ```
     * @param x - The x-coordinate to move to
     * @param y - The y-coordinate to move to
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#lineTo} For drawing lines
     * @see {@link Graphics#beginPath} For starting a completely new path
     */
    public moveTo(x: number, y: number): this;
    public moveTo(...args: Parameters<GraphicsContext['moveTo']>): this
    {
        return this._callContextMethod('moveTo', args);
    }
    /**
     * Adds a quadratic curve to the path. It requires two points: the control point and the end point.
     * The starting point is the last point in the current path.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a simple curve
     * graphics
     *     .moveTo(50, 50)
     *     .quadraticCurveTo(100, 25, 150, 50)
     *     .stroke({ width: 2, color: 0xff0000 });
     *
     * // Adjust curve smoothness
     * graphics
     *     .moveTo(50, 200)
     *     .quadraticCurveTo(
     *         150, 150,   // Control point
     *         250, 200,   // End point
     *         0.5         // Smoothness factor
     *     )
     *     .stroke({
     *         width: 4,
     *         color: 0x0000ff,
     *         alpha: 0.7
     *     });
     * ```
     * @param cpx - The x-coordinate of the control point
     * @param cpy - The y-coordinate of the control point
     * @param x - The x-coordinate of the end point
     * @param y - The y-coordinate of the end point
     * @param smoothness - Optional parameter to adjust the curve's smoothness (0-1)
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#bezierCurveTo} For curves with two control points
     * @see {@link Graphics#arc} For circular arcs
     * @see {@link Graphics#arcTo} For connecting points with circular arcs
     */
    public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number, smoothness?: number): this;
    public quadraticCurveTo(...args: Parameters<GraphicsContext['quadraticCurveTo']>): this
    {
        return this._callContextMethod('quadraticCurveTo', args);
    }
    /**
     * Draws a rectangle shape.
     *
     * This method adds a new rectangle path to the current drawing.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a simple filled rectangle
     * graphics
     *     .rect(50, 50, 100, 75)
     *     .fill({ color: 0xff0000 });
     *
     * // Rectangle with stroke
     * graphics
     *     .rect(200, 50, 100, 75)
     *     .stroke({ width: 2, color: 0x00ff00 });
     * ```
     * @param x - The x-coordinate of the top-left corner of the rectangle
     * @param y - The y-coordinate of the top-left corner of the rectangle
     * @param w - The width of the rectangle
     * @param h - The height of the rectangle
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#roundRect} For drawing rectangles with rounded corners
     * @see {@link Graphics#filletRect} For drawing rectangles with filleted corners
     * @see {@link Graphics#chamferRect} For drawing rectangles with chamfered corners
     */

    public rect(x: number, y: number, w: number, h: number): this;
    public rect(...args: Parameters<GraphicsContext['rect']>): this
    {
        return this._callContextMethod('rect', args);
    }
    /**
     * Draws a rectangle with rounded corners. The corner radius can be specified to
     * determine how rounded the corners should be.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Basic rounded rectangle
     * graphics
     *     .roundRect(50, 50, 100, 75, 15)
     *     .fill({ color: 0xff0000 });
     * ```
     * @param x - The x-coordinate of the top-left corner of the rectangle
     * @param y - The y-coordinate of the top-left corner of the rectangle
     * @param w - The width of the rectangle
     * @param h - The height of the rectangle
     * @param radius - The radius of the rectangle's corners (must be non-negative)
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#rect} For drawing rectangles with sharp corners
     * @see {@link Graphics#filletRect} For drawing rectangles with filleted corners
     * @see {@link Graphics#chamferRect} For drawing rectangles with chamfered corners
     */
    public roundRect(x: number, y: number, w: number, h: number, radius?: number): this;
    public roundRect(...args: Parameters<GraphicsContext['roundRect']>): this
    {
        return this._callContextMethod('roundRect', args);
    }
    /**
     * Draws a polygon shape by specifying a sequence of points. This method allows for the creation of complex polygons,
     * which can be both open and closed.
     *
     * An optional transformation can be applied, enabling the polygon to be scaled,
     * rotated, or translated as needed.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a triangle using array of numbers [x1,y1, x2,y2, x3,y3]
     * graphics
     *     .poly([50,50, 100,100, 0,100], true)
     *     .fill({ color: 0xff0000 });
     *
     * // Draw a polygon using point objects
     * graphics
     *     .poly([
     *         { x: 200, y: 50 },
     *         { x: 250, y: 100 },
     *         { x: 200, y: 150 },
     *         { x: 150, y: 100 }
     *     ])
     *     .fill({ color: 0x00ff00 });
     *
     * // Draw an open polygon with stroke
     * graphics
     *     .poly([300,50, 350,50, 350,100, 300,100], false)
     *     .stroke({
     *         width: 2,
     *         color: 0x0000ff,
     *         join: 'round'
     *     });
     * ```
     * @param points - An array of numbers [x1,y1, x2,y2, ...] or an array of point objects [{x,y}, ...]
     *                representing the vertices of the polygon in sequence
     * @param close - Whether to close the polygon path by connecting the last point to the first.
     *               Default is true.
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#regularPoly} For drawing regular polygons
     * @see {@link Graphics#roundPoly} For drawing polygons with rounded corners
     * @see {@link Graphics#star} For drawing star shapes
     */
    public poly(points: number[] | PointData[], close?: boolean): this;
    public poly(...args: Parameters<GraphicsContext['poly']>): this
    {
        return this._callContextMethod('poly', args);
    }
    /**
     * Draws a regular polygon with a specified number of sides. All sides and angles are equal,
     * making shapes like triangles, squares, pentagons, etc.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a simple triangle (3 sides)
     * graphics
     *     .regularPoly(100, 100, 50, 3)
     *     .fill({ color: 0xff0000 });
     *
     * // Draw a hexagon (6 sides) with rotation
     * graphics
     *     .regularPoly(
     *         250, 100,    // center position
     *         40,          // radius
     *         6,           // sides
     *         Math.PI / 6  // rotation (30 degrees)
     *     )
     *     .fill({ color: 0x00ff00 })
     *     .stroke({ width: 2, color: 0x000000 });
     *
     * // Draw an octagon (8 sides) with transform
     * const transform = new Matrix()
     *     .scale(1.5, 1)      // stretch horizontally
     *     .rotate(Math.PI/4); // rotate 45 degrees
     *
     * graphics
     *     .regularPoly(400, 100, 30, 8, 0, transform)
     *     .fill({ color: 0x0000ff, alpha: 0.5 });
     * ```
     * @param x - The x-coordinate of the center of the polygon
     * @param y - The y-coordinate of the center of the polygon
     * @param radius - The radius of the circumscribed circle of the polygon
     * @param sides - The number of sides of the polygon (must be 3 or more)
     * @param rotation - The rotation angle of the polygon in radians (default: 0)
     * @param transform - Optional Matrix to transform the polygon's shape
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#poly} For drawing custom polygons
     * @see {@link Graphics#roundPoly} For drawing polygons with rounded corners
     * @see {@link Graphics#star} For drawing star shapes
     */
    public regularPoly(x: number, y: number, radius: number, sides: number, rotation?: number, transform?: Matrix): this;
    public regularPoly(...args: Parameters<GraphicsContext['regularPoly']>): this
    {
        return this._callContextMethod('regularPoly', args);
    }
    /**
     * Draws a polygon with rounded corners.
     *
     * Similar to `regularPoly` but with the ability to round the corners of the polygon.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a basic rounded triangle
     * graphics
     *     .roundPoly(100, 100, 50, 3, 10)
     *     .fill({ color: 0xff0000 });
     *
     * // Draw a rounded hexagon with rotation
     * graphics
     *     .roundPoly(
     *         250, 150,     // center position
     *         40,           // radius
     *         6,            // sides
     *         8,            // corner radius
     *         Math.PI / 6   // rotation (30 degrees)
     *     )
     *     .fill({ color: 0x00ff00 })
     *     .stroke({ width: 2, color: 0x000000 });
     * ```
     * @param x - The x-coordinate of the center of the polygon
     * @param y - The y-coordinate of the center of the polygon
     * @param radius - The radius of the circumscribed circle of the polygon
     * @param sides - The number of sides of the polygon (must be 3 or more)
     * @param corner - The radius of the corner rounding (must be non-negative)
     * @param rotation - The rotation angle of the polygon in radians (default: 0)
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#regularPoly} For drawing polygons without rounded corners
     * @see {@link Graphics#poly} For drawing custom polygons
     * @see {@link Graphics#roundRect} For drawing rectangles with rounded corners
     */
    public roundPoly(x: number, y: number, radius: number, sides: number, corner: number, rotation?: number): this;
    public roundPoly(...args: Parameters<GraphicsContext['roundPoly']>): this
    {
        return this._callContextMethod('roundPoly', args);
    }
    /**
     * Draws a shape with rounded corners. This function supports custom radius for each corner of the shape.
     * Optionally, corners can be rounded using a quadratic curve instead of an arc, providing a different aesthetic.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a custom shape with rounded corners
     * graphics
     *     .roundShape([
     *         { x: 100, y: 100, radius: 20 },
     *         { x: 200, y: 100, radius: 10 },
     *         { x: 200, y: 200, radius: 15 },
     *         { x: 100, y: 200, radius: 5 }
     *     ], 10)
     *     .fill({ color: 0xff0000 });
     *
     * // Using quadratic curves for corners
     * graphics
     *     .roundShape([
     *         { x: 250, y: 100 },
     *         { x: 350, y: 100 },
     *         { x: 350, y: 200 },
     *         { x: 250, y: 200 }
     *     ], 15, true, 0.5)
     *     .fill({ color: 0x00ff00 })
     *     .stroke({ width: 2, color: 0x000000 });
     *
     * // Shape with varying corner radii
     * graphics
     *     .roundShape([
     *         { x: 400, y: 100, radius: 30 },
     *         { x: 500, y: 100, radius: 5 },
     *         { x: 450, y: 200, radius: 15 }
     *     ], 10)
     *     .fill({ color: 0x0000ff, alpha: 0.5 });
     * ```
     * @param points - An array of `RoundedPoint` representing the corners of the shape.
     *                Each point can have its own radius or use the default.
     *                A minimum of 3 points is required.
     * @param radius - The default radius for corners without a specific radius defined.
     *                Applied to any point that doesn't specify its own radius.
     * @param useQuadratic - When true, corners are drawn using quadratic curves instead
     *                      of arcs, creating a different visual style. Defaults to false.
     * @param smoothness - Controls the smoothness of quadratic corners when useQuadratic
     *                    is true. Values range from 0-1, higher values create smoother curves.
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#roundRect} For drawing rectangles with rounded corners
     * @see {@link Graphics#roundPoly} For drawing regular polygons with rounded corners
     */
    public roundShape(points: RoundedPoint[], radius: number, useQuadratic?: boolean, smoothness?: number): this;
    public roundShape(...args: Parameters<GraphicsContext['roundShape']>): this
    {
        return this._callContextMethod('roundShape', args);
    }
    /**
     * Draws a rectangle with fillet corners. Unlike rounded rectangles, this supports negative corner
     * radii which create external rounded corners rather than internal ones.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a rectangle with internal fillets
     * graphics
     *     .filletRect(50, 50, 100, 80, 15)
     *     .fill({ color: 0xff0000 });
     *
     * // Draw a rectangle with external fillets
     * graphics
     *     .filletRect(200, 50, 100, 80, -20)
     *     .fill({ color: 0x00ff00 })
     *     .stroke({ width: 2, color: 0x000000 });
     * ```
     * @param x - The x-coordinate of the top-left corner of the rectangle
     * @param y - The y-coordinate of the top-left corner of the rectangle
     * @param width - The width of the rectangle
     * @param height - The height of the rectangle
     * @param fillet - The radius of the corner fillets (can be positive or negative)
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#roundRect} For standard rounded corners
     * @see {@link Graphics#chamferRect} For angled corners
     */
    public filletRect(x: number, y: number, width: number, height: number, fillet: number): this;
    public filletRect(...args: Parameters<GraphicsContext['filletRect']>): this
    {
        return this._callContextMethod('filletRect', args);
    }
    /**
     * Draws a rectangle with chamfered (angled) corners. Each corner is cut off at
     * a 45-degree angle based on the chamfer size.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a basic chamfered rectangle
     * graphics
     *     .chamferRect(50, 50, 100, 80, 15)
     *     .fill({ color: 0xff0000 });
     *
     * // Add transform and stroke
     * const transform = new Matrix()
     *     .rotate(Math.PI / 4); // 45 degrees
     *
     * graphics
     *     .chamferRect(200, 50, 100, 80, 20, transform)
     *     .fill({ color: 0x00ff00 })
     *     .stroke({ width: 2, color: 0x000000 });
     * ```
     * @param x - The x-coordinate of the top-left corner of the rectangle
     * @param y - The y-coordinate of the top-left corner of the rectangle
     * @param width - The width of the rectangle
     * @param height - The height of the rectangle
     * @param chamfer - The size of the corner chamfers (must be non-zero)
     * @param transform - Optional Matrix to transform the rectangle
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#roundRect} For rounded corners
     * @see {@link Graphics#filletRect} For rounded corners with negative radius support
     */
    public chamferRect(x: number, y: number, width: number, height: number, chamfer: number, transform?: Matrix): this;
    public chamferRect(...args: Parameters<GraphicsContext['chamferRect']>): this
    {
        return this._callContextMethod('chamferRect', args);
    }
    /**
     * Draws a star shape centered at a specified location. This method allows for the creation
     * of stars with a variable number of points, outer radius, optional inner radius, and rotation.
     *
     * The star is drawn as a closed polygon with alternating outer and inner vertices to create the star's points.
     * An optional transformation can be applied to scale, rotate, or translate the star as needed.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw a basic 5-pointed star
     * graphics
     *     .star(100, 100, 5, 50)
     *     .fill({ color: 0xff0000 });
     *
     * // Star with custom inner radius
     * graphics
     *     .star(250, 100, 6, 50, 20)
     *     .fill({ color: 0x00ff00 })
     *     .stroke({ width: 2, color: 0x000000 });
     * ```
     * @param x - The x-coordinate of the center of the star
     * @param y - The y-coordinate of the center of the star
     * @param points - The number of points on the star (must be >= 3)
     * @param radius - The outer radius of the star (distance from center to point tips)
     * @param innerRadius - Optional. The inner radius of the star (distance from center to inner vertices).
     *                     If not specified, defaults to half of the outer radius
     * @param rotation - Optional. The rotation of the star in radians. Default is 0,
     *                  which aligns one point straight up
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#regularPoly} For drawing regular polygons
     * @see {@link Graphics#poly} For drawing custom polygons
     * @see {@link Graphics#path} For creating custom shapes
     */
    public star(x: number, y: number, points: number, radius: number, innerRadius?: number, rotation?: number): this;
    public star(...args: Parameters<GraphicsContext['star']>): this
    {
        return this._callContextMethod('star', args);
    }
    /**
     * Parses and renders an SVG string into the graphics context. This allows for complex shapes
     * and paths defined in SVG format to be drawn within the graphics context.
     * @example
     * ```ts
     * const graphics = new Graphics();
     * graphics
     *     .svg(`
     *         <path d="M 50,50 L 100,50 L 100,100 L 50,100 Z"
     *               fill="blue" />
     *         <circle cx="150" cy="75" r="25"
     *               fill="green" />
     *     `)
     *     .stroke({ width: 2, color: 0x000000 });
     * ```
     * @param svg - The SVG string to be parsed and rendered
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#path} For adding custom paths
     * @see {@link Graphics#fill} For filling shapes after SVG parsing
     * @see {@link Graphics#stroke} For stroking shapes after SVG parsing
     */
    public svg(svg: string): this;
    public svg(...args: Parameters<GraphicsContext['svg']>): this
    {
        return this._callContextMethod('svg', args);
    }
    /**
     * Restores the most recently saved graphics state by popping the top of the graphics state stack.
     * This includes transformations, fill styles, and stroke styles.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Save current state
     * graphics.save();
     *
     * // Make temporary changes
     * graphics
     *     .translateTransform(100, 100)
     *     .setFillStyle({ color: 0xff0000 })
     *     .circle(0, 0, 50)
     *     .fill();
     *
     * // Restore to previous state
     * graphics.restore();
     *
     * // Draw with original transform and styles
     * graphics
     *     .circle(50, 50, 30)
     *     .fill();
     * ```
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#save} For saving the current state
     */
    public restore(): this;
    public restore(...args: Parameters<GraphicsContext['restore']>): this
    {
        return this._callContextMethod('restore', args);
    }
    /**
     * Saves the current graphics state onto a stack. The state includes:
     * - Current transformation matrix
     * - Current fill style
     * - Current stroke style
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Save state before complex operations
     * graphics.save();
     *
     * // Create transformed and styled shape
     * graphics
     *     .translateTransform(100, 100)
     *     .rotateTransform(Math.PI / 4)
     *     .setFillStyle({
     *         color: 0xff0000,
     *         alpha: 0.5
     *     })
     *     .rect(-25, -25, 50, 50)
     *     .fill();
     *
     * // Restore to original state
     * graphics.restore();
     *
     * // Continue drawing with previous state
     * graphics
     *     .circle(50, 50, 25)
     *     .fill();
     * ```
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#restore} For restoring the saved state
     * @see {@link Graphics#setTransform} For setting transformations
     */
    public save(): this
    {
        return this._callContextMethod('save', []);
    }
    /**
     * Returns the current transformation matrix of the graphics context.
     * This matrix represents all accumulated transformations including translate, scale, and rotate.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Apply some transformations
     * graphics
     *     .translateTransform(100, 100)
     *     .rotateTransform(Math.PI / 4);
     *
     * // Get the current transform matrix
     * const matrix = graphics.getTransform();
     * console.log(matrix.tx, matrix.ty); // 100, 100
     *
     * // Use the matrix for other operations
     * graphics
     *     .setTransform(matrix)
     *     .circle(0, 0, 50)
     *     .fill({ color: 0xff0000 });
     * ```
     * @returns The current transformation matrix.
     * @see {@link Graphics#setTransform} For setting the transform matrix
     * @see {@link Matrix} For matrix operations
     */
    public getTransform(): Matrix
    {
        return this.context.getTransform();
    }
    /**
     * Resets the current transformation matrix to the identity matrix, effectively removing
     * any transformations (rotation, scaling, translation) previously applied.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Apply transformations
     * graphics
     *     .translateTransform(100, 100)
     *     .scaleTransform(2, 2)
     *     .circle(0, 0, 25)
     *     .fill({ color: 0xff0000 });
     * // Reset transform to default state
     * graphics
     *     .resetTransform()
     *     .circle(50, 50, 25) // Will draw at actual coordinates
     *     .fill({ color: 0x00ff00 });
     * ```
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#getTransform} For getting the current transform
     * @see {@link Graphics#setTransform} For setting a specific transform
     * @see {@link Graphics#save} For saving the current transform state
     * @see {@link Graphics#restore} For restoring a previous transform state
     */
    public resetTransform(): this
    {
        return this._callContextMethod('resetTransform', []);
    }
    /**
     * Applies a rotation transformation to the graphics context around the current origin.
     * Positive angles rotate clockwise, while negative angles rotate counterclockwise.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Rotate 45 degrees clockwise
     * graphics
     *     .rotateTransform(Math.PI / 4)
     *     .rect(-25, -25, 50, 50)
     *     .fill({ color: 0xff0000 });
     * ```
     * @param angle - The angle of rotation in radians
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#scaleTransform} For scaling transformations
     * @see {@link Graphics#translateTransform} For position transformations
     */
    public rotateTransform(angle: number): this;
    public rotateTransform(...args: Parameters<GraphicsContext['rotate']>): this
    {
        return this._callContextMethod('rotate', args);
    }
    /**
     * Applies a scaling transformation to the graphics context, scaling drawings by x horizontally
     * and by y vertically relative to the current origin.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Uniform scaling
     * graphics
     *     .scaleTransform(2)  // Scale both dimensions by 2
     *     .circle(0, 0, 25)
     *     .fill({ color: 0xff0000 });
     *
     * // Non-uniform scaling
     * graphics
     *     .scaleTransform(0.5, 2)  // Half width, double height
     *     .rect(100, 100, 50, 50)
     *     .fill({ color: 0x00ff00 });
     * ```
     * @param x - The scale factor in the horizontal direction
     * @param y - The scale factor in the vertical direction. If omitted, equals x
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#rotateTransform} For rotation transformations
     * @see {@link Graphics#translateTransform} For position transformations
     */
    public scaleTransform(x: number, y?: number): this;
    public scaleTransform(...args: Parameters<GraphicsContext['scale']>): this
    {
        return this._callContextMethod('scale', args);
    }
    /**
     * Sets the current transformation matrix of the graphics context.
     *
     * This method can either
     * take a Matrix object or individual transform values to create a new transformation matrix.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Using a Matrix object
     * const matrix = new Matrix()
     *     .translate(100, 100)
     *     .rotate(Math.PI / 4);
     *
     * graphics
     *     .setTransform(matrix)
     *     .rect(0, 0, 50, 50)
     *     .fill({ color: 0xff0000 });
     *
     * // Using individual transform values
     * graphics
     *     .setTransform(
     *         2, 0,     // scale x by 2
     *         0, 1,     // no skew
     *         100, 100  // translate x,y by 100
     *     )
     *     .circle(0, 0, 25)
     *     .fill({ color: 0x00ff00 });
     * ```
     * @param transform - The matrix to set as the current transformation matrix.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public setTransform(transform: Matrix): this;
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
    public setTransform(a: number, b: number, c: number, d: number, dx: number, dy: number): this;
    public setTransform(a: number | Matrix, b?: number, c?: number, d?: number, dx?: number, dy?: number): this;
    public setTransform(...args: [Matrix] | [number, number, number, number, number, number]): this
    {
        return this._callContextMethod('setTransform', args);
    }
    /**
     * Applies a transformation matrix to the current graphics context by multiplying
     * the current matrix with the specified matrix. This allows for complex transformations
     * combining multiple operations.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Using a Matrix object
     * const matrix = new Matrix()
     *     .scale(2, 1)      // Scale horizontally
     *     .rotate(Math.PI/6); // Rotate 30 degrees
     *
     * graphics
     *     .transform(matrix)
     *     .rect(0, 0, 50, 50)
     *     .fill({ color: 0xff0000 });
     *
     * // Using individual transform values
     * graphics
     *     .transform(
     *         1, 0.5,    // Skew horizontally
     *         0, 1,      // No vertical skew
     *         100, 100   // Translate
     *     )
     *     .circle(0, 0, 25)
     *     .fill({ color: 0x00ff00 });
     * ```
     * @param transform - The matrix to apply to the current transformation.
     * @returns The instance of the current GraphicsContext for method chaining.
     */
    public transform(transform: Matrix): this;
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
    public transform(a: number, b: number, c: number, d: number, dx: number, dy: number): this;
    public transform(a: number | Matrix, b?: number, c?: number, d?: number, dx?: number, dy?: number): this;
    public transform(...args: [Matrix] | [number, number, number, number, number, number]): this
    {
        return this._callContextMethod('transform', args);
    }
    /**
     * Applies a translation transformation to the graphics context, moving the origin by the specified amounts.
     * This affects all subsequent drawing operations.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Basic translation
     * graphics
     *     .translateTransform(100, 100)
     *     .circle(0, 0, 25)
     *     .fill({ color: 0xff0000 });
     * ```
     * @param x - The amount to translate in the horizontal direction
     * @param y - The amount to translate in the vertical direction. If omitted, equals x
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#setTransform} For setting absolute transformations
     * @see {@link Graphics#transform} For applying complex transformations
     * @see {@link Graphics#save} For saving the current transform state
     */
    public translateTransform(x: number, y?: number): this;
    public translateTransform(...args: Parameters<GraphicsContext['translate']>): this
    {
        return this._callContextMethod('translate', args);
    }
    /**
     * Clears all drawing commands from the graphics context, effectively resetting it.
     * This includes clearing the current path, fill style, stroke style, and transformations.
     *
     * > [!NOTE] Graphics objects are not designed to be continuously cleared and redrawn.
     * > Instead, they are intended to be used for static or semi-static graphics that
     * > can be redrawn as needed. Frequent clearing and redrawing may lead to performance issues.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw some shapes
     * graphics
     *     .circle(100, 100, 50)
     *     .fill({ color: 0xff0000 })
     *     .rect(200, 100, 100, 50)
     *     .fill({ color: 0x00ff00 });
     *
     * // Clear all graphics
     * graphics.clear();
     *
     * // Start fresh with new shapes
     * graphics
     *     .circle(150, 150, 30)
     *     .fill({ color: 0x0000ff });
     * ```
     * @returns The Graphics instance for method chaining
     * @see {@link Graphics#beginPath} For starting a new path without clearing styles
     * @see {@link Graphics#save} For saving the current state
     * @see {@link Graphics#restore} For restoring a previous state
     */
    public clear(): this
    {
        return this._callContextMethod('clear', []);
    }
    /**
     * Gets or sets the current fill style for the graphics context. The fill style determines
     * how shapes are filled when using the fill() method.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Basic color fill
     * graphics.fillStyle = {
     *     color: 0xff0000,  // Red
     *     alpha: 1
     * };
     *
     * // Using gradients
     * const gradient = new FillGradient({
     *     end: { x: 0, y: 1 }, // Vertical gradient
     *     stops: [
     *         { offset: 0, color: 0xff0000, alpha: 1 }, // Start color
     *         { offset: 1, color: 0x0000ff, alpha: 1 }  // End color
     *     ]
     * });
     *
     * graphics.fillStyle = {
     *     fill: gradient,
     *     alpha: 0.8
     * };
     *
     * // Using patterns
     * graphics.fillStyle = {
     *     texture: myTexture,
     *     alpha: 1,
     *     matrix: new Matrix()
     *         .scale(0.5, 0.5)
     *         .rotate(Math.PI / 4)
     * };
     * ```
     * @type {ConvertedFillStyle}
     * @see {@link FillStyle} For all available fill style options
     * @see {@link FillGradient} For creating gradient fills
     * @see {@link Graphics#fill} For applying the fill to paths
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
     * Gets or sets the current stroke style for the graphics context. The stroke style determines
     * how paths are outlined when using the stroke() method.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Basic stroke style
     * graphics.strokeStyle = {
     *     width: 2,
     *     color: 0xff0000,
     *     alpha: 1
     * };
     *
     * // Using with gradients
     * const gradient = new FillGradient({
     *   end: { x: 0, y: 1 },
     *   stops: [
     *       { offset: 0, color: 0xff0000, alpha: 1 },
     *       { offset: 1, color: 0x0000ff, alpha: 1 }
     *   ]
     * });
     *
     * graphics.strokeStyle = {
     *     width: 4,
     *     fill: gradient,
     *     alignment: 0.5,
     *     join: 'round',
     *     cap: 'round'
     * };
     *
     * // Complex stroke settings
     * graphics.strokeStyle = {
     *     width: 6,
     *     color: 0x00ff00,
     *     alpha: 0.5,
     *     join: 'miter',
     *     miterLimit: 10,
     * };
     * ```
     * @see {@link StrokeStyle} For all available stroke style options
     * @see {@link Graphics#stroke} For applying the stroke to paths
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
     * Creates a new Graphics object that copies the current graphics content.
     * The clone can either share the same context (shallow clone) or have its own independent
     * context (deep clone).
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Create original graphics content
     * graphics
     *     .circle(100, 100, 50)
     *     .fill({ color: 0xff0000 });
     *
     * // Create a shallow clone (shared context)
     * const shallowClone = graphics.clone();
     *
     * // Changes to original affect the clone
     * graphics
     *     .circle(200, 100, 30)
     *     .fill({ color: 0x00ff00 });
     *
     * // Create a deep clone (independent context)
     * const deepClone = graphics.clone(true);
     *
     * // Modify deep clone independently
     * deepClone
     *     .translateTransform(100, 100)
     *     .circle(0, 0, 40)
     *     .fill({ color: 0x0000ff });
     * ```
     * @param deep - Whether to create a deep clone of the graphics object.
     *              If false (default), the context will be shared between objects.
     *              If true, creates an independent copy of the context.
     * @returns A new Graphics instance with either shared or copied context
     * @see {@link Graphics#context} For accessing the underlying graphics context
     * @see {@link GraphicsContext} For understanding the shared context behavior
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
        if (color !== undefined) fillStyle.color = color;
        if (alpha !== undefined) fillStyle.alpha = alpha;

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
