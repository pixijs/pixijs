import type { HTMLSourceResource, HTMLUploadableSource } from '../../../shared/texture/sources/HTMLSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

interface GpuCopyElementImageQueue extends GPUQueue
{
    copyElementImageToTexture?: (
        source: HTMLSourceResource,
        widthOrDestination: number | GPUImageCopyTextureTagged,
        heightOrUnused?: number,
        destination?: GPUImageCopyTextureTagged,
    ) => void;
}

/** @internal */
export const gpuUploadHTMLResource = {

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
            source.requestPaint?.();

            return;
        }

        const premultipliedAlpha = source.alphaMode === 'premultiply-alpha-on-upload';

        const destination: GPUImageCopyTextureTagged = {
            texture: gpuTexture,
            origin: { x: 0, y: 0, z: originZOverride },
            premultipliedAlpha,
        };

        const resourceWidth = source.resourceWidth;
        const resourceHeight = source.resourceHeight;
        const width = Math.min(gpuTexture.width, source.pixelWidth);
        const height = Math.min(gpuTexture.height, source.pixelHeight);

        const sameSize = resourceWidth === width && resourceHeight === height;

        if (sameSize)
        {
            copyElementImageToTexture.call(queue, source.resource, destination);
        }
        else
        {
            copyElementImageToTexture.call(queue, source.resource, width, height, destination);
        }
    },
} as GpuTextureUploader<HTMLUploadableSource>;
