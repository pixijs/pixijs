import { LoaderParserPriority } from '../../assets/loader/parsers/LoaderParser';
import { checkExtension } from '../../assets/utils/checkExtension';
import { ExtensionType } from '../../extensions/Extensions';
import { getSupportedTextureFormats } from '../../rendering/renderers/shared/texture/utils/getSupportedTextureFormats';
import { createCompressedTexture } from '../shared/createCompressedTexture';
import { parseKTX } from './parseKTX';

import type { Loader } from '../../assets/loader/Loader';
import type { LoaderParser } from '../../assets/loader/parsers/LoaderParser';
import type { ResolvedAsset } from '../../assets/types';
import type { TextureSourceOptions } from '../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';

/**
 * Loads KTX textures.
 * @category assets
 * @advanced
 */
export const loadKTX = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
        name: 'loadKTX',
    },

    /** used for deprecation purposes */
    name: 'loadKTX',
    id: 'ktx',

    test(url: string): boolean
    {
        return checkExtension(url, '.ktx');
    },

    async load(url: string, asset: ResolvedAsset, loader: Loader): Promise<Texture | Texture[]>
    {
        const supportedTextures = await getSupportedTextureFormats();

        const ktxResponse = await fetch(url);

        const ktxArrayBuffer = await ktxResponse.arrayBuffer();

        const textureOptions = parseKTX(ktxArrayBuffer, supportedTextures);

        return createCompressedTexture(textureOptions, url, asset, loader);
    },

    unload(texture: Texture | Texture[]): void
    {
        if (Array.isArray(texture))
        {
            texture.forEach((t) => t.destroy(true));
        }
        else
        {
            texture.destroy(true);
        }
    }

} satisfies LoaderParser<Texture | Texture[], TextureSourceOptions>;

