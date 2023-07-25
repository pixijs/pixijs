import EventEmitter from 'eventemitter3';
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
export class LayerRenderable<T extends View = View> extends EventEmitter implements Renderable<T>
{
    public uid = getRenderableUID();
    public view: T;
    private readonly _original: Container<View>;
    public layerTransform: Matrix;
    public worldTransform: Matrix;
    public layerColor: number;
    public layerVisibleRenderable: number;
    public didViewUpdate: boolean;

    constructor({ original, view }: { original: Container<View>; view: T })
    {
        super();

        this.view = view;
        this._original = original;
        this.layerTransform = new Matrix();
        this.layerColor = 0xffffffff;
        this.layerVisibleRenderable = 0b11;

        this.view.owner = this;
    }

    get layerBlendMode()
    {
        return this._original.layerBlendMode;
    }

    public onViewUpdate()
    {
        this.didViewUpdate = true;
        this._original.layerGroup.onChildViewUpdate(this);
    }

    get isRenderable()
    {
        return this._original.isRenderable;
    }
}
