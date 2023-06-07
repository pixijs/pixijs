import { Matrix } from '../../../maths/Matrix';
import { getRenderableUID } from '../../scene/Container';

import type { Container } from '../../scene/Container';
import type { Renderable } from './Renderable';
import type { View } from './View';

/**
 * LayerRenderable is used to render the view of the root container of a layer group
 * We don't want to inherit the transform / color of the root container as that information is
 * uploaded to the GPU and applied globally.
 *
 * This proxy allows us to override the values. This saves us a lot of extra if statements in the core loop
 * for what is normally a very rare use case!
 */
export class LayerRenderable<T extends View = View> implements Renderable<T>
{
    uid = getRenderableUID();
    view: T;
    original: Container<View>;
    layerTransform: Matrix;
    worldTransform: Matrix;
    layerColor: number;
    layerVisibleRenderable: number;
    didViewUpdate: boolean;

    constructor({ original, view }: { original: Container<View>; view: T; })
    {
        this.view = view;
        this.original = original;
        this.layerTransform = new Matrix();
        this.layerColor = 0xFFFFFFFF;
        this.layerVisibleRenderable = 0b11;

        this.view.owner = this;
    }

    get layerBlendMode()
    {
        return this.original.layerBlendMode;
    }

    onViewUpdate()
    {
        this.didViewUpdate = true;
        this.original.layerGroup.onChildViewUpdate(this);
    }
}
