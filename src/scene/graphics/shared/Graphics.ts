import { deprecation } from '../../../utils/logging/deprecation';
import { Container } from '../../container/Container';
import { GraphicsContext } from './GraphicsContext';

import type { ColorSource } from '../../../color/Color';
import type { Matrix } from '../../../maths/matrix/Matrix';
import type { PointData } from '../../../maths/point/PointData';
import type { Instruction } from '../../../rendering/renderers/shared/instructions/Instruction';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { View } from '../../../rendering/renderers/shared/view/View';
import type { Bounds } from '../../container/bounds/Bounds';
import type { ContainerOptions } from '../../container/Container';
import type { ContextDestroyOptions, DestroyOptions } from '../../container/destroyTypes';
// @ts-expect-error - used for jsdoc typedefs
// eslint-disable-next-line @typescript-eslint/no-duplicate-imports
import type { ConvertedFillStyle, ConvertedStrokeStyle, FillStyle, FillStyleInputs, StrokeStyle } from './GraphicsContext';

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
export class Graphics extends Container implements View, Instruction
{
    public readonly canBundle = true;
    public readonly renderPipeId = 'graphics';
    public batched: boolean;

    public _roundPixels: 0 | 1 = 0;

    /** @internal */
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

        const { context, ...rest } = options || {};

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

    get bounds(): Bounds
    {
        return this._context.bounds;
    }

    public addBounds(bounds: Bounds)
    {
        bounds.addBounds(this._context.bounds);
    }

    public containsPoint(point: PointData)
    {
        return this._context.containsPoint(point);
    }

    /** Whether or not to round the x/y position. */
    get roundPixels()
    {
        return !!this._roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this._roundPixels = value ? 1 : 0;
    }

    protected onViewUpdate()
    {
        // increment from the 12th bit!
        this._didChangeId += 1 << 12;
        this._didGraphicsUpdate = true;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        if (this.renderGroup)
        {
            this.renderGroup.onChildViewUpdate(this);
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
    public destroy(options?: DestroyOptions): void
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
    public setFillStyle(...args: Parameters<GraphicsContext['setFillStyle']>): this
    {
        return this._callContextMethod('setFillStyle', args);
    }

    public setStrokeStyle(...args: Parameters<GraphicsContext['setStrokeStyle']>): this
    {
        return this._callContextMethod('setStrokeStyle', args);
    }

    /** @deprecated 8.0.0 */
    public fill(color: ColorSource, alpha: number): this;
    public fill(style?: FillStyleInputs): this;
    public fill(...args: [FillStyleInputs, ColorSource?]): this
    {
        return this._callContextMethod('fill', args);
    }
    public stroke(...args: Parameters<GraphicsContext['stroke']>): this
    {
        return this._callContextMethod('stroke', args);
    }
    public texture(texture: Texture): this;
    public texture(texture: Texture, tint?: ColorSource, dx?: number, dy?: number, dw?: number, dh?: number): this;
    public texture(...args: [Texture, number?, number?, number?, number?, number?]): this
    {
        return this._callContextMethod('texture', args);
    }
    /** Begins a new path. */
    public beginPath(): this
    {
        return this._callContextMethod('beginPath', []);
    }
    public cut(...args: Parameters<GraphicsContext['cut']>): this
    {
        return this._callContextMethod('cut', args);
    }
    public arc(...args: Parameters<GraphicsContext['arc']>): this
    {
        return this._callContextMethod('arc', args);
    }
    public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this;
    public arcTo(...args: Parameters<GraphicsContext['arcTo']>): this
    {
        return this._callContextMethod('arcTo', args);
    }
    public arcToSvg(...args: Parameters<GraphicsContext['arcToSvg']>): this
    {
        return this._callContextMethod('arcToSvg', args);
    }
    public bezierCurveTo(...args: Parameters<GraphicsContext['bezierCurveTo']>): this
    {
        return this._callContextMethod('bezierCurveTo', args);
    }
    public closePath(...args: Parameters<GraphicsContext['closePath']>): this
    {
        return this._callContextMethod('closePath', args);
    }
    public ellipse(...args: Parameters<GraphicsContext['ellipse']>): this
    {
        return this._callContextMethod('ellipse', args);
    }
    public circle(...args: Parameters<GraphicsContext['circle']>): this
    {
        return this._callContextMethod('circle', args);
    }
    public path(...args: Parameters<GraphicsContext['path']>): this
    {
        return this._callContextMethod('path', args);
    }
    public lineTo(...args: Parameters<GraphicsContext['lineTo']>): this
    {
        return this._callContextMethod('lineTo', args);
    }
    public moveTo(...args: Parameters<GraphicsContext['moveTo']>): this
    {
        return this._callContextMethod('moveTo', args);
    }
    public quadraticCurveTo(...args: Parameters<GraphicsContext['quadraticCurveTo']>): this
    {
        return this._callContextMethod('quadraticCurveTo', args);
    }
    public rect(...args: Parameters<GraphicsContext['rect']>): this
    {
        return this._callContextMethod('rect', args);
    }
    public roundRect(...args: Parameters<GraphicsContext['roundRect']>): this
    {
        return this._callContextMethod('roundRect', args);
    }
    public poly(...args: Parameters<GraphicsContext['poly']>): this
    {
        return this._callContextMethod('poly', args);
    }
    public regularPoly(...args: Parameters<GraphicsContext['regularPoly']>): this
    {
        return this._callContextMethod('regularPoly', args);
    }
    public roundPoly(...args: Parameters<GraphicsContext['roundPoly']>): this
    {
        return this._callContextMethod('roundPoly', args);
    }
    public roundShape(...args: Parameters<GraphicsContext['roundShape']>): this
    {
        return this._callContextMethod('roundShape', args);
    }
    public filletRect(...args: Parameters<GraphicsContext['filletRect']>): this
    {
        return this._callContextMethod('filletRect', args);
    }
    public chamferRect(...args: Parameters<GraphicsContext['chamferRect']>): this
    {
        return this._callContextMethod('chamferRect', args);
    }
    public star(...args: Parameters<GraphicsContext['star']>): this
    {
        return this._callContextMethod('star', args);
    }
    public svg(...args: Parameters<GraphicsContext['svg']>): this
    {
        return this._callContextMethod('svg', args);
    }
    public restore(...args: Parameters<GraphicsContext['restore']>): this
    {
        return this._callContextMethod('restore', args);
    }
    public save(...args: Parameters<GraphicsContext['save']>): this
    {
        return this._callContextMethod('save', args);
    }
    public getTransform(...args: Parameters<GraphicsContext['getTransform']>): this
    {
        return this._callContextMethod('getTransform', args);
    }
    public resetTransform(...args: Parameters<GraphicsContext['resetTransform']>): this
    {
        return this._callContextMethod('resetTransform', args);
    }
    public rotateTransform(...args: Parameters<GraphicsContext['rotate']>): this
    {
        return this._callContextMethod('rotate', args);
    }
    public scaleTransform(...args: Parameters<GraphicsContext['scale']>): this
    {
        return this._callContextMethod('scale', args);
    }
    public setTransform(transform: Matrix): this;
    public setTransform(a: number, b: number, c: number, d: number, dx: number, dy: number): this;
    public setTransform(a: number | Matrix, b?: number, c?: number, d?: number, dx?: number, dy?: number): this;
    public setTransform(...args: [Matrix] | [number, number, number, number, number, number]): this
    {
        return this._callContextMethod('setTransform', args);
    }
    public transform(transform: Matrix): this;
    public transform(a: number, b: number, c: number, d: number, dx: number, dy: number): this;
    public transform(a: number | Matrix, b?: number, c?: number, d?: number, dx?: number, dy?: number): this;
    public transform(...args: [Matrix] | [number, number, number, number, number, number]): this
    {
        return this._callContextMethod('transform', args);
    }
    public translateTransform(...args: Parameters<GraphicsContext['translate']>): this
    {
        return this._callContextMethod('translate', args);
    }
    public clear(...args: Parameters<GraphicsContext['clear']>): this
    {
        return this._callContextMethod('clear', args);
    }
    /**
     * The fill style to use.
     * @type {ConvertedFillStyle}
     */
    get fillStyle(): GraphicsContext['fillStyle']
    {
        return this._context.fillStyle;
    }
    set fillStyle(value: FillStyleInputs)
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
    set strokeStyle(value: FillStyleInputs)
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
     * @deprecated since 8.0.0
     */
    public lineStyle(width?: number, color?: ColorSource, alpha?: number): this
    {
        // eslint-disable-next-line max-len
        deprecation('8.0.0', 'Graphics#lineStyle is no longer needed. Use Graphics#setStrokeStyle to set the stroke style.');

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
     * @deprecated since 8.0.0
     */
    public beginFill(color: ColorSource, alpha?: number)
    {
        // eslint-disable-next-line max-len
        deprecation('8.0.0', 'Graphics#beginFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.');

        const fillStyle: Partial<FillStyle> = {};

        // avoid undefined assignment
        color && (fillStyle.color = color);
        alpha && (fillStyle.alpha = alpha);

        this.context.fillStyle = fillStyle;

        return this;
    }

    /**
     * @deprecated since 8.0.0
     */
    public endFill()
    {
        // eslint-disable-next-line max-len
        deprecation('8.0.0', 'Graphics#endFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.');

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
     * @deprecated since 8.0.0
     */
    public drawCircle(...args: Parameters<GraphicsContext['circle']>): this
    {
        deprecation('8.0.0', 'Graphics#drawCircle has been renamed to Graphics#circle');

        return this._callContextMethod('circle', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawEllipse(...args: Parameters<GraphicsContext['ellipse']>): this
    {
        deprecation('8.0.0', 'Graphics#drawEllipse has been renamed to Graphics#ellipse');

        return this._callContextMethod('ellipse', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawPolygon(...args: Parameters<GraphicsContext['poly']>): this
    {
        deprecation('8.0.0', 'Graphics#drawPolygon has been renamed to Graphics#poly');

        return this._callContextMethod('poly', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawRect(...args: Parameters<GraphicsContext['rect']>): this
    {
        deprecation('8.0.0', 'Graphics#drawRect has been renamed to Graphics#rect');

        return this._callContextMethod('rect', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawRoundedRect(...args: Parameters<GraphicsContext['roundRect']>): this
    {
        deprecation('8.0.0', 'Graphics#drawRoundedRect has been renamed to Graphics#roundRect');

        return this._callContextMethod('roundRect', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawStar(...args: Parameters<GraphicsContext['star']>): this
    {
        deprecation('8.0.0', 'Graphics#drawStar has been renamed to Graphics#star');

        return this._callContextMethod('star', args);
    }
}
