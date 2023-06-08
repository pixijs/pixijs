import { Container } from '../../scene/Container';
import { GraphicsContext } from './GraphicsContext';
import { GraphicsView } from './GraphicsView';

import type { ContainerOptions } from '../../scene/Container';

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
}
