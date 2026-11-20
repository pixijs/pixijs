import { createLevelBuffers } from './createLevelBuffers';

import type { TEXTURE_FORMATS } from '../../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { BasisTextureConstructor } from '../types';

/**
 * Reads the bytes of a Basis file into texture options, transcoding every level.
 *
 * The Basis file lives in the transcoder's WebAssembly heap until it is deleted, and nothing deletes it
 * automatically, so it is closed and deleted here once its levels are transcoded, or when transcoding fails.
 * @param BasisFile - The Basis file class of the transcoder module.
 * @param data - The bytes of the Basis file.
 * @param transcode - The Basis transcoder format and the texture format it produces.
 * @param transcode.transcoderFormat - The Basis transcoder format.
 * @param transcode.transcodedFormat - The texture format the transcoder format produces.
 * @internal
 */
export function createTextureOptionsFromBasis(
    BasisFile: BasisTextureConstructor,
    data: Uint8Array,
    transcode: { transcoderFormat: number; transcodedFormat: TEXTURE_FORMATS },
): TextureSourceOptions
{
    const basisTexture = new BasisFile(data);

    try
    {
        const levelBuffers = createLevelBuffers(basisTexture, transcode.transcoderFormat);

        return {
            width: basisTexture.getImageWidth(0, 0),
            height: basisTexture.getImageHeight(0, 0),
            format: transcode.transcodedFormat,
            resource: levelBuffers,
            alphaMode: 'no-premultiply-alpha',
        } as TextureSourceOptions;
    }
    finally
    {
        basisTexture.close();
        basisTexture.delete();
    }
}
