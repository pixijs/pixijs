import { Container } from '../../scene/Container';
import { GraphicsContext } from './GraphicsContext';
import { GraphicsView } from './GraphicsView';

import type { ContainerOptions } from '../../scene/Container';
import type { DestroyOptions } from '../../scene/destroyTypes';

export interface GraphicsOptions extends ContainerOptions<GraphicsView>
{
    context?: GraphicsContext;
}

export class Graphics extends Container<GraphicsView>
{
    constructor(options?: GraphicsOptions | GraphicsContext)
    {
        if (options instanceof GraphicsContext)
        {
            options = { context: options };
        }

        super({
            view: new GraphicsView(options?.context),
            label: 'Graphics',
            ...options
        });
    }

    get context(): GraphicsContext
    {
        return this.view.context;
    }

    set context(context: GraphicsContext)
    {
        this.view.context = context;
    }

    /**
     * Destroys this graphics and optionally its context and children.
     * Do not use a Graphics after calling `destroy`.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *  method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should destroy the texture of the graphics or of any child sprite
     * @param {boolean} [options.textureSource=false] - Should destroy the texture source of the graphics or of
     * any child sprite
     * @param {boolean} [options.context=false] - Should destroy the context of the child graphics
     */
    public destroy(options: DestroyOptions = false): void
    {
        super.destroy(options);

        this.view.destroy(options);
    }
}
