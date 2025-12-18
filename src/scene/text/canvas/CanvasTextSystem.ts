import { ExtensionType } from '../../../extensions/Extensions';
import { type Filter } from '../../../filters/Filter';
import { TexturePool } from '../../../rendering/renderers/shared/texture/TexturePool';
import { TextureStyle } from '../../../rendering/renderers/shared/texture/TextureStyle';
import { deprecation } from '../../../utils/logging/deprecation';
import { type CanvasTextOptions, type Text } from '../Text';
import { TextStyle } from '../TextStyle';
import { getPo2TextureFromSource } from '../utils/getPo2TextureFromSource';
import { CanvasTextGenerator } from './CanvasTextGenerator';

import type { System } from '../../../rendering/renderers/shared/system/System';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Renderer } from '../../../rendering/renderers/types';

/**
 * System plugin to the renderer to manage canvas text.
 * @category rendering
 * @advanced
 */
export class CanvasTextSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'canvasText',
    } as const;

    private readonly _renderer: Renderer;

    private readonly _activeTextures: Record<string, {
        texture: Texture,
        usageCount: number,
    }> = {};

    constructor(_renderer: Renderer)
    {
        this._renderer = _renderer;
    }

    /** @deprecated since 8.0.0 */
    public getTexture(text: string, resolution: number, style: TextStyle, textKey: string): Texture;
    /**
     * This is a function that will create a texture from a text string, style and resolution.
     * Useful if you want to make a texture of your text and use if for various other pixi things!
     * @param options - The options of the text that will be used to generate the texture.
     * @param options.text - the text to render
     * @param options.style - the style of the text
     * @param options.resolution - the resolution of the texture
     * @returns the newly created texture
     */
    public getTexture(options: CanvasTextOptions): Texture;
    public getTexture(
        options: CanvasTextOptions | string,
        _resolution?: number,
        _style?: TextStyle,
        _textKey?: string
    ): Texture
    {
        if (typeof options === 'string')
        {
            // #if _DEBUG
            deprecation('8.0.0', 'CanvasTextSystem.getTexture: Use object TextOptions instead of separate arguments');
            // #endif

            options = {
                text: options,
                style: _style,
                resolution: _resolution,
            };
        }

        if (!(options.style instanceof TextStyle))
        {
            options.style = new TextStyle(options.style);
        }

        if (!(options.textureStyle instanceof TextureStyle))
        {
            options.textureStyle = new TextureStyle(options.textureStyle);
        }

        if (typeof options.text !== 'string')
        {
            options.text = options.text.toString();
        }

        const { text, style, textureStyle } = options;

        const resolution = options.resolution ?? this._renderer.resolution;

        const { frame, canvasAndContext } = CanvasTextGenerator.getCanvasAndContext({
            text: text as string,
            style: style as TextStyle,
            resolution,
        });

        const texture = getPo2TextureFromSource(canvasAndContext.canvas, frame.width, frame.height, resolution);

        if (textureStyle) texture.source.style = textureStyle as TextureStyle;

        if (style.trim)
        {
            // reapply the padding to the frame
            frame.pad(style.padding);
            texture.frame.copyFrom(frame);

            // We initially increased the frame size by a resolution factor
            // to achieve a crisper display. Now we need to scale down the already
            // trimmed frame to render the texture in the expected size.
            texture.frame.scale(1 / resolution);
            texture.updateUvs();
        }

        if (style.filters)
        {
            // apply the filters to the texture if required..
            // this returns a new texture with the filters applied
            const filteredTexture = this._applyFilters(texture, style.filters as Filter[]);

            // return the original texture to the pool so we can reuse the next frame
            this.returnTexture(texture);

            CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);

            // return the new texture with the filters applied
            return filteredTexture;
        }

        this._renderer.texture.initSource(texture._source);

        CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);

        return texture;
    }

    /**
     * Returns a texture that was created wit the above `getTexture` function.
     * Handy if you are done with a texture and want to return it to the pool.
     * @param texture - The texture to be returned.
     */
    public returnTexture(texture: Texture)
    {
        const source = texture.source;

        source.resource = null;
        source.uploadMethodId = 'unknown';
        source.alphaMode = 'no-premultiply-alpha';

        TexturePool.returnTexture(texture, true);
    }

    /**
     * Renders text to its canvas, and updates its texture.
     * @deprecated since 8.10.0
     */
    public renderTextToCanvas(): void
    {
        // #if _DEBUG
        deprecation(
            '8.10.0',
            'CanvasTextSystem.renderTextToCanvas: no longer supported, use CanvasTextSystem.getTexture instead'
        );
        // #endif
    }

    /**
     * Gets or creates a managed texture for a Text object. This method handles texture reuse and reference counting.
     * @param text - The Text object that needs a texture
     * @returns A Texture instance that represents the rendered text
     * @remarks
     * This method performs the following:
     * 1. Sets the appropriate resolution based on auto-resolution settings
     * 2. Checks if a texture already exists for the text's style
     * 3. Creates a new texture if needed or returns an existing one
     * 4. Manages reference counting for texture reuse
     */
    public getManagedTexture(text: Text)
    {
        text._resolution = text._autoResolution ? this._renderer.resolution : text.resolution;
        const textKey = text.styleKey;

        if (this._activeTextures[textKey])
        {
            this._increaseReferenceCount(textKey);

            return this._activeTextures[textKey].texture;
        }

        const texture = this.getTexture({
            text: text.text,
            style: text.style,
            resolution: text._resolution,
            textureStyle: text.textureStyle,
        });

        this._activeTextures[textKey] = {
            texture,
            usageCount: 1,
        };

        return texture;
    }

    /**
     * Decreases the reference count for a texture associated with a text key.
     * When the reference count reaches zero, the texture is returned to the pool.
     * @param textKey - The unique key identifying the text style configuration
     * @remarks
     * This method is crucial for memory management, ensuring textures are properly
     * cleaned up when they are no longer needed by any Text instances.
     */
    public decreaseReferenceCount(textKey: string)
    {
        const activeTexture = this._activeTextures[textKey];

        activeTexture.usageCount--;

        if (activeTexture.usageCount === 0)
        {
            this.returnTexture(activeTexture.texture);
            this._activeTextures[textKey] = null;
        }
    }

    /**
     * Gets the current reference count for a texture associated with a text key.
     * @param textKey - The unique key identifying the text style configuration
     * @returns The number of Text instances currently using this texture
     */
    public getReferenceCount(textKey: string)
    {
        return this._activeTextures[textKey]?.usageCount ?? 0;
    }

    private _increaseReferenceCount(textKey: string)
    {
        this._activeTextures[textKey].usageCount++;
    }

    /**
     * Applies the specified filters to the given texture.
     *
     * This method takes a texture and a list of filters, applies the filters to the texture,
     * and returns the resulting texture. It also ensures that the alpha mode of the resulting
     * texture is set to 'premultiplied-alpha'.
     * @param {Texture} texture - The texture to which the filters will be applied.
     * @param {Filter[]} filters - The filters to apply to the texture.
     * @returns {Texture} The resulting texture after all filters have been applied.
     */
    private _applyFilters(texture: Texture, filters: Filter[]): Texture
    {
        // Save the current render target so it can be restored later
        const currentRenderTarget = this._renderer.renderTarget.renderTarget;

        // Apply the filters to the texture and get the resulting texture
        const resultTexture = this._renderer.filter.generateFilteredTexture({
            texture,
            filters,
        });

        // Set the alpha mode of the resulting texture to 'premultiplied-alpha'

        // Restore the previous render target
        this._renderer.renderTarget.bind(currentRenderTarget, false);

        // Return the resulting texture with the filters applied
        return resultTexture;
    }

    public destroy(): void
    {
        (this._renderer as null) = null;
        // Clean up active textures
        for (const key in this._activeTextures)
        {
            if (this._activeTextures[key]) this.returnTexture(this._activeTextures[key].texture);
        }
        (this._activeTextures as null) = null;
    }
}
