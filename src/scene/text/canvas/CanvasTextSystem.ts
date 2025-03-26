import { ExtensionType } from '../../../extensions/Extensions';
import { TexturePool } from '../../../rendering/renderers/shared/texture/TexturePool';
import { deprecation } from '../../../utils/logging/deprecation';
import { TextStyle } from '../TextStyle';
import { getPo2TextureFromSource } from '../utils/getPo2TextureFromSource';
import { CanvasTextGenerator } from './CanvasTextGenerator';

import type { System } from '../../../rendering/renderers/shared/system/System';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Renderer } from '../../../rendering/renderers/types';
import type { TextOptions } from '../AbstractText';

/**
 * System plugin to the renderer to manage canvas text.
 * @memberof rendering
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

    constructor(_renderer: Renderer)
    {
        this._renderer = _renderer;
    }

    /**
     * This is a function that will create a texture from a text string, style and resolution.
     * Useful if you want to make a texture of your text and use if for various other pixi things!
     * @param options - The options of the text that will be used to generate the texture.
     * @param options.text - the text to render
     * @param options.style - the style of the text
     * @param options.resolution - the resolution of the texture
     * @returns the newly created texture
     */
    /** @deprecated since 8.0.0 */
    public getTexture(text: string, resolution: number, style: TextStyle, textKey: string): Texture;
    public getTexture(options: TextOptions): Texture;
    public getTexture(options: TextOptions | string, _resolution?: number, style?: TextStyle, _textKey?: string): Texture
    {
        if (typeof options === 'string')
        {
            // #if _DEBUG
            deprecation('8.0.0', 'CanvasTextSystem.getTexture: Use object TextOptions instead of separate arguments');
            // #endif

            options = {
                text: options,
                style,
                resolution: _resolution,
            };
        }

        if (!(options.style instanceof TextStyle))
        {
            options.style = new TextStyle(options.style);
        }

        const resolution = options.resolution ?? this._renderer.resolution;

        const { frame, canvasAndContext } = CanvasTextGenerator.getCanvasAndContext({
            text: options.text as string,
            style: options.style as TextStyle,
            resolution,
        });

        const texture = getPo2TextureFromSource(canvasAndContext.canvas, frame.width, frame.height, resolution);

        if (options.style.trim)
        {
            texture.frame.copyFrom(frame);
            texture.updateUvs();
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

        TexturePool.returnTexture(texture);
    }

    public destroy(): void
    {
        // BOOM!
    }
}
