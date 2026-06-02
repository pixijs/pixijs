import { ExtensionType } from '../extensions/Extensions';

import type { GPU } from '../rendering/renderers/gpu/GpuDeviceSystem';
import type { GpuTextureUploader } from '../rendering/renderers/gpu/texture/uploaders/GpuTextureUploader';
import type { HTMLSourceResource, HTMLUploadableSource } from './HTMLSourceTypes';

interface GpuCopyElementImageQueue extends GPUQueue
{
    copyElementImageToTexture?: (
        source: HTMLSourceResource,
        width: number,
        height: number,
        destination: GPUImageCopyTextureTagged,
    ) => void;
}

/** @internal */
export const gpuUploadHTMLResource: GpuTextureUploader<HTMLUploadableSource> & {
    extension: { type: ExtensionType; name: string };
} = {

    extension: {
        type: ExtensionType.TextureUploaderWebGPU,
        name: 'html',
    },

    type: 'html',

    upload(source: HTMLUploadableSource, gpuTexture: GPUTexture, gpu: GPU, originZOverride = 0)
    {
        const queue = gpu.device.queue as GpuCopyElementImageQueue;
        const copyElementImageToTexture = queue.copyElementImageToTexture;

        if (!copyElementImageToTexture)
        {
            throw new Error(
                // eslint-disable-next-line max-len
                '[HTMLSource] GPUQueue.copyElementImageToTexture is not available. Enable the browser HTML-in-Canvas API before using HTMLSource.',
            );
        }

        if (!source.isReady)
        {
            // Unlike WebGL, the GPUTexture is pre-allocated by GpuTextureSystem, so there is no
            // placeholder storage to create here before the first paint — just request it.
            source.requestPaint?.();

            return;
        }

        const premultipliedAlpha = source.alphaMode === 'premultiply-alpha-on-upload';

        const destination: GPUImageCopyTextureTagged = {
            texture: gpuTexture,
            origin: { x: 0, y: 0, z: originZOverride },
            premultipliedAlpha,
        };

        const width = Math.min(gpuTexture.width, source.pixelWidth);
        const height = Math.min(gpuTexture.height, source.pixelHeight);

        copyElementImageToTexture.call(queue, source.resource, width, height, destination);
    },
};
