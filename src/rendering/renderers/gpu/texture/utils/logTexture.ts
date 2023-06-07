import { settings } from '../../../../../settings/settings';

import type { ICanvas } from '../../../../../settings/adapter/ICanvas';
import type { Texture } from '../../../shared/texture/Texture';
import type { WebGPURenderer } from '../../WebGPURenderer';

// TODO this is very close code to logDebugTexture.. when adding extract, lets look into that!
// useful for extracting data from a texture..
// MAT: DO NOT USE THIS WHILST RENDERING! - weird things will happen..
// use `logDebugTexture` instead
export function logTexture(texture: Texture, renderer: WebGPURenderer): ICanvas
{
    // // create a canvas with webGPU context
    const commandEncoder = renderer.gpu.device.createCommandEncoder();// renderer.renderTarget.commandEncoder;

    // create canvas
    const canvas = settings.ADAPTER.createCanvas();

    canvas.width = texture.source.pixelWidth;
    canvas.height = texture.source.pixelHeight;

    const context = canvas.getContext('webgpu') as any as GPUCanvasContext;

    context.configure({
        device: renderer.gpu.device,
        // eslint-disable-next-line max-len
        usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC,
        format: 'bgra8unorm',
        alphaMode: 'opaque',
    });

    commandEncoder.copyTextureToTexture({
        texture: renderer.texture.getGpuSource(texture.source),
        origin: {
            x: 0,
            y: 0,
        },
    }, {
        texture: context.getCurrentTexture(),
    }, {
        width: canvas.width,
        height: canvas.height,
    });

    renderer.gpu.device.queue.submit([commandEncoder.finish()]);

    return canvas;
}
