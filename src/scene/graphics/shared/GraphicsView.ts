import { emptyViewObserver } from '../../../rendering/renderers/shared/view/View';
import { uid } from '../../../utils/data/uid';
import { GraphicsContext } from './GraphicsContext';

import type { PointData } from '../../../maths/point/PointData';
import type { View } from '../../../rendering/renderers/shared/view/View';
import type { Bounds } from '../../container/bounds/Bounds';
import type { ContextDestroyOptions, TextureDestroyOptions, TypeOrBool } from '../../container/destroyTypes';

export class GraphicsView implements View
{
    public readonly uid = uid('graphicsView');
    public readonly canBundle = true;
    public readonly owner = emptyViewObserver;
    public readonly renderPipeId = 'graphics';
    public batched: boolean;

    public roundPixels: 0 | 1 = 0;

    /** @internal */
    public _didUpdate: boolean;

    private _context: GraphicsContext;
    private readonly _ownedContext: GraphicsContext;

    constructor(graphicsContext?: GraphicsContext)
    {
        if (!graphicsContext)
        {
            this._context = this._ownedContext = new GraphicsContext();
        }
        else
        {
            this._context = graphicsContext;
        }

        this._context.on('update', this.onGraphicsContextUpdate, this);
    }

    set context(context: GraphicsContext)
    {
        if (context === this._context) return;

        this._context.off('update', this.onGraphicsContextUpdate, this);

        this._context = context;

        // TODO store this bound function somewhere else..
        this._context.on('update', this.onGraphicsContextUpdate, this);

        this.onGraphicsContextUpdate();
    }

    get context(): GraphicsContext
    {
        return this._context;
    }

    public addBounds(bounds: Bounds)
    {
        bounds.addBounds(this._context.bounds);
    }

    public containsPoint(point: PointData)
    {
        return this._context.containsPoint(point);
    }

    protected onGraphicsContextUpdate()
    {
        this._didUpdate = true;
        this.owner.onViewUpdate();
    }

    /**
     * Destroys this graphics renderable and optionally its context.
     * @param options - Options parameter. A boolean will act as if all options
     *
     * If the context was created by this graphics view and `destroy(false)` or `destroy()` is called
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
    public destroy(options: TypeOrBool<TextureDestroyOptions & ContextDestroyOptions>): void
    {
        (this as any).owner = null;

        if (this._ownedContext && options === false)
        {
            this._ownedContext.destroy(options);
        }
        else if (options === true || (options as ContextDestroyOptions)?.context === true)
        {
            this._context.destroy(options);
        }

        (this._ownedContext as null) = null;
        this._context = null;
    }
}
