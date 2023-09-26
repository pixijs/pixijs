import EventEmitter from 'eventemitter3';
import { uid } from '../../../utils/data/uid';

import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Renderable } from './Renderable';
import type { View } from './view/View';

export interface ProxyOptions<T>
{
    original?: Renderable<any>;
    view: T;
}

export class ProxyRenderable<T extends View = View> extends EventEmitter implements Renderable<T>
{
    public uid = uid('renderable');
    public view: T;
    private _original: Renderable<any>;
    public layerTransform: Matrix;
    public worldTransform: Matrix;
    public didViewUpdate = false;

    constructor({ original, view }: ProxyOptions<T>)
    {
        super();

        this.view = view;

        if (original)
        {
            this.init(original);
        }
    }

    public init(original: Renderable<any>)
    {
        this._original = original;
        this.layerTransform = original.layerTransform;
    }

    get layerColor()
    {
        return this._original.layerColor;
    }

    get layerBlendMode()
    {
        return this._original.layerBlendMode;
    }

    get layerVisibleRenderable()
    {
        return this._original.layerVisibleRenderable;
    }

    get isRenderable()
    {
        return this._original.isRenderable;
    }
}
