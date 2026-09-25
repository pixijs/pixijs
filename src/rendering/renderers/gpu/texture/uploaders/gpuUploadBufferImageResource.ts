import { Rectangle } from '../../../../../maths/shapes/Rectangle';
import { getTexelRangeRects } from '../../../shared/texture/utils/getTexelRangeRects';

import type { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

const tempRects = [new Rectangle(), new Rectangle(), new Rectangle()];

/** @internal */
export const gpuUploadBufferImageResource = {

    type: 'image',

    upload(source: BufferImageSource, gpuTexture: GPUTexture, gpu: GPU, originZOverride = 0)
    {
        const resource = source.resource;

        const width = source.pixelWidth | 0;
        const height = source.pixelHeight | 0;

        const bytesPerPixel = resource.byteLength / (width * height);

        const count = getTexelRangeRects(source._updateStart, source._updateEnd, width, height, tempRects);

        for (let i = 0; i < count; i++)
        {
            const rect = tempRects[i];

            gpu.device.queue.writeTexture(
                { texture: gpuTexture, origin: { x: rect.x, y: rect.y, z: originZOverride } },
                resource as ArrayBuffer,
                {
                    offset: ((rect.y * width) + rect.x) * bytesPerPixel,
                    rowsPerImage: rect.height,
                    bytesPerRow: width * bytesPerPixel,
                },
                {
                    width: rect.width,
                    height: rect.height,
                    depthOrArrayLayers: 1,
                }
            );
        }
    }
} as GpuTextureUploader<BufferImageSource>;
