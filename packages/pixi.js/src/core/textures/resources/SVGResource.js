import {
    decomposeDataUri, getSvgSize, uid,
} from '../../utils';
import TextureResource from './TextureResource';

export default class SVGResource extends TextureResource
{
    constructor(svgSource, scale)
    {
        super();

        this.svgSource = svgSource;
        this.scale = 1 || scale;
        this.uploadable = true;

        this.resolve = null;

        this.load = new Promise((resolve) =>
{
            this.resolve = resolve;
            this._loadSvgSourceUsingXhr();
        });
    }

    /**
     * Checks if `source` is an SVG image and whether it's loaded via a URL or a data URI. Then calls
     * `_loadSvgSourceUsingDataUri` or `_loadSvgSourceUsingXhr`.
     */
    _loadSvgSource()
    {
        const dataUri = decomposeDataUri(this.svgSource);

        if (dataUri)
        {
            this._loadSvgSourceUsingDataUri(dataUri);
        }
        else
        {
            // We got an URL, so we need to do an XHR to check the svg size
            this._loadSvgSourceUsingXhr();
        }
    }

    /**
     * Loads an SVG string from `imageUrl` using XHR and then calls `_loadSvgSourceUsingString`.
     */
    _loadSvgSourceUsingXhr()
    {
        const svgXhr = new XMLHttpRequest();

        // This throws error on IE, so SVG Document can't be used
        // svgXhr.responseType = 'document';

        // This is not needed since we load the svg as string (breaks IE too)
        // but overrideMimeType() can be used to force the response to be parsed as XML
        // svgXhr.overrideMimeType('image/svg+xml');

        svgXhr.onload = () =>
        {
            if (svgXhr.readyState !== svgXhr.DONE || svgXhr.status !== 200)
            {
                throw new Error('Failed to load SVG using XHR.');
            }

            this._loadSvgSourceUsingString(svgXhr.response);
        };

        svgXhr.onerror = () => this.emit('error', this);

        svgXhr.open('GET', this.svgSource, true);
        svgXhr.send();
    }

    /**
     * Loads texture using an SVG string. The original SVG Image is stored as `origSource` and the
     * created canvas is the new `source`. The SVG is scaled using `sourceScale`. Called by
     * `_loadSvgSourceUsingXhr` or `_loadSvgSourceUsingDataUri`.
     *
     * @param  {string} svgString SVG source as string
     *
     * @fires loaded
     */
    _loadSvgSourceUsingString(svgString)
    {
        const svgSize = getSvgSize(svgString);

        // TODO do we need to wait for this to load?
        // seems instant!
        //
        const tempImage =  new Image();

        tempImage.src = `data:image/svg+xml,${svgString}`;

        const svgWidth = svgSize.width;
        const svgHeight = svgSize.height;

        if (!svgWidth || !svgHeight)
        {
            throw new Error('The SVG image must have width and height defined (in pixels), canvas API needs them.');
        }

        // Scale realWidth and realHeight
        this.width = Math.round(svgWidth * this.scale);
        this.height = Math.round(svgHeight * this.scale);

        // Create a canvas element
        const canvas = document.createElement('canvas');

        canvas.width = this.width;
        canvas.height = this.height;
        canvas._pixiId = `canvas_${uid()}`;

        // Draw the Svg to the canvas
        canvas
            .getContext('2d')
            .drawImage(tempImage, 0, 0, svgWidth, svgHeight, 0, 0, this.width, this.height);

        this.source = canvas;

        this.resolve(this);
    }

    static from(url)
    {
        return new SVGResource(url);
    }

}
