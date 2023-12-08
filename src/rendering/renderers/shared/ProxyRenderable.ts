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
    public rgTransform: Matrix;
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
        this.rgTransform = original.rgTransform;
    }

    get rgColorAlpha()
    {
        return this._original.rgColorAlpha;
    }

    get rgColor()
    {
        return this._original.rgColor;
    }

    get rgAlpha()
    {
        return this._original.rgAlpha;
    }

    get rgBlendMode()
    {
        return this._original.rgBlendMode;
    }

    get rgVisibleRenderable()
    {
        return this._original.rgVisibleRenderable;
    }

    get isRenderable()
    {
        return this._original.isRenderable;
    }
}
