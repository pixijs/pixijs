import { Color, type ColorSource } from '../../../../color/Color';
import { ExtensionType } from '../../../../extensions/Extensions';
import { Matrix } from '../../../../maths/Matrix';
import { CLEAR } from '../../gl/const';
import { isRenderingToScreen } from '../../shared/renderTarget/isRenderingToScreen';
import { RenderTarget } from '../../shared/renderTarget/RenderTarget';
import { SystemRunner } from '../../shared/system/SystemRunner';
import { TextureSource } from '../../shared/texture/sources/TextureSource';
import { Texture } from '../../shared/texture/Texture';
import { getCanvasTexture } from '../../shared/texture/utils/getCanvasTexture';
import { GpuRenderTarget } from './GpuRenderTarget';

import type { ICanvas } from '../../../../settings/adapter/ICanvas';
import type { CLEAR_OR_BOOL } from '../../gl/const';
import type { System } from '../../shared/system/System';
import type { BindableTexture } from '../../shared/texture/Texture';
import type { GPU } from '../GpuDeviceSystem';
import type { WebGPURenderer } from '../WebGPURenderer';

export type RenderSurface = ICanvas | BindableTexture | RenderTarget;
export type RGBAArray = [number, number, number, number];

export class GpuRenderTargetSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGPUSystem],
        name: 'renderTarget',
    } as const;

    public rootRenderTarget: RenderTarget;
    public renderingToScreen: boolean;
    public rootProjectionMatrix = new Matrix();
    public renderTarget: RenderTarget;
    public onRenderTargetChange = new SystemRunner('onRenderTargetChange');

    private readonly _renderSurfaceToRenderTargetHash: Map<RenderSurface, RenderTarget>
        = new Map();
    private _gpuRenderTargetHash: Record<number, GpuRenderTarget> = Object.create(null);

    private readonly _renderTargetStack: RenderTarget[] = [];
    private readonly _renderer: WebGPURenderer;
    private readonly _defaultClearColor: RGBAArray = [0, 0, 0, 0];

    private _gpu: GPU;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    public renderStart({
        target,
        clear,
        clearColor,
    }: {
        target: RenderSurface;
        clear: CLEAR_OR_BOOL;
        clearColor: ColorSource;
    }): void
    {
        // generate a render pass description..
        // create an encoder..

        this.rootRenderTarget = this.getRenderTarget(target);
        this.rootProjectionMatrix = this.rootRenderTarget.projectionMatrix;

        this.renderingToScreen = isRenderingToScreen(this.rootRenderTarget);

        this._renderTargetStack.length = 0;

        this._renderer.encoder.start();

        this.push(
            this.rootRenderTarget,
            clear,
            clearColor ?? this._renderer.background.colorRgba
        );
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
    }

    public bind(
        renderSurface: RenderSurface,
        clear: CLEAR_OR_BOOL = true,
        clearColor?: ColorSource
    ): RenderTarget
    {
        const renderTarget = this.getRenderTarget(renderSurface);

        const didChange = this.renderTarget !== renderTarget;

        this.renderTarget = renderTarget;

        this._startRenderPass(clear, clearColor);

        if (didChange)
        {
            this.onRenderTargetChange.emit(renderTarget);
        }

        return renderTarget;
    }

    /**
     * returns the gpu texture for the first color texture in the render target
     * mainly used by the filter manager to get copy the texture for blending
     * @param renderTarget
     * @returns a gpu texture
     */
    private _getGpuColorTexture(renderTarget: RenderTarget): GPUTexture
    {
        const gpuRenderTarget = this._getGpuRenderTarget(renderTarget);

        if (gpuRenderTarget.contexts[0])
        {
            return gpuRenderTarget.contexts[0].getCurrentTexture();
        }

        return this._renderer.texture.getGpuSource(
            renderTarget.colorTextures[0].source
        );
    }

    public getDescriptor(
        renderTarget: RenderTarget,
        clear: CLEAR_OR_BOOL,
        clearValue: ColorSource
    ): GPURenderPassDescriptor
    {
        if (typeof clear === 'boolean')
        {
            clear = clear ? CLEAR.ALL : CLEAR.NONE;
        }

        const gpuRenderTarget = this._getGpuRenderTarget(renderTarget);

        const colorAttachments = renderTarget.colorTextures.map(
            (texture, i) =>
            {
                const context = gpuRenderTarget.contexts[i];

                let view: GPUTextureView;
                let resolveTarget: GPUTextureView;

                if (context)
                {
                    const currentTexture = context.getCurrentTexture();

                    const canvasTextureView = currentTexture.createView();

                    view = canvasTextureView;
                }
                else
                {
                    view = this._renderer.texture.getTextureView(texture);
                }

                if (gpuRenderTarget.msaaTextures[i])
                {
                    resolveTarget = view;
                    view = this._renderer.texture.getTextureView(
                        gpuRenderTarget.msaaTextures[i]
                    );
                }

                const loadOp = ((clear as CLEAR) & CLEAR.COLOR ? 'clear' : 'load') as GPULoadOp;

                if (clearValue)
                {
                    const isRGBAArray = Array.isArray(clearValue) && clearValue.length === 4;

                    clearValue = isRGBAArray ? clearValue : Color.shared.setValue(clearValue).toRgbAArray();
                }
                else
                {
                    clearValue = this._defaultClearColor;
                }

                return {
                    view, // assign each frame based on the swap chain!
                    resolveTarget,
                    clearValue,
                    storeOp: 'store',
                    loadOp
                };
            }
        ) as GPURenderPassColorAttachment[];

        let depthStencilAttachment;

        if (renderTarget.depthTexture)
        {
            const stencilLoadOp = (clear & CLEAR.STENCIL ? 'clear' : 'load') as GPULoadOp;

            depthStencilAttachment = {
                view: this._renderer.texture
                    .getGpuSource(renderTarget.depthTexture.source)
                    .createView(),
                stencilStoreOp: 'store' as GPUStoreOp,
                stencilLoadOp,
            };
        }

        const descriptor: GPURenderPassDescriptor = {
            colorAttachments,
            depthStencilAttachment,
        };

        return descriptor;
    }

    public clear(
        clear: CLEAR_OR_BOOL = CLEAR.ALL,
        clearColor?: ColorSource
    )
    {
        if (!clear) return;

        this._startRenderPass(
            clear,
            clearColor
        );
    }

    public push(renderSurface: RenderSurface, clear: CLEAR | boolean = CLEAR.ALL, clearColor?: ColorSource)
    {
        const renderTarget = this.bind(renderSurface, clear, clearColor);

        this._renderTargetStack.push(renderTarget);

        return renderTarget;
    }

    public pop()
    {
        this._renderTargetStack.pop();

        this.bind(
            this._renderTargetStack[this._renderTargetStack.length - 1],
            false
        );
    }

    public getRenderTarget(renderSurface: RenderSurface): RenderTarget
    {
        return (
            this._renderSurfaceToRenderTargetHash.get(renderSurface)
            ?? this._initRenderTarget(renderSurface)
        );
    }

    public copyToTexture(
        sourceRenderSurfaceTexture: RenderTarget,
        destinationTexture: Texture,
        origin: { x: number; y: number },
        size: { width: number; height: number }
    )
    {
        const renderer = this._renderer;

        const baseGpuTexture = renderer.renderTarget._getGpuColorTexture(
            sourceRenderSurfaceTexture
        );
        const backGpuTexture = renderer.texture.getGpuSource(
            destinationTexture.source
        );

        renderer.encoder.commandEncoder.copyTextureToTexture(
            {
                texture: baseGpuTexture,
                origin,
            },
            {
                texture: backGpuTexture,
            },
            size
        );

        return destinationTexture;
    }

    public restart()
    {
        this.bind(this.rootRenderTarget, CLEAR.NONE);
    }

    public destroy()
    {
        // boom
    }

    private _startRenderPass(
        clear: CLEAR_OR_BOOL = true,
        clearColor?: ColorSource
    )
    {
        const renderTarget = this.renderTarget;

        const gpuRenderTarget = this._getGpuRenderTarget(renderTarget);

        if (
            renderTarget.width !== gpuRenderTarget.width
            || renderTarget.height !== gpuRenderTarget.height
        )
        {
            this._resizeGpuRenderTarget(renderTarget);
        }

        const descriptor = this.getDescriptor(renderTarget, clear, clearColor);

        gpuRenderTarget.descriptor = descriptor;

        // TODO we should not finish a render pass each time we bind
        // for example filters - we would want to push / pop render targets
        this._renderer.encoder.beginRenderPass(renderTarget, gpuRenderTarget);
        this._renderer.pipeline.setMultisampleCount(gpuRenderTarget.msaaSamples);
    }

    private _initRenderTarget(renderSurface: RenderSurface): RenderTarget
    {
        let renderTarget = null;

        if (renderSurface instanceof HTMLCanvasElement)
        {
            renderSurface = getCanvasTexture(renderSurface as ICanvas);
        }

        if (renderSurface instanceof RenderTarget)
        {
            renderTarget = renderSurface;
        }
        else if (renderSurface instanceof Texture)
        {
            renderTarget = new RenderTarget({
                colorTextures: [renderSurface],
                depthTexture: renderSurface.source.depthStencil,
            });
        }

        renderTarget.isRoot = true;

        this._renderSurfaceToRenderTargetHash.set(renderSurface, renderTarget);

        return renderTarget;
    }

    private _getGpuRenderTarget(renderTarget: RenderTarget)
    {
        return (
            this._gpuRenderTargetHash[renderTarget.uid]
            || this._initGpuRenderTarget(renderTarget)
        );
    }

    private _initGpuRenderTarget(renderTarget: RenderTarget): GpuRenderTarget
    {
        // always false for WebGPU
        renderTarget.isRoot = true;

        const gpuRenderTarget = new GpuRenderTarget();

        // create a context...
        // is a canvas...

        renderTarget.colorTextures.forEach((colorTexture, i) =>
        {
            if (colorTexture.source.resource instanceof HTMLCanvasElement)
            {
                const context
                    = renderTarget.colorTexture.source.resource.getContext(
                        'webgpu'
                    ) as unknown as GPUCanvasContext;

                try
                {
                    context.configure({
                        device: this._gpu.device,
                        // eslint-disable-next-line max-len
                        usage:
                            GPUTextureUsage.TEXTURE_BINDING
                            | GPUTextureUsage.COPY_DST
                            | GPUTextureUsage.RENDER_ATTACHMENT
                            | GPUTextureUsage.COPY_SRC,
                        format: 'bgra8unorm',
                        alphaMode: 'opaque',
                    });
                }
                catch (e)
                {
                    console.error(e);
                }

                gpuRenderTarget.contexts[i] = context;
            }

            gpuRenderTarget.msaa = colorTexture.source.antialias;

            if (colorTexture.source.antialias)
            {
                const msaaTexture = new TextureSource({
                    width: 0,
                    height: 0,
                    sampleCount: 4,
                });

                gpuRenderTarget.msaaTextures[i] = msaaTexture;
            }
        });

        if (gpuRenderTarget.msaa)
        {
            gpuRenderTarget.msaaSamples = 4;

            if (renderTarget.depthTexture)
            {
                renderTarget.depthTexture.source.sampleCount = 4;
            }
        }

        this._gpuRenderTargetHash[renderTarget.uid] = gpuRenderTarget;

        return gpuRenderTarget;
    }

    private _resizeGpuRenderTarget(renderTarget: RenderTarget)
    {
        const gpuRenderTarget = this._getGpuRenderTarget(renderTarget);

        gpuRenderTarget.width = renderTarget.width;
        gpuRenderTarget.height = renderTarget.height;

        if (gpuRenderTarget.msaa)
        {
            renderTarget.colorTextures.forEach((colorTexture, i) =>
            {
                const msaaTexture = gpuRenderTarget.msaaTextures[i];

                msaaTexture?.resize(
                    colorTexture.source.width,
                    colorTexture.source.height,
                    colorTexture.source._resolution
                );
            });
        }
    }
}
