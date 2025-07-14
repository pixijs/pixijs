import type { ColorSource } from '../../../color/Color';
import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { LineCap, LineJoin } from './const';
import type { FillGradient } from './fill/FillGradient';
import type { FillPattern } from './fill/FillPattern';

/**
 * Determines how texture coordinates are calculated
 * Local Space:              Global Space:
 * ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
 * │ A   B   │  │ A   B   │  │ A...B   │  │ ...B... │
 * │         │  │         │  │         │  │         │
 * │ C   D   │  │ C   D   │  │ C...D   │  │ ...D... │
 * └─────────┘  └─────────┘  └─────────┘  └─────────┘
 * (Each shape   (Each shape  (Texture continues across
 * gets full     gets full    shapes as if they're texture)      texture)     windows to same texture)
 * @category scene
 * @advanced
 */
export type TextureSpace =
    /**
     * 'local' - Texture coordinates are relative to the shape's bounds.
     * The texture will stretch/fit to each individual shape's boundaries.
     * Think of it like the shape having its own coordinate system.
     */
    | 'local'
    /**
     * 'global' - Texture coordinates are in world space.
     * The texture position is consistent across all shapes,
     * as if the texture was laid down first and shapes were cut out of it.
     * Think of it like wallpaper that shows through shaped holes.
     */
    | 'global';

/**
 * Defines the style properties used for filling shapes in graphics and text operations.
 * This interface provides options for colors, textures, patterns, and gradients.
 * @example
 * ```ts
 * // Basic color fill
 * const fillStyle = {
 *     color: 0xff0000,  // Red
 *     alpha: 0.5        // 50% opacity
 * };
 *
 * // Textured fill ( Graphics only )
 * const fillStyle = {
 *     texture: Texture.from('myImage.png'),
 *     matrix: new Matrix().scale(0.5, 0.5),
 * };
 *
 * // Gradient fill
 * const gradient = new FillGradient({
 *    end: { x: 1, y: 0 },
 *    stops: [
 *        { color: 0xff0000, offset: 0 }, // Red at start
 *        { color: 0x0000ff, offset: 1 }, // Blue at end
 *    ]
 * })
 *
 * const fillStyle = {
 *     fill: gradient,
 *     alpha: 1
 * };
 * ```
 * @see {@link FillPattern} For creating pattern fills
 * @see {@link FillGradient} For creating gradient fills
 * @see {@link TextureSpace} For texture coordinate calculation modes
 * @category scene
 * @standard
 */
export interface FillStyle
{
    /**
     * The color to use for the fill.
     * This can be any valid color source, such as a hex value, a Color object, or a string.
     * @example
     * ```ts
     * // Using a hex color
     * const fillStyle = { color: 0xff0000 }; // Red
     * // Using a Color object
     * const fillStyle = { color: new Color(1, 0, 0) }; // Red
     * // Using a string color
     * const fillStyle = { color: 'red' }; // Red
     * // Using object string
     * const fillStyle = { color: 'rgb(255, 0, 0)' }; // Red
     * ```
     * @see {@link ColorSource} For more details on color sources
     */
    color?: ColorSource;
    /**
     * The alpha value to use for the fill.
     * This value should be between 0 (fully transparent) and 1 (fully opaque).
     * @example
     * ```ts
     * const fillStyle = { alpha: 0.5 }; // 50% opacity
     * ```
     * @default 1
     * @see {@link ColorSource} For more details on color sources
     * @see {@link FillStyle#color} For color usage
     */
    alpha?: number;
    /**
     * The texture to use for the fill.
     * @example
     * ```ts
     * const fillStyle = { texture: Texture.from('myImage.png') };
     * ```
     * @see {@link Texture} For more details on textures
     */
    texture?: Texture | null;
    /**
     * The transformation matrix to apply to the fill pattern or texture.
     * Used to scale, rotate, translate, or skew the fill.
     * @example
     * ```ts
     * // Scale and rotate a texture fill
     * const fillStyle = {
     *     texture: Texture.from('myImage.png'),
     *     matrix: new Matrix()
     *         .scale(0.5, 0.5)
     *         .rotate(Math.PI / 4)
     * };
     * ```
     * @default null
     */
    matrix?: Matrix | null;
    /**
     * The fill pattern or gradient to use. This can be either a FillPattern for
     * repeating textures or a FillGradient for color transitions.
     * @example
     * ```ts
     * // Using a gradient
     * const gradient = new FillGradient({
     *    end: { x: 1, y: 0 },
     *    stops: [
     *        { color: 0xff0000, offset: 0 }, // Red at start
     *        { color: 0x0000ff, offset: 1 }, // Blue at end
     *    ]
     * });
     *
     * const fillStyle = {
     *     fill: gradient,
     *     alpha: 0.8
     * };
     *
     * // Using a pattern
     * const pattern = new FillPattern(
     *     Texture.from('pattern.png'),
     *     'repeat' // or 'no-repeat', 'repeat-x', 'repeat-y'
     * );
     *
     * const fillStyle = {
     *     fill: pattern
     * };
     * ```
     * @see {@link FillPattern} For creating pattern fills
     * @see {@link FillGradient} For creating gradient fills
     */
    fill?: FillPattern | FillGradient | null;
    /**
     * Determines how texture coordinates are calculated across shapes.
     * - 'local': Texture coordinates are relative to each shape's bounds
     * - 'global': Texture coordinates are in world space
     * @example
     * ```ts
     * // Local space - texture fits each shape independently
     * const fillStyle = {
     *     texture: Texture.from('myImage.png'),
     *     textureSpace: 'local'
     * };
     *
     * // Global space - texture continues across shapes
     * const fillStyle = {
     *     texture: Texture.from('myImage.png'),
     *     textureSpace: 'global'
     * };
     * ```
     * @default 'local'
     * @see {@link TextureSpace} For more details on texture spaces
     */
    textureSpace?: TextureSpace;
}

/**
 * A stroke attribute object that defines how lines and shape outlines are drawn.
 * Controls properties like width, alignment, line caps, joins, and more.
 * @example
 * ```ts
 * const graphics = new Graphics();
 *
 * // Basic stroke with width
 * graphics.stroke({
 *     width: 4,
 *     color: 0xff0000 // Or use a Color object
 * });
 *
 * // Stroke with rounded corners and ends
 * const text = new Text('Hello World', {
 *     fontSize: 32,
 *     fill: 0x000000, // Text color
 *     stroke: {
 *     width: 8,
 *         color: 0x00ff00, // Or use a Color object
 *         cap: 'round',    // Round end caps
 *         join: 'round',   // Round corner joins
 *         alignment: 0.5   // Center alignment
 *     }
 * });
 *
 * // Stroke with mitered corners
 * graphics.stroke({
 *     width: 6,
 *     color: 0x0000ff, // Or use a Color object
 *     join: 'miter',
 *     miterLimit: 3,   // Limit how far miter extends
 *     alignment: 0     // Outside alignment
 * });
 *
 * // Pixel-perfect line
 * graphics.stroke({
 *     width: 1,
 *     pixelLine: true, // Ensures crisp 1px lines
 *     color: 0x000000  // Or use a Color object
 * });
 * ```
 * @see {@link Graphics#stroke} For applying strokes to paths
 * @see {@link LineCap} For line end cap options
 * @see {@link LineJoin} For line join options
 * @category scene
 * @standard
 */
export interface StrokeAttributes
{
    /**
     * The width of the stroke in pixels.
     * @example
     * ```ts
     * const stroke = { width: 4 };
     * ```
     * @default 1
     */
    width?: number;

    /**
     * The alignment of the stroke relative to the path.
     * - 1: Inside the shape
     * - 0.5: Centered on the path (default)
     * - 0: Outside the shape
     * @example
     * ```ts
     * // Inside alignment
     * const stroke = { alignment: 1 };
     * // Centered alignment
     * const stroke = { alignment: 0.5 };
     * // Outside alignment
     * const stroke = { alignment: 0 };
     * ```
     * @default 0.5
     */
    alignment?: number;

    /**
     * The style to use for the ends of open paths.
     * - 'butt': Ends at path end
     * - 'round': Rounds past path end
     * - 'square': Squares past path end
     * @example
     * ```ts
     * const stroke = { cap: 'round' };
     * ```
     * @default 'butt'
     * @see {@link LineCap} For line cap options
     */
    cap?: LineCap;

    /**
     * The style to use where paths connect.
     * - 'miter': Sharp corner
     * - 'round': Rounded corner
     * - 'bevel': Beveled corner
     * @example
     * ```ts
     * const stroke = { join: 'round' };
     * ```
     * @default 'miter'
     * @see {@link LineJoin} For line join options
     */
    join?: LineJoin;

    /**
     * Controls how far miter joins can extend. Only applies when join is 'miter'.
     * Higher values allow sharper corners.
     * @example
     * ```ts
     * const stroke = {
     *     join: 'miter',
     *     miterLimit: 3,
     * };
     * ```
     * @default 10
     */
    miterLimit?: number;

    /**
     * When true, ensures crisp 1px lines by aligning to pixel boundaries.
     * > [!NOTE] Only available for Graphics fills.
     * @example
     * ```ts
     * const graphics = new Graphics();
     *
     * // Draw pixel-perfect line
     * graphics
     *     .moveTo(50, 50)
     *     .lineTo(150, 50)
     *     .stroke({
     *         width: 1,
     *         pixelLine: true,
     *         color: 0x000000
     *     });
     * ```
     * @default false
     */
    pixelLine?: boolean;
}

/**
 * A stroke style object that combines fill properties with stroke attributes to define
 * both the visual style and stroke behavior of lines, shape outlines, and text strokes.
 * @example
 * ```ts
 * // --- Graphics Examples ---
 * const graphics = new Graphics();
 *
 * // Basic solid color stroke
 * graphics.stroke({
 *     width: 4,
 *     color: 0xff0000,
 *     alpha: 0.8,
 *     join: 'round'
 * });
 *
 * // Gradient stroke with attributes
 * const gradient = new FillGradient({
 *    end: { x: 1, y: 0 },
 *    stops: [
 *        { color: 0xff0000, offset: 0 }, // Red at start
 *        { color: 0x0000ff, offset: 1 }, // Blue at end
 *    ]
 * });
 *
 * graphics.stroke({
 *     width: 8,
 *     fill: gradient,
 *     cap: 'round',
 *     join: 'round',
 *     alignment: 0.5
 * });
 *
 * // --- Text Examples ---
 *
 * // Basic text stroke
 * const text = new Text('Hello World', {
 *     fontSize: 48,
 *     stroke: {
 *         width: 4,
 *         color: 0x000000,
 *         alignment: 0  // Outside stroke
 *     }
 * });
 *
 * // Gradient text stroke
 * const textGradient = new FillGradient({
 *   end: { x: 1, y: 0 },
 *   stops: [
 *       { color: 0xff0000, offset: 0 }, // Red at start
 *       { color: 0x0000ff, offset: 1 }, // Blue at end
 *   ]
 * });
 *
 * const fancyText = new Text('Gradient Outline', {
 *     fontSize: 64,
 *     fill: 0xffffff,
 *     stroke: {
 *         width: 6,
 *         fill: textGradient,
 *         alignment: 0.5,
 *         join: 'round'
 *     }
 * });
 * ```
 * @see {@link FillStyle} For fill properties
 * @see {@link StrokeAttributes} For stroke properties
 * @see {@link Graphics#stroke} For applying strokes to paths
 * @see {@link Text} For text stroke options
 * @category scene
 * @standard
 * @interface
 */
export interface StrokeStyle extends FillStyle, StrokeAttributes {}

/**
 * These can be directly used as a fill or a stroke
 * ```ts
 * graphics.fill(0xff0000);
 * graphics.fill(new FillPattern(texture));
 * graphics.fill(new FillGradient(0, 0, 200, 0));
 * graphics.fill({
 *   color: 0xff0000,
 *   alpha: 0.5,
 *   texture?: null,
 *   matrix?: null,
 * });
 * graphics.fill({
 *   fill: new FillPattern(texture),
 * });
 * graphics.fill({
 *   fill: new FillGradient(0, 0, 200, 0),
 * });
 * ```
 * @category scene
 * @standard
 */
export type FillInput = ColorSource | FillGradient | FillPattern | FillStyle | Texture;

/**
 * These can be directly used as a stroke
 * ```ts
 * graphics.stroke(0xff0000);
 * graphics.stroke(new FillPattern(texture));
 * graphics.stroke(new FillGradient(0, 0, 200, 0));
 * graphics.stroke({
 *   color: 0xff0000,
 *   width?: 1,
 *   alignment?: 0.5,
 * });
 * graphics.stroke({
 *   fill: new FillPattern(texture),
 *   width: 1,
 *   alignment: 0.5,
 * });
 * graphics.stroke({
 *   fill: new FillGradient(0, 0, 200, 0),
 *   width: 1,
 *   alignment: 0.5,
 * });
 * ```
 * @category scene
 * @standard
 */
export type StrokeInput = ColorSource | FillGradient | FillPattern | StrokeStyle;

/**
 * used internally and is a complete fill style
 * @category scene
 * @advanced
 * @interface
 */
export type ConvertedFillStyle = Omit<Required<FillStyle>, 'color'> & { color: number };
/**
 * used internally and is a complete stroke style
 * @category scene
 * @advanced
 * @interface
 */
export type ConvertedStrokeStyle = ConvertedFillStyle & Required<StrokeAttributes>;

/**
 * @deprecated since v8.1.6
 * @see FillInput
 * @category scene
 * @standard
 */
// eslint-disable-next-line max-len
export type FillStyleInputs = ColorSource | FillGradient | FillPattern | FillStyle | ConvertedFillStyle | StrokeStyle | ConvertedStrokeStyle;
