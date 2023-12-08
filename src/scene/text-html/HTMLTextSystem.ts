import { ExtensionType } from '../../extensions/Extensions';
import { TexturePool } from '../../rendering/renderers/shared/texture/TexturePool';
import { RendererType } from '../../rendering/renderers/types';
import { isSafari } from '../../utils/browser/isSafari';
import { warn } from '../../utils/logging/warn';
import { BigPool } from '../../utils/pool/PoolGroup';
import { getPo2TextureFromSource } from '../text/utils/getPo2TextureFromSource';
import { extractFontFamilies } from './utils/extractFontFamilies';
import { getFontCss } from './utils/getFontCss';
import { getSVGUrl } from './utils/getSVGUrl';
import { getTemporaryCanvasFromImage } from './utils/getTemporaryCanvasFromImage';
import { loadSVGImage } from './utils/loadSVGImage';
import { measureHtmlText } from './utils/measureHtmlText';

import type { WebGPURenderer } from '../../rendering/renderers/gpu/WebGPURenderer';
import type { System } from '../../rendering/renderers/shared/system/System';
import type { CanvasAndContext } from '../../rendering/renderers/shared/texture/CanvasPool';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { Renderer } from '../../rendering/renderers/types';
import type { PoolItem } from '../../utils/pool/Pool';
import type { TextViewOptions } from '../text/TextView';
import type { HTMLTextStyle } from './HtmlTextStyle';
import type { FontCSSStyleOptions } from './utils/loadFontCSS';

const nssvg = 'http://www.w3.org/2000/svg';
const nsxhtml = 'http://www.w3.org/1999/xhtml';

export const FontStylePromiseCache = new Map<string, Promise<string>>();

export class HTMLTextRenderData
{
    public svgRoot = document.createElementNS(nssvg, 'svg');
    public foreignObject = document.createElementNS(nssvg, 'foreignObject');
    public domElement = document.createElementNS(nsxhtml, 'div');
    public styleElement = document.createElementNS(nsxhtml, 'style');
    public image = new Image();
    public canvasAndContext?: CanvasAndContext;

    constructor()
    {
        const { foreignObject, svgRoot, styleElement, domElement } = this;
        // Arbitrary max size

        foreignObject.setAttribute('width', '10000');
        foreignObject.setAttribute('height', '10000');
        foreignObject.style.overflow = 'hidden';

        svgRoot.appendChild(foreignObject);

        foreignObject.appendChild(styleElement);
        foreignObject.appendChild(domElement);
    }
}

interface HTMLTextTexture
{
    texture: Texture,
    usageCount: number,
    promise: Promise<Texture>,
}

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

    public getTexture(options: TextViewOptions): Promise<Texture>
    {
        return this._buildTexturePromise(options.text as string, options.resolution, options.style as HTMLTextStyle);
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
        const fontCSS = await getFontCss(fontFamilies, style);
        const measured = measureHtmlText(text, style, fontCSS, htmlTextData);

        const width = Math.ceil(Math.ceil((Math.max(1, measured.width) + (style.padding * 2))) * resolution);
        const height = Math.ceil(Math.ceil((Math.max(1, measured.height) + (style.padding * 2))) * resolution);

        const image = htmlTextData.image;

        image.width = width | 0;
        image.height = height | 0;

        const svgURL = getSVGUrl(text, style, resolution, fontCSS, htmlTextData);

        await loadSVGImage(image, svgURL, isSafari() && fontFamilies.length > 0);

        let resource: HTMLImageElement | HTMLCanvasElement = image;

        if (this._createCanvas)
        {
            // silly webGPU workaround..
            resource = getTemporaryCanvasFromImage(image, resolution);
        }

        const texture = getPo2TextureFromSource(resource, image.width, image.height, resolution);

        if (this._createCanvas)
        {
            // TODO initSource will be in webGL soon too, we can remove this cast then
            (this._renderer as WebGPURenderer).texture.initSource(texture.source);
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
