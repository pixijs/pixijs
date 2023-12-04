import EventEmitter from 'eventemitter3';
import { Matrix } from '../../../maths/matrix/Matrix';
import { uid } from '../../../utils/data/uid';

import type { Container } from '../../../scene/container/Container';
import type { Renderable } from './Renderable';
import type { View } from './view/View';

/**
 * RGRenderable is used to render the view of the root container of a render group
 * We don't want to inherit the transform / color of the root container as that information is
 * uploaded to the GPU and applied globally.
 *
 * This proxy allows us to override the values. This saves us a lot of extra if statements in the core loop
 * for what is normally a very rare use case!
 */
export class RGRenderable<T extends View = View> extends EventEmitter implements Renderable<T>
{
    public uid = uid('renderable');
    public view: T;
    private readonly _original: Container<View>;
    public rgTransform: Matrix;
    public rgVisibleRenderable: number;
    public didViewUpdate: boolean;
    public worldTransform: Matrix;
    public rgColorAlpha = 0xffffffff;
    public rgColor = 0xffffff;
    public rgAlpha = 1;

    constructor({ original, view }: { original: Container<View>; view: T })
    {
        super();

        this.view = view;
        this._original = original;
        this.rgTransform = new Matrix();
        this.rgVisibleRenderable = 0b11;

        // render group renderable should match the original id as we use it to reference
        // the gpu counter part on various systems
        this.uid = original.uid;
        this.view.owner = this;
    }

    get rgBlendMode()
    {
        return this._original.rgBlendMode;
    }

    public onViewUpdate()
    {
        this.didViewUpdate = true;
        this._original.renderGroup.onChildViewUpdate(this);
    }

    get isRenderable()
    {
        return this._original.isRenderable;
    }
}
