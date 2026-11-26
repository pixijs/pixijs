import { convertFormatIfRequired } from './convertFormatIfRequired';
import { createLevelBuffersFromKTX } from './createLevelBuffersFromKTX';
import { getTextureFormatFromKTXTexture } from './getTextureFormatFromKTXTexture';

import type { TEXTURE_FORMATS } from '../../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { COMPRESSED_TEXTURE_FORMATS, LIBKTXModule } from '../types';

/**
 * Reads the bytes of a KTX2 file into texture options, transcoding Basis data when the file holds it.
 *
 * The libktx texture lives in the transcoder's WebAssembly heap until it is deleted, and nothing deletes it
 * automatically, so it is deleted here once its levels are copied out, or when reading fails.
 * @param ktx - The libktx module.
 * @param data - The bytes of the KTX2 file.
 * @param transcode - The libktx transcode target and the texture format it produces.
 * @param transcode.transcoderFormat - The name of the libktx transcode target.
 * @param transcode.transcodedFormat - The texture format the transcode target produces.
 * @internal
 */
export function createTextureOptionsFromKTX(
    ktx: LIBKTXModule,
    data: Uint8Array,
    transcode: { transcoderFormat: string; transcodedFormat: COMPRESSED_TEXTURE_FORMATS },
): TextureSourceOptions
{
    const ktxTexture = new ktx.ktxTexture(data);

    try
    {
        let format: COMPRESSED_TEXTURE_FORMATS;

        if (ktxTexture.needsTranscoding)
        {
            format = transcode.transcodedFormat;

            const transcodeFormat = ktx.TranscodeTarget[transcode.transcoderFormat];
            const result = ktxTexture.transcodeBasis(transcodeFormat, 0);

            if (result !== ktx.ErrorCode.SUCCESS)
            {
                throw new Error('Unable to transcode basis texture.');
            }
        }
        else
        {
            format = getTextureFormatFromKTXTexture(ktxTexture);
        }

        const textureOptions = {
            width: ktxTexture.baseWidth,
            height: ktxTexture.baseHeight,
            format: format as TEXTURE_FORMATS,
            mipLevelCount: ktxTexture.numLevels,
            resource: createLevelBuffersFromKTX(ktxTexture),
            alphaMode: 'no-premultiply-alpha',
        } as TextureSourceOptions;

        convertFormatIfRequired(textureOptions);

        return textureOptions;
    }
    finally
    {
        ktxTexture.delete();
    }
}
