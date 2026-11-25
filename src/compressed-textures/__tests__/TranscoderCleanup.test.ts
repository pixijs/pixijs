import { createTextureOptionsFromBasis } from '../basis/utils/createTextureOptionsFromBasis';
import { createTextureOptionsFromKTX } from '../ktx2/utils/createTextureOptionsFromKTX';

import type { BasisTextureConstructor } from '../basis/types';
import type { LIBKTXModule } from '../ktx2/types';

const SUCCESS = 0;
const TRANSCODE_FAILED = 1;
const TRANSCODER_FORMAT = 'ASTC_4x4_RGBA';

function createFakeKTX(transcodeResult: number)
{
    const ktxTexture = {
        needsTranscoding: true,
        numLevels: 2,
        baseWidth: 8,
        baseHeight: 8,
        glInternalformat: 0,
        vkFormat: 0,
        classId: 2,
        transcodeBasis: jest.fn(() => transcodeResult),
        getImageData: jest.fn((level: number) => new Uint8Array(level === 0 ? 64 : 16)),
        delete: jest.fn(),
    };

    const ktx = {
        ErrorCode: { SUCCESS },
        TranscodeTarget: { [TRANSCODER_FORMAT]: 10 },
        ktxTexture: jest.fn(() => ktxTexture),
    } as unknown as LIBKTXModule;

    return { ktx, ktxTexture };
}

function createFakeBasis(transcodeSucceeds: boolean)
{
    const basisFile = {
        getNumImages: jest.fn(() => 1),
        getNumLevels: jest.fn(() => 1),
        startTranscoding: jest.fn(() => true),
        getImageWidth: jest.fn(() => 8),
        getImageHeight: jest.fn(() => 8),
        getImageTranscodedSizeInBytes: jest.fn(() => 64),
        transcodeImage: jest.fn(() => transcodeSucceeds),
        close: jest.fn(),
        delete: jest.fn(),
    };

    const BasisFile = jest.fn(() => basisFile) as unknown as BasisTextureConstructor;

    return { BasisFile, basisFile };
}

describe('Transcoder cleanup', () =>
{
    it('should delete the KTX2 texture from the transcoder heap once its levels are read', () =>
    {
        const { ktx, ktxTexture } = createFakeKTX(SUCCESS);

        const options = createTextureOptionsFromKTX(ktx, new Uint8Array(4), {
            transcoderFormat: TRANSCODER_FORMAT,
            transcodedFormat: 'astc-4x4-unorm',
        });

        expect(options.width).toBe(8);
        expect((options.resource as Uint8Array[]).length).toBe(2);
        expect(ktxTexture.delete).toHaveBeenCalledTimes(1);
    });

    it('should delete the KTX2 texture from the transcoder heap when transcoding fails', () =>
    {
        const { ktx, ktxTexture } = createFakeKTX(TRANSCODE_FAILED);

        expect(() => createTextureOptionsFromKTX(ktx, new Uint8Array(4), {
            transcoderFormat: TRANSCODER_FORMAT,
            transcodedFormat: 'astc-4x4-unorm',
        })).toThrow('Unable to transcode basis texture.');

        expect(ktxTexture.delete).toHaveBeenCalledTimes(1);
    });

    it('should close and delete the Basis file once its levels are transcoded', () =>
    {
        const { BasisFile, basisFile } = createFakeBasis(true);

        const options = createTextureOptionsFromBasis(BasisFile, new Uint8Array(4), {
            transcoderFormat: 10,
            transcodedFormat: 'astc-4x4-unorm',
        });

        expect(options.width).toBe(8);
        expect(basisFile.close).toHaveBeenCalledTimes(1);
        expect(basisFile.delete).toHaveBeenCalledTimes(1);
    });

    it('should close and delete the Basis file when transcoding fails', () =>
    {
        const { BasisFile, basisFile } = createFakeBasis(false);

        expect(() => createTextureOptionsFromBasis(BasisFile, new Uint8Array(4), {
            transcoderFormat: 10,
            transcodedFormat: 'astc-4x4-unorm',
        })).toThrow('transcodeImage failed');

        expect(basisFile.close).toHaveBeenCalledTimes(1);
        expect(basisFile.delete).toHaveBeenCalledTimes(1);
    });
});
