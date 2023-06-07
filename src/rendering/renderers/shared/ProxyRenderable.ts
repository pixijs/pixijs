import { getRenderableUID } from '../../scene/Container';

import type { Matrix } from '../../../maths/Matrix';
import type { Renderable } from './Renderable';
import type { View } from './View';

export class ProxyRenderable<T extends View = View> implements Renderable<T>
{
    uid = getRenderableUID();
    view: T;
    original: Renderable<any>;
    layerTransform: Matrix;
    worldTransform: Matrix;
    didViewUpdate = false;

    constructor({ original, view }: { original: Renderable<any>; view: T; })
    {
        this.view = view;
        this.original = original;
        this.layerTransform = original.layerTransform;
    }

    get layerColor()
    {
        return this.original.layerColor;
    }

    get layerBlendMode()
    {
        return this.original.layerBlendMode;
    }

    get layerVisibleRenderable()
    {
        return this.original.layerVisibleRenderable;
    }

    get isRenderable()
    {
        return this.original.isRenderable;
    }
}
