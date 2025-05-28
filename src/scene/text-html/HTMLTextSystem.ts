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

/**
 * System plugin to the renderer to manage HTMLText
 * @category rendering
 * @advanced
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

    /**
     * @param options
     * @deprecated Use getTexturePromise instead
     */
    public getTexture(options: HTMLTextOptions): Promise<Texture>
    {
        return this.getTexturePromise(options);
    }

    public getTexturePromise(options: HTMLTextOptions): Promise<Texture>
    {
        return this._buildTexturePromise(options);
    }

    private async _buildTexturePromise(options: HTMLTextOptions)
    {
        const { text, style, resolution, textureStyle } = options as {
            text: string,
            style: HTMLTextStyle,
            resolution: number,
            textureStyle?: TextureStyle,
        };

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

        if (textureStyle) texture.source.style = textureStyle;

        if (this._createCanvas)
        {
            this._renderer.texture.initSource(texture.source);
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
        TexturePool.returnTexture(texture, true);
        texture.source.resource = null;
        texture.source.uploadMethodId = 'unknown';
    }

    public destroy()
    {
        // BOOM!
        (this._renderer as null) = null;
    }
}
