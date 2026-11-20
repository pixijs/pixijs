import { LoaderParserPriority } from '../../assets/loader/parsers/LoaderParser';
import { createTexture } from '../../assets/loader/parsers/textures/utils/createTexture';
import { checkExtension } from '../../assets/utils/checkExtension';
import { ExtensionType } from '../../extensions/Extensions';
import { CompressedSource } from '../../rendering/renderers/shared/texture/sources/CompressedSource';
import { getSupportedTextureFormats } from '../../rendering/renderers/shared/texture/utils/getSupportedTextureFormats';
import { getResolutionOfUrl } from '../../utils/network/getResolutionOfUrl';
import { parseASTC } from './parseASTC';

import type { Loader } from '../../assets/loader/Loader';
import type { LoaderParser } from '../../assets/loader/parsers/LoaderParser';
import type { ResolvedAsset } from '../../assets/types';
import type { TextureSourceOptions } from '../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';

/**
 * Options for loading raw ASTC textures.
 * @category assets
 * @advanced
 */
export interface ASTCOptions extends TextureSourceOptions
{
    /**
     * Raw ASTC files do not encode color space. Defaults to false (linear).
     * @advanced
     */
    srgb?: boolean;
}

/**
 * Loads raw 2D ASTC files directly as compressed textures, without transcoding.
 * Register with `import 'pixi.js/astc'`. Requires device ASTC support.
 * @example
 * ```ts
 * import 'pixi.js/astc';
 * const texture = await Assets.load({ src: 'image.astc', data: { srgb: true } });
 * ```
 * @category assets
 * @advanced
 */
export const loadASTC = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
        name: 'loadASTC',
    },
    name: 'loadASTC',
    id: 'astc',

    test(url: string): boolean
    {
        return checkExtension(url, '.astc');
    },

    async load(url: string, asset: ResolvedAsset<ASTCOptions>, loader: Loader): Promise<Texture>
    {
        const supportedFormats = await getSupportedTextureFormats();
        const response = await fetch(url);

        if (!response.ok)
        {
            throw new Error(`Failed to load ASTC texture: ${response.status} ${url}`);
        }

        const options = parseASTC(await response.arrayBuffer(), supportedFormats, asset.data?.srgb);
        const [blockWidth, blockHeight] = options.format.split('-')[1].split('x').map(Number);
        const resolution = asset.data?.resolution || getResolutionOfUrl(url);
        const source = new CompressedSource({
            ...options,
            width: Math.ceil(options.width / blockWidth) * blockWidth,
            height: Math.ceil(options.height / blockHeight) * blockHeight,
            resolution,
        });
        const texture = createTexture(source, loader, url);

        // WebGPU allocations are block-aligned; exclude padded texels from the sprite's UVs.
        texture.noFrame = false;
        texture.frame.width = options.width / resolution;
        texture.frame.height = options.height / resolution;
        texture.orig.copyFrom(texture.frame);
        texture.updateUvs();

        return texture;
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    },
} satisfies LoaderParser<Texture, ASTCOptions>;
