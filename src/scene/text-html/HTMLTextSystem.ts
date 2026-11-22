import { type ImageLike } from '../../environment/ImageLike';
import { ExtensionType } from '../../extensions/Extensions';
import { type CanvasAndContext, CanvasPool } from '../../rendering/renderers/shared/texture/CanvasPool';
import { TexturePool } from '../../rendering/renderers/shared/texture/TexturePool';
import { type TextureStyle } from '../../rendering/renderers/shared/texture/TextureStyle';
import { type Renderer, RendererType } from '../../rendering/renderers/types';
import { isSafari } from '../../utils/browser/isSafari';
import { warn } from '../../utils/logging/warn';
import { BigPool } from '../../utils/pool/PoolGroup';
import { getPo2TextureFromSource } from '../text/utils/getPo2TextureFromSource';
import { HTMLTextRenderData } from './HTMLTextRenderData';
import { type HTMLTextStyle } from './HTMLTextStyle';
import { extractFontFamilies } from './utils/extractFontFamilies';
import { getFontCss } from './utils/getFontCss';
import { getSVGUrl } from './utils/getSVGUrl';
import { getTemporaryCanvasFromImage } from './utils/getTemporaryCanvasFromImage';
import { loadSVGImage } from './utils/loadSVGImage';
import { measureHtmlText } from './utils/measureHtmlText';

import type { System } from '../../rendering/renderers/shared/system/System';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { PoolItem } from '../../utils/pool/Pool';
import type { HTMLText, HTMLTextOptions } from './HTMLText';

/**
 * Options for the {@link HTMLTextSystem}.
 * @category rendering
 * @advanced
 */
export interface HTMLTextSystemOptions
{
    /**
     * How long to wait in milliseconds before drawing an HTMLText in Safari when it uses a font family.
     * WebKit may not have embedded fonts ready when the SVG image loads, so this delay avoids text
     * drawn with a fallback font. Set it to 0 if every font is already loaded in the document.
     * @default 100
     */
    safariFontDelay: number;
}

/**
 * System plugin to the renderer to manage HTMLText
 * @category rendering
 * @advanced
 */
export class HTMLTextSystem implements System<HTMLTextSystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'htmlText',
    } as const;

    /** The default options for the system. */
    public static defaultOptions: HTMLTextSystemOptions = {
        /** {@link HTMLTextSystemOptions.safariFontDelay} */
        safariFontDelay: 100,
    };

    /**
     * How long to wait in milliseconds before drawing an HTMLText in Safari when it uses a font family.
     * @see {@link HTMLTextSystemOptions.safariFontDelay}
     */
    public safariFontDelay: number = HTMLTextSystem.defaultOptions.safariFontDelay;

    /**
     * WebGPU has a cors issue when uploading an image that is an SVGImage
     * To get around this we need to create a canvas draw the image to it and upload that instead.
     * Bit of a shame.. but no other work around just yet!
     */
    private readonly _createCanvas: boolean;
    private readonly _renderer: Renderer;

    private readonly _activeTextures: Record<string, {
        texture: Texture,
        usageCount: number,
        promise: Promise<Texture>,
    }> = {};

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        this._createCanvas = renderer.type === RendererType.WEBGPU;
    }

    /**
     * Initializes the system with the given options.
     * @param options - The options for the system
     */
    public init(options?: Partial<HTMLTextSystemOptions>): void
    {
        this.safariFontDelay = options?.safariFontDelay ?? HTMLTextSystem.defaultOptions.safariFontDelay;
    }

    /**
     * @param options
     * @deprecated Use getTexturePromise instead
     */
    public getTexture(options: HTMLTextOptions): Promise<Texture>
    {
        return this.getTexturePromise(options);
    }

    /**
     * Increases the reference count for a texture.
     * @param text - The HTMLText instance associated with the texture.
     */
    public getManagedTexture(text: HTMLText): Promise<Texture>
    {
        const textKey = text.styleKey;

        if (this._activeTextures[textKey])
        {
            this._increaseReferenceCount(textKey);

            return this._activeTextures[textKey].promise;
        }

        const promise = this._buildTexturePromise(text)
            .then((texture) =>
            {
                this._activeTextures[textKey].texture = texture;

                return texture;
            });

        this._activeTextures[textKey] = {
            texture: null,
            promise,
            usageCount: 1,
        };

        return promise;
    }

    /**
     * Gets the current reference count for a texture associated with a text key.
     * @param textKey - The unique key identifying the text style configuration
     * @returns The number of Text instances currently using this texture
     */
    public getReferenceCount(textKey: string)
    {
        return this._activeTextures[textKey]?.usageCount ?? null;
    }

    private _increaseReferenceCount(textKey: string)
    {
        this._activeTextures[textKey].usageCount++;
    }

    /**
     * Decreases the reference count for a texture.
     * If the count reaches zero, the texture is cleaned up.
     * @param textKey - The key associated with the HTMLText instance.
     */
    public decreaseReferenceCount(textKey: string)
    {
        const activeTexture = this._activeTextures[textKey];

        if (!activeTexture) return;

        activeTexture.usageCount--;

        if (activeTexture.usageCount === 0)
        {
            if (activeTexture.texture)
            {
                this._cleanUp(activeTexture.texture);
            }
            else
            {
                // we did not resolve...
                activeTexture.promise.then((texture) =>
                {
                    activeTexture.texture = texture;

                    this._cleanUp(activeTexture.texture);
                }).catch(() =>
                {
                    // #if _DEBUG
                    warn('HTMLTextSystem: Failed to clean texture');
                    // #endif
                });
            }

            this._activeTextures[textKey] = null;
        }
    }

    /**
     * Returns a promise that resolves to a texture for the given HTMLText options.
     * @param options - The options for the HTMLText.
     * @returns A promise that resolves to a Texture.
     */
    public getTexturePromise(options: HTMLTextOptions): Promise<Texture>
    {
        return this._buildTexturePromise(options);
    }

    private async _buildTexturePromise(options: HTMLTextOptions)
    {
        const { text, style, resolution, textureStyle, autoGenerateMipmaps } = options as {
            text: string,
            style: HTMLTextStyle,
            resolution: number,
            textureStyle?: TextureStyle,
            autoGenerateMipmaps?: boolean,
        };

        const htmlTextData = BigPool.get(HTMLTextRenderData);
        const fontFamilies = extractFontFamilies(text, style);
        const fontCSS = await getFontCss(fontFamilies);
        const measured = measureHtmlText(text, style, fontCSS, htmlTextData);

        const width = Math.ceil(Math.ceil((Math.max(1, measured.width) + (style.padding * 2))) * resolution);
        const height = Math.ceil(Math.ceil((Math.max(1, measured.height) + (style.padding * 2))) * resolution);

        const image = htmlTextData.image;

        // this off set will ensure we don't get any UV bleeding!
        const uvSafeOffset = 2;

        image.width = (width | 0) + uvSafeOffset;
        image.height = (height | 0) + uvSafeOffset;

        const svgURL = getSVGUrl(text, style, resolution, fontCSS, htmlTextData);

        await loadSVGImage(image, svgURL, isSafari() && fontFamilies.length > 0 ? this.safariFontDelay : 0);

        const resource: ImageLike | HTMLCanvasElement = image;
        let canvasAndContext: CanvasAndContext;

        if (this._createCanvas)
        {
            // silly webGPU workaround..
            canvasAndContext = getTemporaryCanvasFromImage(image, resolution);
        }

        const texture = getPo2TextureFromSource(
            canvasAndContext ? canvasAndContext.canvas : resource,
            image.width - uvSafeOffset,
            image.height - uvSafeOffset,
            resolution,
            autoGenerateMipmaps,
            textureStyle?.scaleMode
        );

        // upload now, as the image and canvas go back to their pools and are reused by the next text
        this._renderer?.texture.initSource(texture.source);

        if (this._createCanvas)
        {
            CanvasPool.returnCanvasAndContext(canvasAndContext);
        }

        BigPool.return(htmlTextData as PoolItem);

        return texture;
    }

    public returnTexturePromise(texturePromise: Promise<Texture>)
    {
        texturePromise.then((texture) =>
        {
            this._cleanUp(texture);
        }).catch(() =>
        {
            // #if _DEBUG
            warn('HTMLTextSystem: Failed to clean texture');
            // #endif
        });
    }

    private _cleanUp(texture: Texture)
    {
        // the pool destroys a texture whose bucket was pruned, so take the source before handing it back
        const source = texture.source;

        TexturePool.returnTexture(texture);
        source.resource = null;
        source.uploadMethodId = 'unknown';
    }

    public destroy()
    {
        // BOOM!
        (this._renderer as null) = null;
        for (const key in this._activeTextures)
        {
            if (this._activeTextures[key]) this.returnTexturePromise(this._activeTextures[key].promise);
        }
        (this._activeTextures as null) = null;
    }
}
