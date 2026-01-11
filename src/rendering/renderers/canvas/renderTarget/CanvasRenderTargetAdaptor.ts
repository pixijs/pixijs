import { Color } from '../../../../color/Color';
import { DOMAdapter } from '../../../../environment/adapter';
import { CanvasSource } from '../../shared/texture/sources/CanvasSource';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { ICanvasRenderingContext2D } from '../../../../environment/canvas/ICanvasRenderingContext2D';
import type { Rectangle } from '../../../../maths/shapes/Rectangle';
import type { CLEAR_OR_BOOL } from '../../gl/const';
import type { RenderTarget } from '../../shared/renderTarget/RenderTarget';
import type { RenderTargetAdaptor, RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { Texture } from '../../shared/texture/Texture';
import type { CanvasRenderer } from '../CanvasRenderer';

/**
 * Canvas render target backing store.
 * @internal
 */
export type CanvasRenderTarget = {
    /** Backing canvas element. */
    canvas: ICanvas;
    /** 2D context associated with the canvas. */
    context: ICanvasRenderingContext2D;
    /** Pixel width. */
    width: number;
    /** Pixel height. */
    height: number;
};

/**
 * Canvas adaptor for render targets.
 * @category rendering
 * @advanced
 */
export class CanvasRenderTargetAdaptor implements RenderTargetAdaptor<CanvasRenderTarget>
{
    private _renderer: CanvasRenderer;
    private _renderTargetSystem: RenderTargetSystem<CanvasRenderTarget>;

    /**
     * Initializes the adaptor.
     * @param renderer - Canvas renderer instance.
     * @param renderTargetSystem - The render target system.
     * @advanced
     */
    public init(renderer: CanvasRenderer, renderTargetSystem: RenderTargetSystem<CanvasRenderTarget>): void
    {
        this._renderer = renderer;
        this._renderTargetSystem = renderTargetSystem;
    }

    /**
     * Creates a GPU render target for canvas.
     * @param renderTarget - Render target to initialize.
     * @advanced
     */
    public initGpuRenderTarget(renderTarget: RenderTarget): CanvasRenderTarget
    {
        const colorTexture = renderTarget.colorTexture;
        const { canvas, context } = this._ensureCanvas(colorTexture);

        return {
            canvas,
            context,
            width: canvas.width,
            height: canvas.height,
        };
    }

    /**
     * Resizes the backing canvas for a render target.
     * @param renderTarget - Render target to resize.
     * @advanced
     */
    public resizeGpuRenderTarget(renderTarget: RenderTarget): void
    {
        const colorTexture = renderTarget.colorTexture;
        const { canvas } = this._ensureCanvas(colorTexture);

        canvas.width = renderTarget.pixelWidth;
        canvas.height = renderTarget.pixelHeight;
    }

    /**
     * Starts a render pass on the canvas target.
     * @param renderTarget - Target to render to.
     * @param clear - Clear mode.
     * @param clearColor - Optional clear color.
     * @param viewport - Optional viewport.
     * @advanced
     */
    public startRenderPass(
        renderTarget: RenderTarget,
        clear: CLEAR_OR_BOOL,
        clearColor?: number[],
        viewport?: Rectangle
    ): void
    {
        const gpuRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);

        this._renderer.canvasContext.activeContext = gpuRenderTarget.context as any;
        this._renderer.canvasContext.activeResolution = renderTarget.resolution;

        if (clear)
        {
            this.clear(renderTarget, clear, clearColor, viewport);
        }
    }

    /**
     * Clears the render target.
     * @param renderTarget - Target to clear.
     * @param _clear - Clear mode (unused).
     * @param clearColor - Optional clear color.
     * @param viewport - Optional viewport rectangle.
     * @advanced
     */
    public clear(
        renderTarget: RenderTarget,
        _clear: CLEAR_OR_BOOL,
        clearColor?: number[],
        viewport?: Rectangle
    ): void
    {
        const gpuRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);
        const context = gpuRenderTarget.context as ICanvasRenderingContext2D;
        const bounds = viewport || { x: 0, y: 0, width: renderTarget.pixelWidth, height: renderTarget.pixelHeight };

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);

        if (clearColor)
        {
            const color = Color.shared.setValue(clearColor);

            if (color.alpha > 0)
            {
                context.globalAlpha = color.alpha;
                context.fillStyle = color.toHex();
                context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
                context.globalAlpha = 1;
            }
        }
    }

    /**
     * Finishes the render pass (no-op for canvas).
     * @advanced
     */
    public finishRenderPass(): void
    {
        // no-op for canvas
    }

    /**
     * Copies a render target into a texture source.
     * @param {RenderTarget} sourceRenderSurfaceTexture - Source render target.
     * @param {Texture} destinationTexture - Destination texture.
     * @param {object} originSrc - Source origin.
     * @param {number} originSrc.x - Source x origin.
     * @param {number} originSrc.y - Source y origin.
     * @param {object} size - Copy size.
     * @param {number} size.width - Copy width.
     * @param {number} size.height - Copy height.
     * @param {object} [originDest] - Destination origin.
     * @param {number} originDest.x - Destination x origin.
     * @param {number} originDest.y - Destination y origin.
     * @advanced
     */
    public copyToTexture(
        sourceRenderSurfaceTexture: RenderTarget,
        destinationTexture: Texture,
        originSrc: { x: number; y: number },
        size: { width: number; height: number },
        originDest?: { x: number; y: number },
    ): Texture
    {
        const sourceGpuTarget = this._renderTargetSystem.getGpuRenderTarget(sourceRenderSurfaceTexture);
        const sourceCanvas = sourceGpuTarget.canvas as CanvasImageSource;

        const destSource = destinationTexture.source as TextureSource;
        const { context } = this._ensureCanvas(destSource);

        const dx = originDest?.x ?? 0;
        const dy = originDest?.y ?? 0;

        context.drawImage(
            sourceCanvas,
            originSrc.x,
            originSrc.y,
            size.width,
            size.height,
            dx,
            dy,
            size.width,
            size.height
        );

        destSource.update();

        return destinationTexture;
    }

    /**
     * Destroys a GPU render target (no-op for canvas).
     * @param _gpuRenderTarget - Target to destroy.
     * @advanced
     */
    public destroyGpuRenderTarget(_gpuRenderTarget: CanvasRenderTarget): void
    {
        // no-op for canvas
    }

    private _ensureCanvas(source: TextureSource)
    {
        let canvas = source.resource as ICanvas;

        if (!canvas || !(CanvasSource.test(canvas)))
        {
            canvas = DOMAdapter.get().createCanvas(source.pixelWidth, source.pixelHeight);
            source.resource = canvas as any;
        }

        if (canvas.width !== source.pixelWidth || canvas.height !== source.pixelHeight)
        {
            canvas.width = source.pixelWidth;
            canvas.height = source.pixelHeight;
        }

        const context = canvas.getContext('2d') as ICanvasRenderingContext2D;

        return { canvas, context };
    }
}
