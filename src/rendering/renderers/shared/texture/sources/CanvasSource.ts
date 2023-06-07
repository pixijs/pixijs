import { settings } from '../../../../../settings/settings';
import { TextureSource } from './TextureSource';

import type { ICanvas } from '../../../../../settings/adapter/ICanvas';
import type { TextureSourceOptions } from './TextureSource';

export interface CanvasSourceOptions extends TextureSourceOptions<ICanvas>
{
    autoDensity?: boolean;
}

export class CanvasSource extends TextureSource<ICanvas>
{
    type = 'image';
    autoDensity: boolean;
    alphaMode = 0;

    constructor(options: CanvasSourceOptions)
    {
        if (!options.resource)
        {
            options.resource = settings.ADAPTER.createCanvas();
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

        const canvas = options.resource;

        if (this.pixelWidth !== canvas.width || this.pixelWidth !== canvas.height)
        {
            this.resizeCanvas();
        }
    }

    resizeCanvas()
    {
        if (this.autoDensity)
        {
            this.resource.style.width = `${this.width}px`;
            this.resource.style.height = `${this.height}px`;
        }

        this.resource.width = this.pixelWidth;
        this.resource.height = this.pixelHeight;
    }

    resize(width = this.width, height = this.height, resolution = this._resolution): void
    {
        super.resize(width, height, resolution);

        this.resizeCanvas();
    }
}
