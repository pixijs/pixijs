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

        canvasText.getReferenceCount(this.currentKey) === null
            ? canvasText.returnTexture(this.texture)
            : canvasText.decreaseReferenceCount(this.currentKey);
        this._renderer.runners.resolutionChange.remove(this);
        (this._renderer as null) = null;
    }
}
