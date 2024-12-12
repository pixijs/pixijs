import { DOMAdapter } from '../../../../../environment/adapter';
import { ExtensionType } from '../../../../../extensions/Extensions';
import { TextureSource } from './TextureSource';

import type { ICanvas } from '../../../../../environment/canvas/ICanvas';
import type { ExtensionMetadata } from '../../../../../extensions/Extensions';
import type { TextureSourceOptions } from './TextureSource';

export interface CanvasSourceOptions extends TextureSourceOptions<ICanvas>
{
    /** should the canvas be resized to preserve its screen width and height regardless of the resolution of the renderer */
    autoDensity?: boolean;
    /** if true, this canvas will be set up to be transparent where possible */
    transparent?: boolean;
}

export class CanvasSource extends TextureSource<ICanvas>
{
    public static extension: ExtensionMetadata = ExtensionType.TextureSource;

    public uploadMethodId = 'image';
    public autoDensity: boolean;
    public transparent: boolean;

    private _context2D: CanvasRenderingContext2D;

    constructor(options: CanvasSourceOptions)
    {
        if (!options.resource)
        {
            options.resource = DOMAdapter.get().createCanvas();
        }

        if (!options.width)
        {
            options.width = options.resource.width;

            if (!options.autoDensity)
            {
                options.width /= options.resolution;
            }
        }

        if (!options.height)
        {
            options.height = options.resource.height;

            if (!options.autoDensity)
            {
                options.height /= options.resolution;
            }
        }

        super(options);

        this.autoDensity = options.autoDensity;

        this.resizeCanvas();

        this.transparent = !!options.transparent;
    }

    public resizeCanvas()
    {
        if (this.autoDensity)
        {
            this.resource.style.width = `${this.width}px`;
            this.resource.style.height = `${this.height}px`;
        }

        // only resize if wee need to, as this clears the canvas (even if values are set to the same)
        if (this.resource.width !== this.pixelWidth || this.resource.height !== this.pixelHeight)
        {
            this.resource.width = this.pixelWidth;
            this.resource.height = this.pixelHeight;
        }
    }

    public resize(width = this.width, height = this.height, resolution = this._resolution): boolean
    {
        const didResize = super.resize(width, height, resolution);

        if (didResize)
        {
            this.resizeCanvas();
        }

        return didResize;
    }

    public static test(resource: any): resource is ICanvas
    {
        return (globalThis.HTMLCanvasElement && resource instanceof HTMLCanvasElement)
        || (globalThis.OffscreenCanvas && resource instanceof OffscreenCanvas);
    }

    /**
     * Returns the 2D rendering context for the canvas.
     * Caches the context after creating it.
     * @returns The 2D rendering context of the canvas.
     */
    get context2D(): CanvasRenderingContext2D
    {
        return this._context2D || (this._context2D = this.resource.getContext('2d') as CanvasRenderingContext2D);
    }
}
