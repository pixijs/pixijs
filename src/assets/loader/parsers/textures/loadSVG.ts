import { DOMAdapter } from '../../../../environment/adapter';
import { ExtensionType } from '../../../../extensions/Extensions';
import { ImageSource } from '../../../../rendering/renderers/shared/texture/sources/ImageSource';
import { GraphicsContext } from '../../../../scene/graphics/shared/GraphicsContext';
import { getResolutionOfUrl } from '../../../../utils/network/getResolutionOfUrl';
import { checkDataUrl } from '../../../utils/checkDataUrl';
import { checkExtension } from '../../../utils/checkExtension';
import { type LoaderParser, LoaderParserPriority } from '../LoaderParser';
import { createTexture } from './utils/createTexture';

import type { TextureSourceOptions } from '../../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import type { ResolvedAsset } from '../../../types';
import type { Loader } from '../../Loader';

export interface LoadSVGConfig
{
    /**
     * The crossOrigin value to use for images when `preferCreateImageBitmap` is `false`.
     * @default 'anonymous'
     */
    crossOrigin: HTMLImageElement['crossOrigin'];

    preferGraphics: boolean;
}

/**
 * Regular expression for SVG XML document.
 * @example &lt;?xml version="1.0" encoding="utf-8" ?&gt;&lt;!-- image/svg --&gt;&lt;svg
 * @readonly
 */
const validSVGExtension = '.svg';
const validSVGMIME = 'image/svg+xml';

/**
 * A simple loader plugin for loading json data
 * @memberof assets
 */
export const loadSvg = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low,
    },

    name: 'loadSVG',

    test(url: string): boolean
    {
        return checkDataUrl(url, validSVGMIME) || checkExtension(url, validSVGExtension);
    },

    async load(url: string, asset: ResolvedAsset<TextureSourceOptions>, loader: Loader): Promise<Texture | GraphicsContext>
    {
        const preferTexture = true;

        if (preferTexture)
        {
            return loadAsTexture(url, asset, loader);
        }

        return loadAsGraphics(url);
    },

    unload(asset: Texture | GraphicsContext): void
    {
        asset.destroy(true);
    }

} as LoaderParser<Texture | GraphicsContext, TextureSourceOptions>;

async function loadAsTexture(url: string, asset: ResolvedAsset<TextureSourceOptions>, loader: Loader)
{
    const response = await DOMAdapter.get().fetch(url);

    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);

    const image = new Image();

    image.src = blobUrl;
    await image.decode();

    URL.revokeObjectURL(blobUrl);

    // convert to canvas...
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const resolution = asset.data?.resolution || getResolutionOfUrl(url);

    const width = asset.data?.width ?? image.width;
    const height = asset.data?.height ?? image.height;

    canvas.width = width * resolution;
    canvas.height = height * resolution;

    context.drawImage(image, 0, 0, width * resolution, height * resolution);

    const base = new ImageSource({
        resource: canvas,
        alphaMode: 'premultiply-alpha-on-upload',
        resolution,
        ...asset.data,
    });

    return createTexture(base, loader, url);
}

async function loadAsGraphics(url: string): Promise<GraphicsContext>
{
    const response = await DOMAdapter.get().fetch(url);
    const svgSource = await response.text();

    const context = new GraphicsContext();

    context.svg(svgSource);

    return context;
}
