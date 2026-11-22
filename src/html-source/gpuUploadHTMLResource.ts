import { ExtensionType } from '../extensions/Extensions';

import type { GPU } from '../rendering/renderers/gpu/GpuDeviceSystem';
import type { GpuTextureUploader } from '../rendering/renderers/gpu/texture/uploaders/GpuTextureUploader';
import type { HTMLSourceResource, HTMLUploadableSource } from './HTMLSourceTypes';

interface GPUCopyElementImageSource
{
    source: HTMLSourceResource;
}

// Chromium 155+ renamed the upload and folded the size into the destination.
// See https://developer.chrome.com/blog/html-in-canvas-ot-changes.
interface GPUDrawElementImageDestination extends GPUCopyExternalImageDestInfo
{
    size: GPUExtent3D;
}

type DrawElementImageToTexture = (
    source: GPUCopyElementImageSource,
    destination: GPUDrawElementImageDestination,
) => void;

// Chromium 150-154 collapsed the upload signature into source/destination dictionaries.
// See https://github.com/WICG/html-in-canvas/pull/128/changes and
// https://github.com/gpuweb/gpuweb/pull/6250.
interface GPUCopyElementImageDestination
{
    destination: GPUCopyExternalImageDestInfo;
    width?: number;
    height?: number;
}

type CopyElementImageModern = (
    source: GPUCopyElementImageSource,
    destination: GPUCopyElementImageDestination,
) => void;

// Pre-Chromium 150 signature, kept for backwards compatibility.
type CopyElementImageLegacy = (
    source: HTMLSourceResource,
    width: number,
    height: number,
    destination: GPUCopyExternalImageDestInfo,
) => void;

interface GpuCopyElementImageQueue extends GPUQueue
{
    drawElementImageToTexture?: DrawElementImageToTexture;
    copyElementImageToTexture?: CopyElementImageModern | CopyElementImageLegacy;
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
        const { drawElementImageToTexture, copyElementImageToTexture } = queue;

        if (!drawElementImageToTexture && !copyElementImageToTexture)
        {
            throw new Error(
                // eslint-disable-next-line max-len
                '[HTMLSource] GPUQueue.drawElementImageToTexture is not available. Enable the browser HTML-in-Canvas API before using HTMLSource.',
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

        const destination: GPUCopyExternalImageDestInfo = {
            texture: gpuTexture,
            origin: { x: 0, y: 0, z: originZOverride },
            premultipliedAlpha,
        };

        const width = Math.min(gpuTexture.width, source.pixelWidth);
        const height = Math.min(gpuTexture.height, source.pixelHeight);

        if (drawElementImageToTexture)
        {
            drawElementImageToTexture.call(
                queue,
                { source: source.resource },
                { ...destination, size: { width, height } },
            );
        }
        // Detect the Chromium 150-154 two-argument form by its arity; older builds still expect
        // the (source, width, height, destination) signature.
        else if (copyElementImageToTexture.length === 2)
        {
            (copyElementImageToTexture as CopyElementImageModern).call(
                queue,
                { source: source.resource },
                { destination, width, height },
            );
        }
        else
        {
            (copyElementImageToTexture as CopyElementImageLegacy).call(
                queue,
                source.resource,
                width,
                height,
                destination,
            );
        }
    },
};
