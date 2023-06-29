import { settings } from '../../../../../settings/settings';
import { WebGPURenderer } from '../../WebGPURenderer';

import type { ICanvas } from '../../../../../settings/adapter/ICanvas';
import type { WebGLRenderer } from '../../../gl/WebGLRenderer';
import type { Texture } from '../../../shared/texture/Texture';
import type { Renderer } from '../../../types';

export function textureToCanvas(texture: Texture, renderer: WebGPURenderer): ICanvas
{
    // renderer.renderTarget.finish();

    renderer.encoder.finishRenderPass();

    // // create a canvas with webGPU context
    const commandEncoder = renderer.encoder.commandEncoder;

    // create canvas
    const canvas = settings.ADAPTER.createCanvas();

    canvas.width = texture.source.pixelWidth;
    canvas.height = texture.source.pixelHeight;

    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;

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

    renderer.encoder.restoreRenderPass();

    return canvas;
}

function arrayPostDivide(
    pixels: number[] | Uint8Array | Uint8ClampedArray, out: number[] | Uint8Array | Uint8ClampedArray
): void
{
    for (let i = 0; i < pixels.length; i += 4)
    {
        const alpha = out[i + 3] = pixels[i + 3];

        if (alpha !== 0)
        {
            out[i] = Math.round(Math.min(pixels[i] * 255.0 / alpha, 255.0));
            out[i + 1] = Math.round(Math.min(pixels[i + 1] * 255.0 / alpha, 255.0));
            out[i + 2] = Math.round(Math.min(pixels[i + 2] * 255.0 / alpha, 255.0));
        }
        else
        {
            out[i] = pixels[i];
            out[i + 1] = pixels[i + 1];
            out[i + 2] = pixels[i + 2];
        }
    }
}

export function textureToCanvasWebGL(texture: Texture, renderer: WebGLRenderer): ICanvas
{
    const currentRenderTarget = renderer.renderTarget.renderTarget;

    renderer.renderTarget.bind(texture, false);

    const width = Math.round(texture.source.pixelWidth);
    const height = Math.round(texture.source.pixelHeight);

    const pixels = new Uint8Array(4 * width * height);

    // create canvas
    const canvas = settings.ADAPTER.createCanvas();

    canvas.width = width;
    canvas.height = height;

    const gl = renderer.gl;

    gl.readPixels(
        Math.round(texture.frameX),
        Math.round(texture.frameY),
        width,
        height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels
    );

    const context = canvas.getContext('2d');

    const canvasData = context.getImageData(0, 0, width, height);

    arrayPostDivide(pixels, canvasData.data);

    context.putImageData(canvasData, 0, 0);

    // flip the canvas..
    const canvas2 = settings.ADAPTER.createCanvas();

    canvas2.width = width;
    canvas2.height = height;

    const context2 = canvas2.getContext('2d');

    context2.scale(1, -1);

    // We can't render to itself because we should be empty before render.
    context2.drawImage(canvas, 0, -height);

    renderer.renderTarget.bind(currentRenderTarget, false);

    return canvas2;
}

export async function logDebugTexture(texture: Texture, renderer: Renderer, size = 200)
{
    let canvas: ICanvas;

    if (renderer instanceof WebGPURenderer)
    {
        canvas = textureToCanvas(texture, renderer);
    }
    else
    {
        canvas = textureToCanvasWebGL(texture, renderer);
    }

    await renderer.encoder.commandFinished;

    const base64 = canvas.toDataURL();

    const width = size;

    // eslint-disable-next-line no-console
    console.log(`logging texture ${texture.source.width}px ${texture.source.height}px`);

    const style = [
        'font-size: 1px;',
        `padding: ${width}px ${300}px;`,
        `background: url(${base64}) no-repeat;`,
        'background-size: contain;',
    ].join(' ');

    // eslint-disable-next-line no-console
    console.log('%c ', style);
}
