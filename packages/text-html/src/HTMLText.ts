import { Rectangle, settings, Texture, utils } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { TextStyle } from '@pixi/text';
import { HTMLTextStyle } from './HTMLTextStyle';

import type { ImageResource, IRenderer, ISize, Renderer } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';
import type { ITextStyle } from '@pixi/text';

/**
 * Alternative to {@link PIXI.Text|Text} but supports multi-style HTML text. There are
 * few key differences between this and {@link PIXI.Text|Text}:
 * <br>&bull; HTMLText not support {@link https://caniuse.com/mdn-svg_elements_foreignobject|Internet Explorer}.
 * <br>&bull; Rendering is text asynchronous. If statically rendering, listen to `update` event on BaseTexture.
 * <br>&bull; Does not support all style options (e.g., `lineJoin`, `leading`, `textBaseline`, `trim`, `miterLimit`,
 *   `fillGradientStops`, `fillGradientType`)
 * @example
 * import { HTMLText } from 'pixi.js';
 *
 * const text = new HTMLText("Hello <b>World</b>", { fontSize: 20 });
 *
 * text.texture.baseTexture.on('update', () => {
 *   console.log('Text is redrawn!');
 * });
 * @class
 * @memberof PIXI
 * @extends PIXI.Sprite
 * @since 7.2.0
 */
export class HTMLText extends Sprite
{
    /**
     * Default opens when destroying.
     * @type {PIXI.IDestroyOptions}
     * @property {boolean} [texture=true] - Whether to destroy the texture.
     * @property {boolean} [children=false] - Whether to destroy the children.
     * @property {boolean} [baseTexture=true] - Whether to destroy the base texture.
     */
    public static defaultDestroyOptions: IDestroyOptions = {
        texture: true,
        children: false,
        baseTexture: true,
    };

    /** Default maxWidth, set at construction */
    public static defaultMaxWidth = 2024;

    /** Default maxHeight, set at construction */
    public static defaultMaxHeight = 2024;

    /** Default resolution, make sure autoResolution or defaultAutoResolution is `false`. */
    public static defaultResolution: number | undefined;

    /** Default autoResolution for all HTMLText objects */
    public static defaultAutoResolution = true;

    /** The maximum width in rendered pixels that the content can be, any larger will be hidden */
    public maxWidth: number;

    /** The maximum height in rendered pixels that the content can be, any larger will be hidden */
    public maxHeight: number;

    private _domElement: HTMLElement;
    private _styleElement: HTMLElement;
    private _svgRoot: SVGSVGElement;
    private _foreignObject: SVGForeignObjectElement;
    private _image: HTMLImageElement;
    private _loadImage: HTMLImageElement;
    private _resolution: number;
    private _text: string | null = null;
    private _style: HTMLTextStyle | null = null;
    private _autoResolution = true;
    private localStyleID = -1;
    private dirty = false;
    private _updateID = 0;

    /** The HTMLTextStyle object is owned by this instance */
    private ownsStyle = false;

    /**
     * @param {string} [text] - Text contents
     * @param {PIXI.HTMLTextStyle|PIXI.TextStyle|PIXI.ITextStyle} [style] - Style setting to use.
     *        Strongly recommend using an HTMLTextStyle object. Providing a PIXI.TextStyle
     *        will convert the TextStyle to an HTMLTextStyle and will no longer be linked.
     */
    constructor(text = '', style: HTMLTextStyle | TextStyle | Partial<ITextStyle> = {})
    {
        super(Texture.EMPTY);

        const image = new Image();
        const texture = Texture.from<ImageResource>(image, {
            scaleMode: settings.SCALE_MODE,
            resourceOptions: {
                autoLoad: false,
            },
        });

        texture.orig = new Rectangle();
        texture.trim = new Rectangle();

        this.texture = texture;

        const nssvg = 'http://www.w3.org/2000/svg';
        const nsxhtml = 'http://www.w3.org/1999/xhtml';
        const svgRoot = document.createElementNS(nssvg, 'svg');
        const foreignObject = document.createElementNS(nssvg, 'foreignObject');
        const domElement = document.createElementNS(nsxhtml, 'div');
        const styleElement = document.createElementNS(nsxhtml, 'style');

        // Arbitrary max size
        foreignObject.setAttribute('width', '10000');
        foreignObject.setAttribute('height', '10000');
        foreignObject.style.overflow = 'hidden';
        svgRoot.appendChild(foreignObject);

        this.maxWidth = HTMLText.defaultMaxWidth;
        this.maxHeight = HTMLText.defaultMaxHeight;
        this._domElement = domElement;
        this._styleElement = styleElement;
        this._svgRoot = svgRoot;
        this._foreignObject = foreignObject;
        this._foreignObject.appendChild(styleElement);
        this._foreignObject.appendChild(domElement);
        this._image = image;
        this._loadImage = new Image();
        this._autoResolution = HTMLText.defaultAutoResolution;
        this._resolution = HTMLText.defaultResolution ?? settings.RESOLUTION;
        this.text = text;
        this.style = style;
    }

    /**
     * Calculate the size of the output text without actually drawing it.
     * This includes the `padding` in the `style` object.
     * This can be used as a fast-pass to do things like text-fitting.
     * @param {object} [overrides] - Overrides for the text, style, and resolution.
     * @param {string} [overrides.text] - The text to measure, if not specified, the current text is used.
     * @param {PIXI.HTMLTextStyle} [overrides.style] - The style to measure, if not specified, the current style is used.
     * @param {number} [overrides.resolution] - The resolution to measure, if not specified, the current resolution is used.
     * @returns {PIXI.ISize} Width and height of the measured text.
     */
    measureText(overrides?: { text?: string, style?: HTMLTextStyle, resolution?: number }): ISize
    {
        const { text, style, resolution } = Object.assign({
            text: this._text,
            style: this._style,
            resolution: this._resolution,
        }, overrides);

        Object.assign(this._domElement, {
            innerHTML: text,
            style: style.toCSS(resolution),
        });
        this._styleElement.textContent = style.toGlobalCSS();

        // Measure the contents using the shadow DOM
        document.body.appendChild(this._svgRoot);
        const contentBounds = this._domElement.getBoundingClientRect();

        this._svgRoot.remove();

        const { width, height } = contentBounds;

        if (process.env.DEBUG)
        {
            if (width > this.maxWidth || height > this.maxHeight)
            {
                console.warn('[HTMLText] Large expanse of text, increase HTMLText.maxWidth or HTMLText.maxHeight property.');
            }
        }

        const contentWidth = Math.min(this.maxWidth, Math.ceil(width));
        const contentHeight = Math.min(this.maxHeight, Math.ceil(height));

        this._svgRoot.setAttribute('width', contentWidth.toString());
        this._svgRoot.setAttribute('height', contentHeight.toString());

        // Undo the changes to the DOM element
        if (text !== this._text)
        {
            this._domElement.innerHTML = this._text as string;
        }
        if (style !== this._style)
        {
            Object.assign(this._domElement, { style: this._style?.toCSS(resolution) });
            this._styleElement.textContent = this._style?.toGlobalCSS() as string;
        }

        return {
            width: contentWidth + (style.padding * 2),
            height: contentHeight + (style.padding * 2),
        };
    }

    /**
     * Manually refresh the text.
     * @public
     * @param {boolean} respectDirty - Whether to abort updating the
     *        text if the Text isn't dirty and the function is called.
     */
    async updateText(respectDirty = true): Promise<void>
    {
        const { style, _image: image, _loadImage: loadImage } = this;

        // check if style has changed..
        if (this.localStyleID !== style.styleID)
        {
            this.dirty = true;
            this.localStyleID = style.styleID;
        }

        if (!this.dirty && respectDirty)
        {
            return;
        }

        const { width, height } = this.measureText();

        // Make sure canvas is at least 1x1 so it drawable
        // for sub-pixel sizes, round up to avoid clipping
        // we update both images, to make sure bounds are correct synchronously
        image.width = loadImage.width = Math.ceil((Math.max(1, width)));
        image.height = loadImage.height = Math.ceil((Math.max(1, height)));

        this._updateID++;

        const updateID = this._updateID;

        await new Promise<void>((resolve) =>
        {
            loadImage.onload = async () =>
            {
                if (updateID < this._updateID)
                {
                    resolve();

                    return;
                }

                // Fake waiting for the image to load
                await style.onBeforeDraw();

                // Swap image and loadImage, we do this to avoid
                // flashes between updateText calls, usually when
                // the onload time is longer than updateText time
                image.src = loadImage.src;
                loadImage.onload = null;
                loadImage.src = '';

                // Force update the texture
                this.updateTexture();
                resolve();
            };
            const svgURL = new XMLSerializer().serializeToString(this._svgRoot);

            loadImage.src = `data:image/svg+xml;charset=utf8,${encodeURIComponent(svgURL)}`;
        });
    }

    /** The raw image element that is rendered under-the-hood. */
    public get source(): HTMLImageElement
    {
        return this._image;
    }

    /**
     * Update the texture resource.
     * @private
     */
    updateTexture()
    {
        const { style, texture, _image: image, resolution } = this;
        const { padding } = style;
        const { baseTexture } = texture;

        texture.trim.width = texture._frame.width = image.width / resolution;
        texture.trim.height = texture._frame.height = image.height / resolution;
        texture.trim.x = -padding;
        texture.trim.y = -padding;

        texture.orig.width = texture._frame.width - (padding * 2);
        texture.orig.height = texture._frame.height - (padding * 2);

        // call sprite onTextureUpdate to update scale if _width or _height were set
        this._onTextureUpdate();

        baseTexture.setRealSize(image.width, image.height, resolution);

        this.dirty = false;
    }

    /**
     * Renders the object using the WebGL renderer
     * @param {PIXI.Renderer} renderer - The renderer
     * @private
     */
    _render(renderer: Renderer)
    {
        if (this._autoResolution && this._resolution !== renderer.resolution)
        {
            this._resolution = renderer.resolution;
            this.dirty = true;
        }

        this.updateText(true);

        super._render(renderer);
    }

    /**
     * Renders the object using the Canvas Renderer.
     * @private
     * @param {PIXI.CanvasRenderer} renderer - The renderer
     */
    _renderCanvas(renderer: IRenderer)
    {
        if (this._autoResolution && this._resolution !== renderer.resolution)
        {
            this._resolution = renderer.resolution;
            this.dirty = true;
        }

        this.updateText(true);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        super._renderCanvas(renderer);
    }

    /**
     * Get the local bounds.
     * @param {PIXI.Rectangle} rect - Input rectangle.
     * @returns {PIXI.Rectangle} Local bounds
     */
    getLocalBounds(rect: Rectangle)
    {
        this.updateText(true);

        return super.getLocalBounds(rect);
    }

    _calculateBounds()
    {
        this.updateText(true);
        this.calculateVertices();
        // if we have already done this on THIS frame.
        (this as any)._bounds.addQuad(this.vertexData);
    }

    /**
     * Handle dirty style changes
     * @private
     */
    _onStyleChange()
    {
        this.dirty = true;
    }

    /**
     * Destroy this Text object. Don't use after calling.
     * @param {boolean|object} options - Same as Sprite destroy options.
     */
    destroy(options?: boolean | IDestroyOptions | undefined)
    {
        if (typeof options === 'boolean')
        {
            options = { children: options };
        }

        options = Object.assign({}, HTMLText.defaultDestroyOptions, options);

        super.destroy(options);

        const forceClear: any = null;

        // Remove any loaded fonts if we created the HTMLTextStyle
        if (this.ownsStyle)
        {
            this._style?.cleanFonts();
        }
        this._style = forceClear;
        this._svgRoot?.remove();
        this._svgRoot = forceClear;
        this._domElement?.remove();
        this._domElement = forceClear;
        this._foreignObject?.remove();
        this._foreignObject = forceClear;
        this._styleElement?.remove();
        this._styleElement = forceClear;

        this._loadImage.src = '';
        this._loadImage.onload = null;
        this._loadImage = forceClear;
        this._image.src = '';
        this._image = forceClear;
    }

    /**
     * Get the width in pixels.
     * @member {number}
     */
    get width()
    {
        this.updateText(true);

        return Math.abs(this.scale.x) * this._image.width / this.resolution;
    }

    set width(value) // eslint-disable-line require-jsdoc
    {
        this.updateText(true);

        const s = utils.sign(this.scale.x) || 1;

        this.scale.x = s * value / this._image.width / this.resolution;
        this._width = value;
    }

    /**
     * Get the height in pixels.
     * @member {number}
     */
    get height()
    {
        this.updateText(true);

        return Math.abs(this.scale.y) * this._image.height / this.resolution;
    }

    set height(value) // eslint-disable-line require-jsdoc
    {
        this.updateText(true);

        const s = utils.sign(this.scale.y) || 1;

        this.scale.y = s * value / this._image.height / this.resolution;
        this._height = value;
    }

    /** The base style to render with text. */
    get style(): HTMLTextStyle
    {
        return this._style as HTMLTextStyle;
    }

    set style(style: HTMLTextStyle | TextStyle | Partial<ITextStyle>) // eslint-disable-line require-jsdoc
    {
        // Don't do anything if we're re-assigning
        if (this._style === style)
        {
            return;
        }

        style = style || {};

        if (style instanceof HTMLTextStyle)
        {
            this.ownsStyle = false;
            this._style = style;
        }
        // Clone TextStyle
        else if (style instanceof TextStyle)
        {
            console.warn('[HTMLText] Cloning TextStyle, if this is not what you want, use HTMLTextStyle');

            this.ownsStyle = true;
            this._style = HTMLTextStyle.from(style);
        }
        else
        {
            this.ownsStyle = true;
            this._style = new HTMLTextStyle(style);
        }

        this.localStyleID = -1;
        this.dirty = true;
    }

    /**
     * Contents of text. This can be HTML text and include tags.
     * @example
     * const text = new HTMLText('This is a <em>styled</em> text!');
     * @member {string}
     */
    get text()
    {
        return this._text;
    }

    set text(text) // eslint-disable-line require-jsdoc
    {
        text = String(text === '' || text === null || text === undefined ? ' ' : text);
        text = this.sanitiseText(text);

        if (this._text === text)
        {
            return;
        }
        this._text = text;
        this.dirty = true;
    }

    /**
     * The resolution / device pixel ratio of the canvas.
     * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
     * @member {number}
     * @default 1
     */
    get resolution(): number
    {
        return this._resolution;
    }

    set resolution(value: number) // eslint-disable-line require-jsdoc
    {
        this._autoResolution = false;

        if (this._resolution === value)
        {
            return;
        }

        this._resolution = value;
        this.dirty = true;
    }

    /**
     * Sanitise text - replace `<br>` with `<br/>`, `&nbsp;` with `&#160;`
     * @param text
     * @see https://www.sitepoint.com/community/t/xhtml-1-0-transitional-xml-parsing-error-entity-nbsp-not-defined/3392/3
     */
    private sanitiseText(text: string): string
    {
        return text
            .replace(/<br>/gi, '<br/>')
            .replace(/<hr>/gi, '<hr/>')
            .replace(/&nbsp;/gi, '&#160;');
    }
}
