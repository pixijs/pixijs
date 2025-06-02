import { BatchableSprite } from '../../sprite/BatchableSprite';

import type { Renderer } from '../../../rendering/renderers/types';
import type { Text } from '../Text';

/** @internal */
export class BatchableText extends BatchableSprite
{
    private readonly _renderer: Renderer;

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
        this._renderer.canvasText.returnTexture(this.texture);

        (this._renderer as null) = null;
    }
}
