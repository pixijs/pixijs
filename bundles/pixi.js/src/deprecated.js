import { deprecation } from '@pixi/utils';

const v5 = '5.0.0';

export default function deprecated(PIXI)
{
    Object.defineProperties(PIXI, {
        /**
         * @constant
         * @name SVG_SIZE
         * @memberof PIXI
         * @see PIXI.SVGResource.SVG_SIZE
         * @deprecated since 5.0.0
         */
        SVG_SIZE: {
            get()
            {
                deprecation(v5, 'PIXI.utils.SVG_SIZE has moved to PIXI.SVGResource.SVG_SIZE');

                return PIXI.SVGResource.SVG_SIZE;
            },
        },

        /**
         * @class PIXI.TransformStatic
         * @deprecated since 5.0.0
         * @see PIXI.Transform
         */
        TransformStatic: {
            get()
            {
                deprecation(v5, 'PIXI.TransformStatic has been removed, use PIXI.Transform');

                return PIXI.Transform;
            },
        },

        /**
         * @class PIXI.TransformBase
         * @deprecated since 5.0.0
         * @see PIXI.Transform
         */
        TransformBase: {
            get()
            {
                deprecation(v5, 'PIXI.TransformBase has been removed, use PIXI.Transform');

                return PIXI.Transform;
            },
        },

        /**
         * Constants that specify the transform type.
         *
         * @static
         * @constant
         * @name TRANSFORM_MODE
         * @memberof PIXI
         * @type {object}
         * @deprecated since 5.0.0
         * @property {number} STATIC
         * @property {number} DYNAMIC
         */
        TRANSFORM_MODE: {
            get()
            {
                deprecation(v5, 'PIXI.TRANSFORM_MODE has been removed');

                return { STATIC: 0, DYNAMIC: 1 };
            },
        },

        /**
         * @class PIXI.WebGLRenderer
         * @see PIXI.Renderer
         * @deprecated since 5.0.0
         */
        WebGLRenderer: {
            get()
            {
                deprecation(v5, 'PIXI.WebGLRenderer has moved to PIXI.Renderer');

                return PIXI.Renderer;
            },
        },

        /**
         * @class PIXI.CanvasRenderTarget
         * @see PIXI.utils.CanvasRenderTarget
         * @deprecated since 5.0.0
         */
        CanvasRenderTarget: {
            get()
            {
                deprecation(v5, 'PIXI.CanvasRenderTarget has moved to PIXI.utils.CanvasRenderTarget');

                return PIXI.utils.CanvasRenderTarget;
            },
        },

        /**
         * @memberof PIXI
         * @name loader
         * @type {PIXI.Loader}
         * @see PIXI.Loader.shared
         * @deprecated since 5.0.0
         */
        loader: {
            get()
            {
                deprecation(v5, 'PIXI.loader has moved to PIXI.Loader.shared');

                return PIXI.Loader.shared;
            },
        },

        /**
         * @class PIXI.FilterManager
         * @see PIXI.systems.FilterSystem
         * @deprecated since 5.0.0
         */
        FilterManager: {
            get()
            {
                deprecation(v5, 'PIXI.FilterManager has moved to PIXI.systems.FilterSystem');

                return PIXI.systems.FilterManager;
            },
        },
    });

    /**
     * This namespace has been removed. All classes previous nested
     * under this namespace have been moved to the top-level `PIXI` object.
     * @namespace PIXI.extras
     * @deprecated since 5.0.0
     */
    PIXI.extras = {};

    Object.defineProperties(PIXI.extras, {
        /**
         * @class PIXI.extras.TilingSprite
         * @see PIXI.TilingSprite
         * @deprecated since 5.0.0
         */
        TilingSprite: {
            get()
            {
                deprecation(v5, 'PIXI.extras.TilingSprite has moved to PIXI.TilingSprite');

                return PIXI.TilingSprite;
            },
        },
        /**
         * @class PIXI.extras.TilingSpriteRenderer
         * @see PIXI.TilingSpriteRenderer
         * @deprecated since 5.0.0
         */
        TilingSpriteRenderer: {
            get()
            {
                deprecation(v5, 'PIXI.extras.TilingSpriteRenderer has moved to PIXI.TilingSpriteRenderer');

                return PIXI.TilingSpriteRenderer;
            },
        },
        /**
         * @class PIXI.extras.AnimatedSprite
         * @see PIXI.AnimatedSprite
         * @deprecated since 5.0.0
         */
        AnimatedSprite: {
            get()
            {
                deprecation(v5, 'PIXI.extras.AnimatedSprite has moved to PIXI.AnimatedSprite');

                return PIXI.AnimatedSprite;
            },
        },
        /**
         * @class PIXI.extras.BitmapText
         * @see PIXI.BitmapText
         * @deprecated since 5.0.0
         */
        BitmapText: {
            get()
            {
                deprecation(v5, 'PIXI.extras.BitmapText has moved to PIXI.BitmapText');

                return PIXI.BitmapText;
            },
        },
    });

    Object.defineProperties(PIXI.utils, {
        /**
         * @function PIXI.utils.getSvgSize
         * @see PIXI.SVGResource.getSize
         * @deprecated since 5.0.0
         */
        getSvgSize: {
            get()
            {
                deprecation(v5, 'PIXI.utils.getSvgSize has moved to PIXI.SVGResource.getSize');

                return PIXI.SVGResource.getSize;
            },
        },
    });

    /**
     * All classes on this namespace have moved to the high-level `PIXI` object.
     * @namespace PIXI.mesh
     * @deprecated since 5.0.0
     */
    PIXI.mesh = {};

    Object.defineProperties(PIXI.mesh, {
        /**
         * @class PIXI.mesh.Mesh
         * @see PIXI.Mesh2d
         * @deprecated since 5.0.0
         */
        Mesh: {
            get()
            {
                deprecation(v5, 'PIXI.mesh.Mesh has moved to PIXI.Mesh2d');

                return PIXI.Mesh2d;
            },
        },
        /**
         * @class PIXI.mesh.NineSlicePlane
         * @see PIXI.NineSlicePlane
         * @deprecated since 5.0.0
         */
        NineSlicePlane: {
            get()
            {
                deprecation(v5, 'PIXI.mesh.NineSlicePlane has moved to PIXI.NineSlicePlane');

                return PIXI.NineSlicePlane;
            },
        },
        /**
         * @class PIXI.mesh.Plane
         * @see PIXI.Plane
         * @deprecated since 5.0.0
         */
        Plane: {
            get()
            {
                deprecation(v5, 'PIXI.mesh.Plane has moved to PIXI.Plane');

                return PIXI.Plane;
            },
        },
        /**
         * @class PIXI.mesh.Rope
         * @see PIXI.Rope
         * @deprecated since 5.0.0
         */
        Rope: {
            get()
            {
                deprecation(v5, 'PIXI.mesh.Rope has moved to PIXI.Rope');

                return PIXI.Rope;
            },
        },
        /**
         * @class PIXI.mesh.RawMesh
         * @see PIXI.Mesh
         * @deprecated since 5.0.0
         */
        RawMesh: {
            get()
            {
                deprecation(v5, 'PIXI.mesh.RawMesh has moved to PIXI.Mesh');

                return PIXI.Mesh;
            },
        },
        /**
         * @class PIXI.mesh.CanvasMeshRenderer
         * @see PIXI.CanvasMeshRenderer
         * @deprecated since 5.0.0
         */
        CanvasMeshRenderer: {
            get()
            {
                deprecation(v5, 'PIXI.mesh.CanvasMeshRenderer has moved to PIXI.CanvasMeshRenderer');

                return PIXI.CanvasMeshRenderer;
            },
        },
        /**
         * @class PIXI.mesh.MeshRenderer
         * @see PIXI.MeshRenderer
         * @deprecated since 5.0.0
         */
        MeshRenderer: {
            get()
            {
                deprecation(v5, 'PIXI.mesh.MeshRenderer has moved to PIXI.MeshRenderer');

                return PIXI.MeshRenderer;
            },
        },
    });

    /*
     * This namespace has been removed and items have been moved to
     * the top-level `PIXI` object.
     * @namespace PIXI.particles
     * @deprecated since 5.0.0
     */
    PIXI.particles = {};

    Object.defineProperties(PIXI.particles, {
        /**
         * @class PIXI.particles.ParticleContainer
         * @deprecated since 5.0.0
         * @see PIXI.ParticleContainer
         */
        ParticleContainer: {
            get()
            {
                deprecation(v5, 'PIXI.particles.ParticleContainer has moved to PIXI.ParticleContainer');

                return PIXI.ParticleContainer;
            },
        },
        /**
         * @class PIXI.particles.ParticleRenderer
         * @deprecated since 5.0.0
         * @see PIXI.ParticleRenderer
         */
        ParticleRenderer: {
            get()
            {
                deprecation(v5, 'PIXI.particles.ParticleRenderer has moved to PIXI.ParticleRenderer');

                return PIXI.ParticleRenderer;
            },
        },
    });

    /*
     * This namespace has been removed and items have been moved to
     * the top-level `PIXI` object.
     * @namespace PIXI.ticker
     * @deprecated since 5.0.0
     */
    PIXI.ticker = {};

    Object.defineProperties(PIXI.ticker, {
        /**
         * @class PIXI.ticker.Ticker
         * @deprecated since 5.0.0
         * @see PIXI.Ticker
         */
        Ticker: {
            get()
            {
                deprecation(v5, 'PIXI.ticker.Ticker has moved to PIXI.Ticker');

                return PIXI.Ticker;
            },
        },
        /**
         * @name PIXI.ticker.shared
         * @type {PIXI.Ticker}
         * @deprecated since 5.0.0
         * @see PIXI.Ticker.shared
         */
        shared: {
            get()
            {
                deprecation(v5, 'PIXI.ticker.shared has moved to PIXI.Ticker.shared');

                return PIXI.Ticker.shared;
            },
        },
    });

    /**
     * All classes on this namespace have moved to the high-level `PIXI` object.
     * @namespace PIXI.loaders
     * @deprecated since 5.0.0
     */
    PIXI.loaders = {};

    Object.defineProperties(PIXI.loaders, {
        /**
         * @class PIXI.loaders.Loader
         * @see PIXI.Loader
         * @deprecated since 5.0.0
         */
        Loader: {
            get()
            {
                deprecation(v5, 'PIXI.loaders.Loader has moved to PIXI.Loader');

                return PIXI.Loader;
            },
        },
        /**
         * @class PIXI.loaders.Resource
         * @see PIXI.LoaderResource
         * @deprecated since 5.0.0
         */
        Resource: {
            get()
            {
                deprecation(v5, 'PIXI.loaders.Resource has moved to PIXI.LoaderResource');

                return PIXI.LoaderResource;
            },
        },
        /**
         * @function PIXI.loaders.bitmapFontParser
         * @see PIXI.BitmapFontLoader.use
         * @deprecated since 5.0.0
         */
        bitmapFontParser: {
            get()
            {
                deprecation(v5, 'PIXI.loaders.bitmapFontParser has moved to PIXI.BitmapFontLoader.use');

                return PIXI.BitmapFontLoader.use;
            },
        },
        /**
         * @function PIXI.loaders.parseBitmapFontData
         * @see PIXI.BitmapFontLoader.parse
         * @deprecated since 5.0.0
         */
        parseBitmapFontData: {
            get()
            {
                deprecation(v5, 'PIXI.loaders.parseBitmapFontData has moved to PIXI.BitmapFontLoader.parse');

                return PIXI.BitmapFontLoader.parse;
            },
        },
        /**
         * @function PIXI.loaders.spritesheetParser
         * @see PIXI.SpritesheetLoader.use
         * @deprecated since 5.0.0
         */
        spritesheetParser: {
            get()
            {
                deprecation(v5, 'PIXI.loaders.spritesheetParser has moved to PIXI.SpritesheetLoader.use');

                return PIXI.SpritesheetLoader.use;
            },
        },
        /**
         * @function PIXI.loaders.getResourcePath
         * @see PIXI.SpritesheetLoader.getResourcePath
         * @deprecated since 5.0.0
         */
        getResourcePath: {
            get()
            {
                deprecation(v5, 'PIXI.loaders.getResourcePath has moved to PIXI.SpritesheetLoader.getResourcePath');

                return PIXI.SpritesheetLoader.getResourcePath;
            },
        },
    });

    /**
     * @function PIXI.loaders.Loader.addPixiMiddleware
     * @see PIXI.Loader.registerPlugin
     * @deprecated since 5.0.0
     * @param {function} middleware
     */
    PIXI.Loader.addPixiMiddleware = function addPixiMiddleware(middleware)
    {
        deprecation(v5, 'PIXI.loaders.Loader.addPixiMiddleware is deprecated, use PIXI.loaders.Loader.registerPlugin');

        return PIXI.loaders.Loader.registerPlugin({ use: middleware() });
    };

    /**
     * @class PIXI.extract.WebGLExtract
     * @deprecated since 5.0.0
     * @see PIXI.extract.Prepare
     */
    Object.defineProperty(PIXI.extract, 'WebGLExtract', {
        get()
        {
            deprecation(v5, 'PIXI.extract.WebGLExtract has moved to PIXI.extract.Extract');

            return PIXI.extract.Extract;
        },
    });

    /**
     * @class PIXI.prepare.WebGLPrepare
     * @deprecated since 5.0.0
     * @see PIXI.prepare.Prepare
     */
    Object.defineProperty(PIXI.prepare, 'WebGLPrepare', {
        get()
        {
            deprecation(v5, 'PIXI.prepare.WebGLPrepare has moved to PIXI.prepare.Prepare');

            return PIXI.prepare.Prepare;
        },
    });

    /**
     * @method PIXI.Container#_renderWebGL
     * @private
     * @deprecated since 5.0.0
     * @see PIXI.Container#render
     * @param {PIXI.Renderer} renderer Instance of renderer
     */
    PIXI.Container.prototype._renderWebGL = function _renderWebGL(renderer)
    {
        deprecation(v5, 'PIXI.Container#_renderWebGL has moved to PIXI.Container#_render');

        this._render(renderer);
    };

    /**
     * @method PIXI.Container#renderWebGL
     * @deprecated since 5.0.0
     * @see PIXI.Container#render
     * @param {PIXI.Renderer} renderer Instance of renderer
     */
    PIXI.Container.prototype.renderWebGL = function renderWebGL(renderer)
    {
        deprecation(v5, 'PIXI.Container#renderWebGL has moved to PIXI.Container#render');

        this.render(renderer);
    };

    /**
     * @method PIXI.DisplayObject#renderWebGL
     * @deprecated since 5.0.0
     * @see PIXI.DisplayObject#render
     * @param {PIXI.Renderer} renderer Instance of renderer
     */
    PIXI.DisplayObject.prototype.renderWebGL = function renderWebGL(renderer)
    {
        deprecation(v5, 'PIXI.DisplayObject#renderWebGL has moved to PIXI.DisplayObject#render');

        this.render(renderer);
    };

    /**
     * @method PIXI.Container#renderAdvancedWebGL
     * @deprecated since 5.0.0
     * @see PIXI.Container#renderAdvanced
     * @param {PIXI.Renderer} renderer Instance of renderer
     */
    PIXI.Container.prototype.renderAdvancedWebGL = function renderAdvancedWebGL(renderer)
    {
        deprecation(v5, 'PIXI.Container#renderAdvancedWebGL has moved to PIXI.Container#renderAdvanced');

        this.renderAdvanced(renderer);
    };

    Object.defineProperties(PIXI.settings, {
        /**
         * Default transform type.
         *
         * @static
         * @deprecated since 5.0.0
         * @memberof PIXI.settings
         * @type {PIXI.TRANSFORM_MODE}
         * @default PIXI.TRANSFORM_MODE.STATIC
         */
        TRANSFORM_MODE: {
            get()
            {
                deprecation(v5, 'PIXI.settings.TRANSFORM_MODE has been removed.');

                return 0;
            },
            set()
            {
                deprecation(v5, 'PIXI.settings.TRANSFORM_MODE has been removed.');
            },
        },
    });

    const { BaseTexture } = PIXI;

    /**
     * @method fromImage
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTexture.fromImage = function fromImage(canvas, crossorigin, scaleMode, scale)
    {
        deprecation(v5, 'PIXI.BaseTexture.fromImage has been replaced with PIXI.BaseTexture.from');

        const resourceOptions = { scale, crossorigin };

        return BaseTexture.from(canvas, { scaleMode, resourceOptions });
    };

    /**
     * @method fromCanvas
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTexture.fromCanvas = function fromCanvas(canvas, scaleMode)
    {
        deprecation(v5, 'PIXI.BaseTexture.fromCanvas has been replaced with PIXI.BaseTexture.from');

        return BaseTexture.from(canvas, { scaleMode });
    };

    /**
     * @method fromSVG
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTexture.fromSVG = function fromSVG(canvas, crossorigin, scaleMode, scale)
    {
        deprecation(v5, 'PIXI.BaseTexture.fromSVG has been replaced with PIXI.BaseTexture.from');

        const resourceOptions = { scale, crossorigin };

        return BaseTexture.from(canvas, { scaleMode, resourceOptions });
    };

    /**
     * @method PIXI.Point#copy
     * @deprecated since 5.0.0
     * @see PIXI.Point#copyFrom
     */
    PIXI.Point.prototype.copy = function copy(p)
    {
        deprecation(v5, 'PIXI.Point.copy has been replaced with PIXI.Point#copyFrom');

        return this.copyFrom(p);
    };

    /**
     * @method PIXI.ObservablePoint#copy
     * @deprecated since 5.0.0
     * @see PIXI.ObservablePoint#copyFrom
     */
    PIXI.ObservablePoint.prototype.copy = function copy(p)
    {
        deprecation(v5, 'PIXI.ObservablePoint.copy has been replaced with PIXI.ObservablePoint#copyFrom');

        return this.copyFrom(p);
    };

    /**
     * @method PIXI.Rectangle#copy
     * @deprecated since 5.0.0
     * @see PIXI.Rectangle#copyFrom
     */
    PIXI.Rectangle.prototype.copy = function copy(p)
    {
        deprecation(v5, 'PIXI.Rectangle.copy has been replaced with PIXI.Rectangle#copyFrom');

        return this.copyFrom(p);
    };

    /**
     * @method PIXI.Matrix#copy
     * @deprecated since 5.0.0
     * @see PIXI.Matrix#copyTo
     */
    PIXI.Matrix.prototype.copy = function copy(p)
    {
        deprecation(v5, 'PIXI.Matrix.copy has been replaced with PIXI.Matrix#copyTo');

        return this.copyTo(p);
    };

    Object.assign(PIXI.systems.FilterSystem.prototype, {
        /**
         * @method PIXI.FilterManager#getRenderTarget
         * @deprecated since 5.0.0
         * @see PIXI.systems.FilterSystem#getFilterTexture
         */
        getRenderTarget(clear, resolution)
        {
            deprecation(v5, 'FilterManager#getRenderTarget has been replaced with FilterSystem#getFilterTexture');

            return this.getFilterTexture(resolution);
        },

        /**
         * @method PIXI.FilterManager#returnRenderTarget
         * @deprecated since 5.0.0
         * @see PIXI.systems.FilterSystem#returnFilterTexture
         */
        returnRenderTarget(renderTexture)
        {
            deprecation(v5, 'FilterManager#returnRenderTarget has been replaced with FilterSystem#returnFilterTexture');

            this.returnFilterTexture(renderTexture);
        },
    });

    Object.defineProperties(PIXI.RenderTexture.prototype, {
        /**
         * @name PIXI.RenderTexture#sourceFrame
         * @type {PIXI.Rectangle}
         * @deprecated since 5.0.0
         * @readonly
         */
        sourceFrame: {
            get()
            {
                deprecation(v5, 'PIXI.RenderTexture#sourceFrame has been removed');

                return this.filterFrame;
            },
        },
        /**
         * @name PIXI.RenderTexture#size
         * @type {PIXI.Rectangle}
         * @deprecated since 5.0.0
         * @readonly
         */
        size: {
            get()
            {
                deprecation(v5, 'PIXI.RenderTexture#size has been removed');

                return this._frame;
            },
        },
    });

    /**
     * @class BlurXFilter
     * @memberof PIXI.filters
     * @deprecated since 5.0.0
     * @see PIXI.filters.BlurFilterPass
     */
    class BlurXFilter extends PIXI.filters.BlurFilterPass
    {
        constructor(strength, quality, resolution, kernelSize)
        {
            deprecation(v5, 'PIXI.filters.BlurXFilter is deprecated, use PIXI.filters.BlurFilterPass');

            super(true, strength, quality, resolution, kernelSize);
        }
    }

    /**
     * @class BlurYFilter
     * @memberof PIXI.filters
     * @deprecated since 5.0.0
     * @see PIXI.filters.BlurFilterPass
     */
    class BlurYFilter extends PIXI.filters.BlurFilterPass
    {
        constructor(strength, quality, resolution, kernelSize)
        {
            deprecation(v5, 'PIXI.filters.BlurYFilter is deprecated, use PIXI.filters.BlurFilterPass');

            super(false, strength, quality, resolution, kernelSize);
        }
    }

    Object.assign(PIXI.filters, {
        BlurXFilter,
        BlurYFilter,
    });

    const { Sprite, Texture } = PIXI;

    // Use these to deprecate all the Sprite from* methods
    function spriteFrom(name, source, crossorigin, scaleMode)
    {
        deprecation(v5, `PIXI.Sprite.${name} is deprecated, use PIXI.Sprite.from`);

        return Sprite.from(source, {
            resourceOptions: {
                scale: scaleMode,
                crossorigin,
            },
        });
    }

    /**
     * @deprecated since 5.0.0
     * @see PIXI.Sprite.from
     * @method PIXI.Sprite.fromImage
     * @return {PIXI.Sprite}
     */
    Sprite.fromImage = spriteFrom.bind(null, 'fromImage');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromSVG
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    Sprite.fromSVG = spriteFrom.bind(null, 'fromSVG');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromCanvas
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    Sprite.fromCanvas = spriteFrom.bind(null, 'fromCanvas');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromVideo
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    Sprite.fromVideo = spriteFrom.bind(null, 'fromVideo');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromFrame
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    Sprite.fromFrame = spriteFrom.bind(null, 'fromFrame');

    // Use these to deprecate all the Texture from* methods
    function textureFrom(name, source, crossorigin, scaleMode)
    {
        deprecation(v5, `PIXI.Texture.${name} is deprecated, use PIXI.Texture.from`);

        return Texture.from(source, {
            resourceOptions: {
                scale: scaleMode,
                crossorigin,
            },
        });
    }

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromImage
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    Texture.fromImage = textureFrom.bind(null, 'fromImage');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromSVG
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    Texture.fromSVG = textureFrom.bind(null, 'fromSVG');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromCanvas
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    Texture.fromCanvas = textureFrom.bind(null, 'fromCanvas');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromVideo
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    Texture.fromVideo = textureFrom.bind(null, 'fromVideo');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromFrame
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    Texture.fromFrame = textureFrom.bind(null, 'fromFrame');

    /**
     * @deprecated since 5.0.0
     * @member {boolean} PIXI.AbstractRenderer#autoResize
     * @see PIXI.AbstractRenderer#autoDensity
     */
    Object.defineProperty(PIXI.AbstractRenderer.prototype, 'autoResize', {
        get()
        {
            deprecation(v5, 'PIXI.AbstractRenderer autoResize is deprecated, use autoDensity');

            return this.autoDensity;
        },
        set(value)
        {
            deprecation(v5, 'PIXI.AbstractRenderer autoResize is deprecated, use autoDensity');

            this.autoDensity = value;
        },
    });
}
