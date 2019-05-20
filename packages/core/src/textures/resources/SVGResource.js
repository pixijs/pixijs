import { uid } from '@pixi/utils';
import BaseImageResource from './BaseImageResource';

/**
 * Resource type for SVG elements and graphics.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 * @param {string} source - Base64 encoded SVG element or URL for SVG file.
 * @param {object} [options] - Options to use
 * @param {number} [options.scale=1] Scale to apply to SVG.
 * @param {boolean} [options.autoLoad=true] Start loading right away.
 */
export default class SVGResource extends BaseImageResource
{
    constructor(source, options)
    {
        options = options || {};

        super(document.createElement('canvas'));

        /**
         * Base64 encoded SVG element or URL for SVG file
         * @readonly
         * @member {string}
         */
        this.svg = source;

        /**
         * The source scale to apply to render
         * @readonly
         * @member {number}
         */
        this.scale = options.scale || 1;

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
        this._crossorigin = options.crossorigin || true;

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

    load()
    {
        if (this._load)
        {
            return this._load;
        }

        this._load = new Promise((resolve) =>
        {
            // Save this until after load is finished
            this._resolve = () =>
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
                this.svg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(this.svg)))}`;
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
    _loadSvg()
    {
        const tempImage = new Image();

        BaseImageResource.crossOrigin(tempImage, this.svg, this._crossorigin);
        tempImage.src = this.svg;

        tempImage.onload = () =>
        {
            const svgWidth = tempImage.width;
            const svgHeight = tempImage.height;

            if (!svgWidth || !svgHeight)
            {
                throw new Error('The SVG image must have width and height defined (in pixels), canvas API needs them.');
            }

            // Scale realWidth and realHeight
            const width = Math.round(svgWidth * this.scale);
            const height = Math.round(svgHeight * this.scale);

            // Create a canvas element
            const canvas = this.source;

            canvas.width = width;
            canvas.height = height;
            canvas._pixiId = `canvas_${uid()}`;

            // Draw the Svg to the canvas
            canvas
                .getContext('2d')
                .drawImage(tempImage, 0, 0, svgWidth, svgHeight, 0, 0, width, height);

            this._resolve();
            this._resolve = null;
        };
    }

    /**
     * Destroys this texture
     * @override
     */
    dispose()
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
    static test(source, extension)
    {
        // url file extension is SVG
        return extension === 'svg'
            // source is SVG data-uri
            || (typeof source === 'string' && source.indexOf('data:image/svg+xml;base64') === 0)
            // source is SVG inline
            || (typeof source === 'string' && source.indexOf('<svg') === 0);
    }
}
