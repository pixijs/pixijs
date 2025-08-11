import { BatchableSprite } from '../../sprite/BatchableSprite';

import type { Renderer } from '../../../rendering/renderers/types';
import type { Text } from '../Text';

const typeSymbol = Symbol.for('pixijs.BatchableText');

/** @internal */
export class BatchableText extends BatchableSprite
{
    /**
     * Type symbol used to identify instances of BatchableText.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a BatchableText.
     * @param obj - The object to check.
     * @returns True if the object is a BatchableText, false otherwise.
     */
    public static isBatchableText(obj: any): obj is BatchableText
    {
        return !!obj && !!obj[typeSymbol];
    }

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
