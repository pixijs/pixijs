import { DOMAdapter } from '../../../../../environment/adapter';
import { warn } from '../../../../../utils/logging/warn';

import type { TextureSource } from '../../../shared/texture/sources/TextureSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

/** @internal */
export const gpuUploadImageResource = {

    type: 'image',

    upload(source: TextureSource, gpuTexture: GPUTexture, gpu: GPU, originZOverride = 0)
    {
        const resource = source.resource as ImageBitmap | HTMLCanvasElement | OffscreenCanvas | HTMLImageElement;

        if (!resource) return;

        // WebGPU does not support HTMLImageElement
        // so we need to convert it to a canvas
        if (globalThis.HTMLImageElement && resource instanceof HTMLImageElement)
        {
            const canvas = DOMAdapter.get().createCanvas(resource.width, resource.height);
            const context = canvas.getContext('2d');

            context.drawImage(resource, 0, 0, resource.width, resource.height);

            // replace with the canvas - for future uploads
            source.resource = canvas;

            // #if _DEBUG
            warn('ImageSource: Image element passed, converting to canvas and replacing resource.');
            // #endif
        }

        const width = Math.min(gpuTexture.width, source.resourceWidth || source.pixelWidth);
        const height = Math.min(gpuTexture.height, source.resourceHeight || source.pixelHeight);

        const premultipliedAlpha = source.alphaMode === 'premultiply-alpha-on-upload';

        gpu.device.queue.copyExternalImageToTexture(
            { source: resource },
            { texture: gpuTexture, origin: { x: 0, y: 0, z: originZOverride }, premultipliedAlpha },
            {
                width,
                height,
            }
        );
    }
} as GpuTextureUploader<TextureSource>;

