import { BatchableSprite } from '../../sprite/BatchableSprite';

import type { Renderer } from '../../../rendering/renderers/types';
import type { Text } from '../Text';

/** @internal */
export class BatchableText extends BatchableSprite
{
    private readonly _renderer: Renderer;
    public currentKey: string;

    constructor(renderer: Renderer)
    {
        super();

        // Next step is to make canvasTextSystem a GLOBAL object.
        // so this is ok for now..
        this._renderer = renderer;

        renderer.runners.resolutionChange.add(this);
    }

    public resolutionChange()
    {
        const text = this.renderable as Text;

        if (text._autoResolution)
        {
            text.onViewUpdate();
        }
    }

    public destroy()
    {
        const { canvasText } = this._renderer;
        const refCount = canvasText.getReferenceCount(this.currentKey);

        if (refCount > 0)
        {
            canvasText.decreaseReferenceCount(this.currentKey);
        }
        else if (this.texture)
        {
            canvasText.returnTexture(this.texture);
        }

        this._renderer.runners.resolutionChange.remove(this);
        (this._renderer as null) = null;
    }
}
