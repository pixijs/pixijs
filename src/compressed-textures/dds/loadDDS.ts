import { LoaderParserPriority } from '../../assets/loader/parsers/LoaderParser';
import { createTexture } from '../../assets/loader/parsers/textures/utils/createTexture';
import { checkExtension } from '../../assets/utils/checkExtension';
import { ExtensionType } from '../../extensions/Extensions';
import { CompressedSource } from '../../rendering/renderers/shared/texture/sources/CompressedSource';
import { getSupportedTextureFormats } from '../../rendering/renderers/shared/texture/utils/getSupportedTextureFormats';
import { parseDDS } from './parseDDS';

import type { Loader } from '../../assets/loader/Loader';
import type { LoaderParser } from '../../assets/loader/parsers/LoaderParser';
import type { ResolvedAsset } from '../../assets/types';
import type { TextureSourceOptions } from '../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';

/** Loads KTX textures! */
export const loadDDS = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
        name: 'loadDDS',
    },

    name: 'loadDDS',

    test(url: string): boolean
    {
        return checkExtension(url, ['.dds']);
    },

    async load(url: string, _asset: ResolvedAsset, loader: Loader): Promise<Texture | Texture[]>
    {
        const supportedTextures = await getSupportedTextureFormats();

        const ddsResponse = await fetch(url);

        const ddsArrayBuffer = await ddsResponse.arrayBuffer();

        const textureOptions = parseDDS(ddsArrayBuffer, supportedTextures);

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

} satisfies LoaderParser<Texture | Texture[], TextureSourceOptions>;

