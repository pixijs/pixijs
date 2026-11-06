import { readFileSync } from 'fs';
import path from 'path';
import { ModuleKind, transpileModule } from 'typescript';
import { runInNewContext } from 'vm';
import { convertFormatIfRequired } from '../ktx2/utils/convertFormatIfRequired';
import { createLevelBuffersFromKTX } from '../ktx2/utils/createLevelBuffersFromKTX';
import { getTextureFormatFromKTXTexture } from '../ktx2/utils/getTextureFormatFromKTXTexture';
import { gpuFormatToKTXBasisTranscoderFormat } from '../ktx2/utils/gpuFormatToKTXBasisTranscoderFormat';

import type { KTXTexture } from '../ktx2/types';
import type { TextureSourceOptions } from '~/rendering';

// Run the worker entry point in an isolated scope without replacing the window's message handler.
const workerCode = transpileModule(
    readFileSync(path.join(__dirname, '../ktx2/worker/ktx.worker.ts'), 'utf8'),
    { compilerOptions: { module: ModuleKind.CommonJS } }
).outputText;

const workerImports = {
    '../utils/convertFormatIfRequired': { convertFormatIfRequired },
    '../utils/createLevelBuffersFromKTX': { createLevelBuffersFromKTX },
    '../utils/getTextureFormatFromKTXTexture': { getTextureFormatFromKTXTexture },
    '../utils/gpuFormatToKTXBasisTranscoderFormat': { gpuFormatToKTXBasisTranscoderFormat },
};

describe('KTX2 worker texture disposal', () =>
{
    let imageData: Uint8Array;
    let texture: jest.Mocked<KTXTexture>;
    let postMessage: jest.Mock;
    let fetchTexture: jest.Mock;
    let workerScope: {
        onmessage: (event: { data: unknown }) => Promise<void>;
        postMessage: jest.Mock;
    };

    beforeEach(async () =>
    {
        imageData = new Uint8Array([1, 2, 3, 4]);
        texture = {
            baseWidth: 1,
            baseHeight: 1,
            numLevels: 2,
            classId: 2,
            vkFormat: 37,
            glInternalformat: 0,
            needsTranscoding: false,
            getImageData: jest.fn().mockImplementation(() => imageData),
            transcodeBasis: jest.fn().mockReturnValue(0),
            delete: jest.fn().mockImplementation(() => imageData.fill(0)),
        };
        postMessage = jest.fn();
        fetchTexture = jest.fn().mockResolvedValue({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(1),
        });
        workerScope = { onmessage: undefined, postMessage };

        runInNewContext(workerCode, {
            exports: {},
            require: (id: keyof typeof workerImports) => workerImports[id],
            self: workerScope,
            URL,
            Uint8Array,
            location: { origin: 'https://example.com' },
            fetch: fetchTexture,
            importScripts: jest.fn(),
            LIBKTX: () => Promise.resolve({
                ktxTexture: jest.fn(() => texture),
                ErrorCode: { SUCCESS: 0 },
                TranscodeTarget: { BC7_RGBA: 6 },
            }),
        });

        await workerScope.onmessage({
            data: {
                type: 'init',
                jsUrl: '/libktx.js',
                wasmUrl: '/libktx.wasm',
                supportedTextures: ['bc7-rgba-unorm'],
            }
        });
    });

    async function load()
    {
        await workerScope.onmessage({ data: { type: 'load', url: '/texture.ktx2' } });
    }

    it.each([false, true])('releases the texture after a successful load (transcoding: %s)', async (needsTranscoding) =>
    {
        texture.needsTranscoding = needsTranscoding;

        await load();

        expect(texture.delete).toHaveBeenCalledTimes(1);
        expect(imageData).toEqual(new Uint8Array(4));
        expect(postMessage).toHaveBeenCalledTimes(1);

        const [message, transferables] = postMessage.mock.calls[0];
        const options = message.textureOptions as TextureSourceOptions<Uint8Array[]>;

        expect(message.success).toBe(true);
        expect(options.width).toBe(1);
        expect(options.height).toBe(1);
        expect(options.mipLevelCount).toBe(2);
        expect(options.format).toBe(needsTranscoding ? 'bc7-rgba-unorm' : 'rgba8unorm');
        expect(options.alphaMode).toBe('no-premultiply-alpha');
        expect(options.resource).toEqual([new Uint8Array([1, 2, 3, 4]), new Uint8Array([1, 2, 3, 4])]);
        expect(transferables).toEqual(options.resource.map((level) => level.buffer));
        expect(texture.delete.mock.invocationCallOrder[0]).toBeLessThan(postMessage.mock.invocationCallOrder[0]);
    });

    it('releases the texture when transcoding fails', async () =>
    {
        texture.needsTranscoding = true;
        texture.transcodeBasis.mockReturnValue(1);

        await load();

        expect(texture.delete).toHaveBeenCalledTimes(1);
        expect(postMessage).toHaveBeenCalledTimes(1);
        expect(postMessage.mock.calls[0][0].type).toBe('error');
        expect(postMessage.mock.calls[0][0].err.message).toBe('Unable to transcode basis texture.');
    });

    it('releases the texture when its format is unsupported', async () =>
    {
        texture.vkFormat = -1;

        await load();

        expect(texture.delete).toHaveBeenCalledTimes(1);
        expect(postMessage.mock.calls[0][0].err.message).toBe('Unsupported VkFormat: -1');
    });

    it('releases the texture when reading a later mip level fails', async () =>
    {
        texture.getImageData.mockImplementationOnce(() => imageData).mockImplementationOnce(() =>
        {
            throw new Error('Invalid mip level');
        });

        await load();

        expect(texture.delete).toHaveBeenCalledTimes(1);
        expect(postMessage.mock.calls[0][0].err.message).toBe('Invalid mip level');
    });

    it('preserves RGB to RGBA conversion before releasing the texture', async () =>
    {
        texture.vkFormat = 23;
        imageData = new Uint8Array([1, 2, 3]);

        await load();

        expect(texture.delete).toHaveBeenCalledTimes(1);
        expect(postMessage.mock.calls[0][0].textureOptions.format).toBe('rgba8unorm');
        expect(postMessage.mock.calls[0][0].textureOptions.resource[0]).toEqual(new Uint8Array([1, 2, 3, 255]));
    });

    it('reports a failed fetch without trying to dispose a texture that was not created', async () =>
    {
        fetchTexture.mockResolvedValue({ ok: false });

        await load();

        expect(texture.delete).not.toHaveBeenCalled();
        expect(postMessage.mock.calls[0][0].err.message).toBe('Failed to load KTX(2) texture: /texture.ktx2');
    });
});
