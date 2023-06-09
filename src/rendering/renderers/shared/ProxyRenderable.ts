import EventEmitter from 'eventemitter3';
import { getRenderableUID } from '../../scene/Container';

import type { Matrix } from '../../../maths/Matrix';
import type { Renderable } from './Renderable';
import type { View } from './View';

export interface ProxyOptions<T>
{
    original?: Renderable<any>;
    view: T;
}

export class ProxyRenderable<T extends View = View> extends EventEmitter implements Renderable<T>
{
    uid = getRenderableUID();
    view: T;
    original: Renderable<any>;
    layerTransform: Matrix;
    worldTransform: Matrix;
    didViewUpdate = false;

    constructor({ original, view }: ProxyOptions<T>)
    {
        super();

        this.view = view;

        if (original)
        {
            this.init(original);
        }
    }

    init(original: Renderable<any>)
    {
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
