import { uid } from '@pixi/utils';
import { BaseImageResource } from './BaseImageResource';

import type { ISize } from '@pixi/math';

export interface ISVGResourceOptions
{
    source?: string;
    scale?: number;
    width?: number;
    height?: number;
    autoLoad?: boolean;
    crossorigin?: boolean|string;
}
/**
 * Resource type for SVG elements and graphics.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 * @param {string} source - Base64 encoded SVG element or URL for SVG file.
 * @param {object} [options] - Options to use
 * @param {number} [options.scale=1] Scale to apply to SVG. Overridden by...
 * @param {number} [options.width] Rasterize SVG this wide. Aspect ratio preserved if height not specified.
 * @param {number} [options.height] Rasterize SVG this high. Aspect ratio preserved if width not specified.
 * @param {boolean} [options.autoLoad=true] Start loading right away.
 */
export class SVGResource extends BaseImageResource
{
    public readonly svg: string;
    public readonly scale: number;
    readonly _overrideWidth: number;
    readonly _overrideHeight: number;
    private _resolve: Function;
    private _load: Promise<SVGResource>;
    private _crossorigin?: boolean|string;

    constructor(sourceBase64: string, options: ISVGResourceOptions)
    {
        options = options || {};

        super(document.createElement('canvas'));
        this._width = 0;
        this._height = 0;

        /**
         * Base64 encoded SVG element or URL for SVG file
         * @readonly
         * @member {string}
         */
        this.svg = sourceBase64;

        /**
         * The source scale to apply when rasterizing on load
         * @readonly
         * @member {number}
         */
        this.scale = options.scale || 1;

        /**
         * A width override for rasterization on load
         * @readonly
         * @member {number}
         */
        this._overrideWidth = options.width;

        /**
         * A height override for rasterization on load
         * @readonly
         * @member {number}
         */
        this._overrideHeight = options.height;

        /**
         * Call when completely loaded
         * @private
         * @member {function}
         */
        this._resolve = null;

        /**
         * Cross origin value to use
         * @private
         * @member {boolean|string}
         */
        this._crossorigin = options.crossorigin;

        /**
         * Promise when loading
         * @member {Promise<void>}
         * @private
         * @default null
         */
        this._load = null;

        if (options.autoLoad !== false)
        {
            this.load();
        }
    }

    load(): Promise<SVGResource>
    {
        if (this._load)
        {
            return this._load;
        }

        this._load = new Promise((resolve): void =>
        {
            // Save this until after load is finished
            this._resolve = (): void =>
            {
                this.resize(this.source.width, this.source.height);
                resolve(this);
            };

            // Convert SVG inline string to data-uri
            if ((/^\<svg/).test(this.svg.trim()))
            {
                if (!btoa)
                {
                    throw new Error('Your browser doesn\'t support base64 conversions.');
                }
                (this as any).svg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(this.svg)))}`;
            }

            this._loadSvg();
        });

        return this._load;
    }

    /**
     * Loads an SVG image from `imageUrl` or `data URL`.
     *
     * @private
     */
    private _loadSvg(): void
    {
        const tempImage = new Image();

        BaseImageResource.crossOrigin(tempImage, this.svg, this._crossorigin);
        tempImage.src = this.svg;

        tempImage.onerror = (event): void =>
        {
            if (!this._resolve)
            {
                return;
            }

            tempImage.onerror = null;
            this.onError.emit(event);
        };

        tempImage.onload = (): void =>
        {
            if (!this._resolve)
            {
                return;
            }

            const svgWidth = tempImage.width;
            const svgHeight = tempImage.height;

            if (!svgWidth || !svgHeight)
            {
                throw new Error('The SVG image must have width and height defined (in pixels), canvas API needs them.');
            }

            // Set render size
            let width = svgWidth * this.scale;
            let height = svgHeight * this.scale;

            if (this._overrideWidth || this._overrideHeight)
            {
                width = this._overrideWidth || this._overrideHeight / svgHeight * svgWidth;
                height = this._overrideHeight || this._overrideWidth / svgWidth * svgHeight;
            }
            width = Math.round(width);
            height = Math.round(height);

            // Create a canvas element
            const canvas = this.source as HTMLCanvasElement;

            canvas.width = width;
            canvas.height = height;
            (canvas as any)._pixiId = `canvas_${uid()}`;

            // Draw the Svg to the canvas
            canvas
                .getContext('2d')
                .drawImage(tempImage, 0, 0, svgWidth, svgHeight, 0, 0, width, height);

            this._resolve();
            this._resolve = null;
        };
    }

    /**
     * Get size from an svg string using regexp.
     *
     * @method
     * @param {string} svgString - a serialized svg element
     * @return {PIXI.ISize} image extension
     */
    static getSize(svgString?: string): ISize
    {
        const sizeMatch = SVGResource.SVG_SIZE.exec(svgString);
        const size: any = {};

        if (sizeMatch)
        {
            size[sizeMatch[1]] = Math.round(parseFloat(sizeMatch[3]));
            size[sizeMatch[5]] = Math.round(parseFloat(sizeMatch[7]));
        }

        return size;
    }

    /**
     * Destroys this texture
     * @override
     */
    dispose(): void
    {
        super.dispose();
        this._resolve = null;
        this._crossorigin = null;
    }

    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {*} source - The source object
     * @param {string} extension - The extension of source, if set
     */
    static test(source: any, extension?: string): boolean
    {
        // url file extension is SVG
        return extension === 'svg'
            // source is SVG data-uri
            || (typeof source === 'string' && source.indexOf('data:image/svg+xml;base64') === 0)
            // source is SVG inline
            || (typeof source === 'string' && source.indexOf('<svg') === 0);
    }

    /**
     * RegExp for SVG size.
     *
     * @static
     * @constant {RegExp|string} SVG_SIZE
     * @memberof PIXI.resources.SVGResource
     * @example &lt;svg width="100" height="100"&gt;&lt;/svg&gt;
     */
    static SVG_SIZE = /<svg[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*>/i; // eslint-disable-line max-len
}
