import { type Texture } from '../../rendering/renderers/shared/texture/Texture';
import { BatchableSprite } from '../sprite/BatchableSprite';

import type { Renderer } from '../../rendering/renderers/types';
import type { HTMLText } from './HTMLText';

/**
 * The BatchableHTMLText class extends the BatchableSprite class and is used to handle HTML text rendering.
 * It includes a promise for the texture as generating the HTML texture takes some time.
 * @internal
 */
export class BatchableHTMLText extends BatchableSprite
{
    private readonly _renderer: Renderer;
    public texturePromise: Promise<Texture>;
    public generatingTexture = false;

    /**
     * Creates an instance of BatchableHTMLText.
     * @param renderer - The renderer instance to be used.
     */
    constructor(renderer: Renderer)
    {
        super();

        // Next step is to make canvasTextSystem a GLOBAL object.
        // so this is ok for now..
        this._renderer = renderer;

        renderer.runners.resolutionChange.add(this);
    }

    /** Handles resolution changes for the HTML text. If the text has auto resolution enabled, it triggers a view update. */
    public resolutionChange()
    {
        const text = this.renderable as HTMLText;

        if (text._autoResolution)
        {
            text.onViewUpdate();
        }
    }

    /** Destroys the BatchableHTMLText instance. Returns the texture promise to the renderer and cleans up references. */
    public destroy()
    {
        this._renderer.htmlText.returnTexturePromise(this.texturePromise);

        this.texturePromise = null;
        (this._renderer as null) = null;
    }
}
