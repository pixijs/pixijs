import { LoaderParserPriority } from '../../assets/loader/parsers/LoaderParser';
import { createTexture } from '../../assets/loader/parsers/textures/utils/createTexture';
import { checkExtension } from '../../assets/utils/checkExtension';
import { ExtensionType } from '../../extensions/Extensions';
import { CompressedSource } from '../../rendering/renderers/shared/texture/sources/CompressedSource';
import { getSupportedTextureFormats } from '../../rendering/renderers/shared/texture/utils/getSupportedTextureFormats';
import { parseKTX } from './parseKTX';
import { loadKTX2onWorker } from './worker/loadKTXonWorker';

import type { Loader } from '../../assets/loader/Loader';
import type { LoaderParser } from '../../assets/loader/parsers/LoaderParser';
import type { ResolvedAsset } from '../../assets/types';
import type { TEXTURE_FORMATS } from '../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';

/** Loads KTX textures! */
export const loadKTX = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    name: 'loadKTX',

    test(url: string): boolean
    {
        return checkExtension(url, ['.ktx2', '.ktx']);
    },

    async load(url: string, _asset: ResolvedAsset, loader: Loader): Promise<Texture | Texture[]>
    {
        const supportedTextures = await getSupportedTextureFormats();

        const textureOptions = checkExtension(url, '.ktx2')
            ? await loadKTX2onWorker(url, supportedTextures)
            : await loadAndParseKTX(url, supportedTextures);

        const compressedTextureSource = new CompressedSource(textureOptions);

        return createTexture(compressedTextureSource, loader, url);
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

} as LoaderParser<Texture | Texture[], TextureSourceOptions>;

async function loadAndParseKTX(url: string, supportedFormats: TEXTURE_FORMATS[]): Promise<TextureSourceOptions>
{
    const ktxResponse = await fetch(url);

    const ktxArrayBuffer = await ktxResponse.arrayBuffer();

    const textureOptions = parseKTX(ktxArrayBuffer, supportedFormats);

    return textureOptions;
}
