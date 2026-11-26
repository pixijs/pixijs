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
 * Options for loading a raw `.astc` file
 *
 * The loader reads only `resolution` and `srgb`. Set other options, such as `scaleMode`, on `texture.source`
 * after loading.
 * @category assets
 * @advanced
 */
export interface ASTCOptions extends TextureSourceOptions
{
    /**
     * Whether the GPU converts the texture's colors from sRGB to linear when sampling it
     *
     * A raw `.astc` file stores no color space. Leave this off for an image compressed from a PNG or JPEG, and
     * PixiJS draws it like the PNG. Turn it on only when your shader expects linear color, because it draws
     * mid-tones darker: a gray of 128 draws as 55.
     * @default false
     */
    srgb?: boolean;
}

/**
 * Loads a raw `.astc` file, as `astcenc` writes it, into a compressed texture
 *
 * Register it with `import 'pixi.js/astc'`. The loader uploads the file's blocks without transcoding, so the
 * load rejects on a device without ASTC support. List a fallback after the `.astc` file, and the resolver picks
 * it on those devices. A raw file holds one 2D image, so the texture has no mipmaps.
 * @example
 * ```ts
 * import 'pixi.js/astc';
 * import { Assets } from 'pixi.js';
 *
 * const texture = await Assets.load({ src: ['image.astc', 'image.png'] });
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
        });

        // the constructor multiplies width and height by resolution, but the parsed size is already in pixels
        source.resolution = resolution;
        const texture = createTexture(source, loader, url);

        // WebGPU only creates compressed textures whose size is whole blocks, so frame the texture to the image
        texture.noFrame = false;
        texture.frame.width = options.width / resolution;
        texture.frame.height = options.height / resolution;
        texture.updateUvs();

        return texture;
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    },
} satisfies LoaderParser<Texture, ASTCOptions>;
