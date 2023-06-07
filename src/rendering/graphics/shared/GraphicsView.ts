import { emptyViewObserver } from '../../renderers/shared/View';
import { GraphicsContext } from './GraphicsContext';

import type { PointData } from '../../../maths/PointData';
import type { View } from '../../renderers/shared/View';
import type { Bounds } from '../../scene/bounds/Bounds';
import type { ContextDestroyOptions, TextureDestroyOptions, TypeOrBool } from '../../scene/destroyTypes';

let UID = 0;

export class GraphicsView implements View
{
    uid = UID++;

    canBundle = true;

    owner = emptyViewObserver;

    batched: boolean;
    type = 'graphics';

    didUpdate: boolean;

    private _context: GraphicsContext;

    constructor(graphicsContext?: GraphicsContext)
    {
        this._context = graphicsContext || new GraphicsContext();
        this._context.onGraphicsContextUpdate.add(this);
    }

    set context(context: GraphicsContext)
    {
        if (context === this._context) return;

        this._context.onGraphicsContextUpdate.remove(this);

        this._context = context;

        // TODO store this bound function somewhere else..
        this._context.onGraphicsContextUpdate.add(this);

        this.onGraphicsContextUpdate();
    }

    get context(): GraphicsContext
    {
        return this._context;
    }

    addBounds(bounds: Bounds)
    {
        bounds.addBounds(this._context.bounds);
    }

    public containsPoint(point: PointData)
    {
        return this._context.containsPoint(point);
    }

    protected onGraphicsContextUpdate()
    {
        this.didUpdate = true;
        this.owner.onViewUpdate();
    }

    /**
     * Destroys this graphics renderable and optionally its context.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should destroy the texture of the graphics context
     * @param {boolean} [options.textureSource=false] - Should destroy the texture source of the graphics context
     * @param {boolean} [options.context=false] - Should destroy the context
     */
    public destroy(options: TypeOrBool<TextureDestroyOptions & ContextDestroyOptions> = false): void
    {
        this.owner = null;

        const destroyContext = typeof options === 'boolean' ? options : options?.context;

        if (destroyContext)
        {
            this._context.destroy(options);
        }
    }
}
