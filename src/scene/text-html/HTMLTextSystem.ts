import { ExtensionType } from '../../extensions/Extensions';
import { type CanvasAndContext, CanvasPool } from '../../rendering/renderers/shared/texture/CanvasPool';
import { TexturePool } from '../../rendering/renderers/shared/texture/TexturePool';
import { type Renderer, RendererType } from '../../rendering/renderers/types';
import { isSafari } from '../../utils/browser/isSafari';
import { warn } from '../../utils/logging/warn';
import { BigPool } from '../../utils/pool/PoolGroup';
import { getPo2TextureFromSource } from '../text/utils/getPo2TextureFromSource';
import { HTMLTextRenderData } from './HTMLTextRenderData';
import { HTMLTextStyle } from './HTMLTextStyle';
import { extractFontFamilies } from './utils/extractFontFamilies';
import { getFontCss } from './utils/getFontCss';
import { getSVGUrl } from './utils/getSVGUrl';
import { getTemporaryCanvasFromImage } from './utils/getTemporaryCanvasFromImage';
import { loadSVGImage } from './utils/loadSVGImage';
import { measureHtmlText } from './utils/measureHtmlText';

import type { System } from '../../rendering/renderers/shared/system/System';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { PoolItem } from '../../utils/pool/Pool';
import type { HTMLTextOptions } from './HTMLText';
import type { FontCSSStyleOptions } from './utils/loadFontCSS';

interface HTMLTextTexture
{
    texture: Texture,
    usageCount: number,
    promise: Promise<Texture>,
}

/**
 * System plugin to the renderer to manage HTMLText
 * @memberof rendering
 */
export class HTMLTextSystem implements System
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

    public static defaultFontOptions: FontCSSStyleOptions = {
        fontFamily: 'Arial',
        fontStyle: 'normal',
        fontWeight: 'normal',
    };

    private _activeTextures: Record<string, HTMLTextTexture> = {};

    /**
     * WebGPU has a cors issue when uploading an image that is an SVGImage
     * To get around this we need to create a canvas draw the image to it and upload that instead.
     * Bit of a shame.. but no other work around just yet!
     */
    private readonly _createCanvas: boolean;
    private readonly _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        this._createCanvas = renderer.type === RendererType.WEBGPU;
    }

    public getTexture(options: HTMLTextOptions): Promise<Texture>
    {
        return this._buildTexturePromise(
            options.text as string,
            options.resolution,
            options.style as HTMLTextStyle
        );
    }

    public getManagedTexture(
        text: string,
        resolution: number,
        style: HTMLTextStyle,
        textKey: string
    ): Promise<Texture>
    {
        if (this._activeTextures[textKey])
        {
            this._increaseReferenceCount(textKey);

            return this._activeTextures[textKey].promise;
        }

        const promise = this._buildTexturePromise(text, resolution, style)
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

    private async _buildTexturePromise(
        text: string,
        resolution: number,
        style: HTMLTextStyle,
    )
    {
        const htmlTextData = BigPool.get(HTMLTextRenderData);
        const fontFamilies = extractFontFamilies(text, style);
        const fontCSS = await getFontCss(
            fontFamilies,
            style,
            HTMLTextStyle.defaultTextStyle as {fontWeight: string, fontStyle: string}
        );
        const measured = measureHtmlText(text, style, fontCSS, htmlTextData);

        const width = Math.ceil(Math.ceil((Math.max(1, measured.width) + (style.padding * 2))) * resolution);
        const height = Math.ceil(Math.ceil((Math.max(1, measured.height) + (style.padding * 2))) * resolution);

        const image = htmlTextData.image;

        // this off set will ensure we don't get any UV bleeding!
        const uvSafeOffset = 2;

        image.width = (width | 0) + uvSafeOffset;
        image.height = (height | 0) + uvSafeOffset;

        const svgURL = getSVGUrl(text, style, resolution, fontCSS, htmlTextData);

        await loadSVGImage(image, svgURL, isSafari() && fontFamilies.length > 0);

        const resource: HTMLImageElement | HTMLCanvasElement = image;
        let canvasAndContext: CanvasAndContext;

        if (this._createCanvas)
        {
            // silly webGPU workaround..
            canvasAndContext = getTemporaryCanvasFromImage(image, resolution);
        }

        const texture = getPo2TextureFromSource(canvasAndContext ? canvasAndContext.canvas : resource,
            image.width - uvSafeOffset,
            image.height - uvSafeOffset,
            resolution
        );

        if (this._createCanvas)
        {
            this._renderer.texture.initSource(texture.source);
            CanvasPool.returnCanvasAndContext(canvasAndContext);
        }

        BigPool.return(htmlTextData as PoolItem);

        return texture;
    }

    private _increaseReferenceCount(textKey: string)
    {
        this._activeTextures[textKey].usageCount++;
    }

    public decreaseReferenceCount(textKey: string)
    {
        const activeTexture = this._activeTextures[textKey];

        // TODO SHOULD NOT BE NEEDED
        if (!activeTexture) return;

        activeTexture.usageCount--;

        if (activeTexture.usageCount === 0)
        {
            if (activeTexture.texture)
            {
                this._cleanUp(activeTexture);
            }
            else
            {
                // we did not resolve...
                activeTexture.promise.then((texture) =>
                {
                    activeTexture.texture = texture;

                    this._cleanUp(activeTexture);
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

    private _cleanUp(activeTexture: HTMLTextTexture)
    {
        TexturePool.returnTexture(activeTexture.texture);
        activeTexture.texture.source.resource = null;
        activeTexture.texture.source.uploadMethodId = 'unknown';
    }

    public getReferenceCount(textKey: string)
    {
        return this._activeTextures[textKey].usageCount;
    }

    public destroy(): void
    {
        this._activeTextures = null;
    }
}
