import { deprecation } from '@pixi/utils';
import type {
    FilterSystem,
    Renderer,
    ImageSource,
    BaseTexture,
    RenderTexture,
    Texture,
    State,
    AbstractRenderer,
    StateSystem,
    SVGResource,
    ImageResource,
    BaseImageResource
} from '@pixi/core';
import type { DisplayObject, Container } from '@pixi/display';
import type { TilingSprite } from '@pixi/sprite-tiling';
import type {
    Point,
    ObservablePoint,
    IPoint,
    Rectangle,
    Transform,
    groupD8,
    Matrix } from '@pixi/math';
import type { InteractionManager, InteractionData, InteractionEvent } from '@pixi/interaction';
import type { AccessibilityManager } from '@pixi/accessibility';
import type { Ticker } from '@pixi/ticker';
import type { Graphics, GraphicsData } from '@pixi/graphics';
import type { Sprite } from '@pixi/sprite';
import type { BitmapText, BitmapFontLoader } from '@pixi/text-bitmap';
import type { CanvasRenderTarget } from '@pixi/utils';
import type { Loader, LoaderResource } from '@pixi/loaders';
import type { BasePrepare, Prepare } from '@pixi/prepare';
import type { Extract } from '@pixi/extract';
import type { AnimatedSprite } from '@pixi/sprite-animated';
import type { Mesh } from '@pixi/mesh';
import type { ParticleContainer } from '@pixi/particles';
import type { SpritesheetLoader } from '@pixi/spritesheet';
import type {
    SimpleRope,
    NineSlicePlane,
    SimpleMesh,
    SimplePlane } from '@pixi/mesh-extras';

const v5 = '5.0.0';

// Canvas deprecations needs to get moved
// to the legacy package, but for now, we'll
// ad this reminder
type $FixLegacy = any;

/**
 * Deprecations (backward compatibilities) are automatically applied for browser bundles
 * in the UMD module format. If using Webpack or Rollup, you'll need to apply these
 * deprecations manually by doing something like this:
 * @example
 * import * as PIXI from 'pixi.js';
 * PIXI.useDeprecated(); // MUST be bound to namespace
 * @memberof PIXI
 * @function useDeprecated
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useDeprecated(this: any): void
{
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const PIXI = this;

    Object.defineProperties(PIXI, {
        /**
         * @constant {RegExp|string} SVG_SIZE
         * @memberof PIXI
         * @see PIXI.SVGResource.SVG_SIZE
         * @deprecated since 5.0.0
         */
        SVG_SIZE: {
            get(): RegExp
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.utils.SVG_SIZE property has moved to PIXI.SVGResource.SVG_SIZE');
                // #endif

                return PIXI.SVGResource.SVG_SIZE;
            },
        },

        /**
         * @class PIXI.TransformStatic
         * @deprecated since 5.0.0
         * @see PIXI.Transform
         */
        TransformStatic: {
            get(): Transform
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.TransformStatic class has been removed, use PIXI.Transform');
                // #endif

                return PIXI.Transform;
            },
        },

        /**
         * @class PIXI.TransformBase
         * @deprecated since 5.0.0
         * @see PIXI.Transform
         */
        TransformBase: {
            get(): Transform
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.TransformBase class has been removed, use PIXI.Transform');
                // #endif

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
         * @enum {number}
         * @deprecated since 5.0.0
         * @property {number} STATIC
         * @property {number} DYNAMIC
         */
        TRANSFORM_MODE: {
            get(): {[name: string]: number}
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.TRANSFORM_MODE property has been removed');
                // #endif

                return { STATIC: 0, DYNAMIC: 1 };
            },
        },

        /**
         * @class PIXI.WebGLRenderer
         * @see PIXI.Renderer
         * @deprecated since 5.0.0
         */
        WebGLRenderer: {
            get(): typeof Renderer
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.WebGLRenderer class has moved to PIXI.Renderer');
                // #endif

                return PIXI.Renderer;
            },
        },

        /**
         * @class PIXI.CanvasRenderTarget
         * @see PIXI.utils.CanvasRenderTarget
         * @deprecated since 5.0.0
         */
        CanvasRenderTarget: {
            get(): CanvasRenderTarget
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.CanvasRenderTarget class has moved to PIXI.utils.CanvasRenderTarget');
                // #endif

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
            get(): Loader
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.loader instance has moved to PIXI.Loader.shared');
                // #endif

                return PIXI.Loader.shared;
            },
        },

        /**
         * @class PIXI.FilterManager
         * @see PIXI.FilterSystem
         * @deprecated since 5.0.0
         */
        FilterManager: {
            get(): FilterSystem
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.FilterManager class has moved to PIXI.FilterSystem');
                // #endif

                return PIXI.FilterSystem;
            },
        },

        /**
         * @namespace PIXI.CanvasTinter
         * @see PIXI.canvasUtils
         * @deprecated since 5.2.0
         */
        CanvasTinter: {
            get(): $FixLegacy
            {
                // #if _DEBUG
                deprecation('5.2.0', 'PIXI.CanvasTinter namespace has moved to PIXI.canvasUtils');
                // #endif

                return PIXI.canvasUtils;
            },
        },

        /**
         * @namespace PIXI.GroupD8
         * @see PIXI.groupD8
         * @deprecated since 5.2.0
         */
        GroupD8: {
            get(): typeof groupD8
            {
                // #if _DEBUG
                deprecation('5.2.0', 'PIXI.GroupD8 namespace has moved to PIXI.groupD8');
                // #endif

                return PIXI.groupD8;
            },
        },
    });

    /**
     * @memberof PIXI
     * @namespace accessibility
     * @see PIXI
     * @deprecated since 5.3.0
     */
    PIXI.accessibility = {};

    Object.defineProperties(PIXI.accessibility, {
        /**
         * @memberof PIXI.accessibility
         * @class AccessibilityManager
         * @deprecated since 5.3.0
         * @see PIXI.AccessibilityManager
         */
        AccessibilityManager: {
            get(): typeof AccessibilityManager
            {
                // #if _DEBUG
                deprecation('5.3.0', 'PIXI.accessibility.AccessibilityManager moved to PIXI.AccessibilityManager');
                // #endif

                return PIXI.AccessibilityManager;
            },
        },
    });

    /**
     * @memberof PIXI
     * @namespace resources
     * @see PIXI
     * @deprecated since 5.4.0
     */
    Object.defineProperty(PIXI, 'resources', {
        get(): typeof PIXI
        {
            // #if _DEBUG
            deprecation('5.4.0', 'PIXI.resources.* has moved to PIXI.*');
            // #endif

            return PIXI;
        },
    });

    /**
     * @memberof PIXI
     * @namespace systems
     * @see PIXI
     * @deprecated since 5.4.0
     */
    Object.defineProperty(PIXI, 'systems', {
        get(): typeof PIXI
        {
            // #if _DEBUG
            deprecation('5.4.0', 'PIXI.systems.* has moved to PIXI.*');
            // #endif

            return PIXI;
        },
    });

    /**
     * @namespace PIXI.interaction
     * @see PIXI
     * @deprecated since 5.3.0
     */
    PIXI.interaction = {};

    Object.defineProperties(PIXI.interaction, {
        /**
         * @class PIXI.interaction.InteractionManager
         * @deprecated since 5.3.0
         * @see PIXI.InteractionManager
         */
        InteractionManager: {
            get(): typeof InteractionManager
            {
                // #if _DEBUG
                deprecation('5.3.0', 'PIXI.interaction.InteractionManager moved to PIXI.InteractionManager');
                // #endif

                return PIXI.InteractionManager;
            },
        },

        /**
         * @class PIXI.interaction.InteractionData
         * @deprecated since 5.3.0
         * @see PIXI.InteractionData
         */
        InteractionData: {
            get(): typeof InteractionData
            {
                // #if _DEBUG
                deprecation('5.3.0', 'PIXI.interaction.InteractionData moved to PIXI.InteractionData');
                // #endif

                return PIXI.InteractionData;
            },
        },

        /**
         * @class PIXI.interaction.InteractionEvent
         * @deprecated since 5.3.0
         * @see PIXI.InteractionEvent
         */
        InteractionEvent: {
            get(): typeof InteractionEvent
            {
                // #if _DEBUG
                deprecation('5.3.0', 'PIXI.interaction.InteractionEvent moved to PIXI.InteractionEvent');
                // #endif

                return PIXI.InteractionEvent;
            },
        },
    });

    /**
     * @namespace PIXI.prepare
     * @see PIXI
     * @deprecated since 5.2.1
     */
    PIXI.prepare = {};

    Object.defineProperties(PIXI.prepare, {
        /**
         * @class PIXI.prepare.BasePrepare
         * @deprecated since 5.2.1
         * @see PIXI.BasePrepare
         */
        BasePrepare: {
            get(): typeof BasePrepare
            {
                // #if _DEBUG
                deprecation('5.2.1', 'PIXI.prepare.BasePrepare moved to PIXI.BasePrepare');
                // #endif

                return PIXI.BasePrepare;
            },
        },
        /**
         * @class PIXI.prepare.Prepare
         * @deprecated since 5.2.1
         * @see PIXI.Prepare
         */
        Prepare: {
            get(): typeof Prepare
            {
                // #if _DEBUG
                deprecation('5.2.1', 'PIXI.prepare.Prepare moved to PIXI.Prepare');
                // #endif

                return PIXI.Prepare;
            },
        },
        /**
         * @class PIXI.prepare.CanvasPrepare
         * @deprecated since 5.2.1
         * @see PIXI.CanvasPrepare
         */
        CanvasPrepare: {
            get(): $FixLegacy
            {
                // #if _DEBUG
                deprecation('5.2.1', 'PIXI.prepare.CanvasPrepare moved to PIXI.CanvasPrepare');
                // #endif

                return PIXI.CanvasPrepare;
            },
        },
    });

    /**
     * @namespace PIXI.extract
     * @see PIXI
     * @deprecated since 5.2.1
     */
    PIXI.extract = {};

    Object.defineProperties(PIXI.extract, {
        /**
         * @class PIXI.extract.Extract
         * @deprecated since 5.2.1
         * @see PIXI.Extract
         */
        Extract: {
            get(): typeof Extract
            {
                // #if _DEBUG
                deprecation('5.2.1', 'PIXI.extract.Extract moved to PIXI.Extract');
                // #endif

                return PIXI.Extract;
            },
        },
        /**
         * @class PIXI.extract.CanvasExtract
         * @deprecated since 5.2.1
         * @see PIXI.CanvasExtract
         */
        CanvasExtract: {
            get(): $FixLegacy
            {
                // #if _DEBUG
                deprecation('5.2.1', 'PIXI.extract.CanvasExtract moved to PIXI.CanvasExtract');
                // #endif

                return PIXI.CanvasExtract;
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
            get(): typeof TilingSprite
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.extras.TilingSprite class has moved to PIXI.TilingSprite');
                // #endif

                return PIXI.TilingSprite;
            },
        },
        /**
         * @class PIXI.extras.TilingSpriteRenderer
         * @see PIXI.TilingSpriteRenderer
         * @deprecated since 5.0.0
         */
        TilingSpriteRenderer: {
            get(): $FixLegacy
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.extras.TilingSpriteRenderer class has moved to PIXI.TilingSpriteRenderer');
                // #endif

                return PIXI.TilingSpriteRenderer;
            },
        },
        /**
         * @class PIXI.extras.AnimatedSprite
         * @see PIXI.AnimatedSprite
         * @deprecated since 5.0.0
         */
        AnimatedSprite: {
            get(): typeof AnimatedSprite
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.extras.AnimatedSprite class has moved to PIXI.AnimatedSprite');
                // #endif

                return PIXI.AnimatedSprite;
            },
        },
        /**
         * @class PIXI.extras.BitmapText
         * @see PIXI.BitmapText
         * @deprecated since 5.0.0
         */
        BitmapText: {
            get(): typeof BitmapText
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.extras.BitmapText class has moved to PIXI.BitmapText');
                // #endif

                return PIXI.BitmapText;
            },
        },
    });

    /**
     * @static
     * @method PIXI.TilingSprite.fromFrame
     * @deprecated since 5.3.0
     * @see PIXI.TilingSprite.from
     */
    PIXI.TilingSprite.fromFrame = function fromFrame(frameId: string, width: number, height: number): TilingSprite
    {
        // #if _DEBUG
        deprecation('5.3.0', 'TilingSprite.fromFrame is deprecated, use TilingSprite.from');
        // #endif

        return PIXI.TilingSprite.from(frameId, { width, height });
    };

    /**
     * @static
     * @method PIXI.TilingSprite.fromImage
     * @deprecated since 5.3.0
     * @see PIXI.TilingSprite.from
     */
    PIXI.TilingSprite.fromImage = function fromImage(
        imageId: string,
        width: number,
        height: number,
        options: any = {}): TilingSprite
    {
        // #if _DEBUG
        deprecation('5.3.0', 'TilingSprite.fromImage is deprecated, use TilingSprite.from');
        // #endif

        // Fallback support for crossorigin, scaleMode parameters
        if (options && typeof options !== 'object')
        {
            options = {
                // eslint-disable-next-line prefer-rest-params
                scaleMode: arguments[4],
                resourceOptions: {
                    // eslint-disable-next-line prefer-rest-params
                    crossorigin: arguments[3],
                },
            };
        }

        options.width = width;
        options.height = height;

        return PIXI.TilingSprite.from(imageId, options);
    };

    Object.defineProperties(PIXI.utils, {
        /**
         * @function PIXI.utils.getSvgSize
         * @see PIXI.SVGResource.getSize
         * @deprecated since 5.0.0
         */
        getSvgSize: {
            get(): typeof SVGResource.getSize
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.utils.getSvgSize function has moved to PIXI.SVGResource.getSize');
                // #endif

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
         * @see PIXI.SimpleMesh
         * @deprecated since 5.0.0
         */
        Mesh: {
            get(): typeof SimpleMesh
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.mesh.Mesh class has moved to PIXI.SimpleMesh');
                // #endif

                return PIXI.SimpleMesh;
            },
        },
        /**
         * @class PIXI.mesh.NineSlicePlane
         * @see PIXI.NineSlicePlane
         * @deprecated since 5.0.0
         */
        NineSlicePlane: {
            get(): typeof NineSlicePlane
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.mesh.NineSlicePlane class has moved to PIXI.NineSlicePlane');
                // #endif

                return PIXI.NineSlicePlane;
            },
        },
        /**
         * @class PIXI.mesh.Plane
         * @see PIXI.SimplePlane
         * @deprecated since 5.0.0
         */
        Plane: {
            get(): typeof SimplePlane
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.mesh.Plane class has moved to PIXI.SimplePlane');
                // #endif

                return PIXI.SimplePlane;
            },
        },
        /**
         * @class PIXI.mesh.Rope
         * @see PIXI.SimpleRope
         * @deprecated since 5.0.0
         */
        Rope: {
            get(): typeof SimpleRope
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.mesh.Rope class has moved to PIXI.SimpleRope');
                // #endif

                return PIXI.SimpleRope;
            },
        },
        /**
         * @class PIXI.mesh.RawMesh
         * @see PIXI.Mesh
         * @deprecated since 5.0.0
         */
        RawMesh: {
            get(): typeof Mesh
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.mesh.RawMesh class has moved to PIXI.Mesh');
                // #endif

                return PIXI.Mesh;
            },
        },
        /**
         * @class PIXI.mesh.CanvasMeshRenderer
         * @see PIXI.CanvasMeshRenderer
         * @deprecated since 5.0.0
         */
        CanvasMeshRenderer: {
            get(): $FixLegacy
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.mesh.CanvasMeshRenderer class has moved to PIXI.CanvasMeshRenderer');
                // #endif

                return PIXI.CanvasMeshRenderer;
            },
        },
        /**
         * @class PIXI.mesh.MeshRenderer
         * @see PIXI.MeshRenderer
         * @deprecated since 5.0.0
         */
        MeshRenderer: {
            get(): $FixLegacy
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.mesh.MeshRenderer class has moved to PIXI.MeshRenderer');
                // #endif

                return PIXI.MeshRenderer;
            },
        },
    });

    /**
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
            get(): typeof ParticleContainer
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.particles.ParticleContainer class has moved to PIXI.ParticleContainer');
                // #endif

                return PIXI.ParticleContainer;
            },
        },
        /**
         * @class PIXI.particles.ParticleRenderer
         * @deprecated since 5.0.0
         * @see PIXI.ParticleRenderer
         */
        ParticleRenderer: {
            get(): $FixLegacy
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.particles.ParticleRenderer class has moved to PIXI.ParticleRenderer');
                // #endif

                return PIXI.ParticleRenderer;
            },
        },
    });

    /**
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
            get(): typeof Ticker
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.ticker.Ticker class has moved to PIXI.Ticker');
                // #endif

                return PIXI.Ticker;
            },
        },
        /**
         * @name shared
         * @memberof PIXI.ticker
         * @type {PIXI.Ticker}
         * @deprecated since 5.0.0
         * @see PIXI.Ticker.shared
         */
        shared: {
            get(): Ticker
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.ticker.shared instance has moved to PIXI.Ticker.shared');
                // #endif

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
            get(): typeof Loader
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.loaders.Loader class has moved to PIXI.Loader');
                // #endif

                return PIXI.Loader;
            },
        },
        /**
         * @class PIXI.loaders.Resource
         * @see PIXI.LoaderResource
         * @deprecated since 5.0.0
         */
        Resource: {
            get(): typeof LoaderResource
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.loaders.Resource class has moved to PIXI.LoaderResource');
                // #endif

                return PIXI.LoaderResource;
            },
        },
        /**
         * @function PIXI.loaders.bitmapFontParser
         * @see PIXI.BitmapFontLoader.use
         * @deprecated since 5.0.0
         */
        bitmapFontParser: {
            get(): typeof BitmapFontLoader.use
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.loaders.bitmapFontParser function has moved to PIXI.BitmapFontLoader.use');
                // #endif

                return PIXI.BitmapFontLoader.use;
            },
        },
        /**
         * @function PIXI.loaders.parseBitmapFontData
         * @deprecated since 5.0.0
         */
        parseBitmapFontData: {
            get(): void
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.loaders.parseBitmapFontData function has removed');
                // #endif
            },
        },
        /**
         * @function PIXI.loaders.spritesheetParser
         * @see PIXI.SpritesheetLoader.use
         * @deprecated since 5.0.0
         */
        spritesheetParser: {
            get(): typeof SpritesheetLoader.use
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.loaders.spritesheetParser function has moved to PIXI.SpritesheetLoader.use');
                // #endif

                return PIXI.SpritesheetLoader.use;
            },
        },
        /**
         * @function PIXI.loaders.getResourcePath
         * @see PIXI.SpritesheetLoader.getResourcePath
         * @deprecated since 5.0.0
         */
        getResourcePath: {
            get(): typeof SpritesheetLoader.getResourcePath
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.loaders.getResourcePath property has moved to PIXI.SpritesheetLoader.getResourcePath');
                // #endif

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
    PIXI.Loader.addPixiMiddleware = function addPixiMiddleware(middleware: any): typeof Loader
    {
        // #if _DEBUG
        deprecation(v5,
            'PIXI.loaders.Loader.addPixiMiddleware function is deprecated, use PIXI.loaders.Loader.registerPlugin'
        );
        // #endif

        return PIXI.loaders.Loader.registerPlugin({ use: middleware() });
    };

    // convenience for converting event name to signal name
    const eventToSignal = (event: any): string =>
        `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;

    Object.assign(PIXI.Loader.prototype,
        {
            /**
             * Use the corresponding signal, e.g., event `start`` is signal `onStart`.
             * @method PIXI.Loader#on
             * @deprecated since 5.0.0
             */
            on(event: any)
            {
                const signal = eventToSignal(event);

                // #if _DEBUG
                deprecation(v5, `PIXI.Loader#on is completely deprecated, use PIXI.Loader#${signal}.add`);
                // #endif
            },
            /**
             * Use the corresponding signal, e.g., event `start`` is signal `onStart`.
             * @method PIXI.Loader#once
             * @deprecated since 5.0.0
             */
            once(event: any)
            {
                const signal = eventToSignal(event);

                // #if _DEBUG
                deprecation(v5, `PIXI.Loader#once is completely deprecated, use PIXI.Loader#${signal}.once`);
                // #endif
            },
            /**
             * Use the corresponding signal, e.g., event `start`` is signal `onStart`.
             * @method PIXI.Loader#off
             * @deprecated since 5.0.0
             */
            off(event: any)
            {
                const signal = eventToSignal(event);

                // #if _DEBUG
                deprecation(v5, `PIXI.Loader#off is completely deprecated, use PIXI.Loader#${signal}.detach`);
                // #endif
            },
        });

    /**
     * @class PIXI.extract.WebGLExtract
     * @deprecated since 5.0.0
     * @see PIXI.Extract
     */
    Object.defineProperty(PIXI.extract, 'WebGLExtract', {
        get(): typeof Extract
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.extract.WebGLExtract method has moved to PIXI.Extract');
            // #endif

            return PIXI.Extract;
        },
    });

    /**
     * @class PIXI.prepare.WebGLPrepare
     * @deprecated since 5.0.0
     * @see PIXI.Prepare
     */
    Object.defineProperty(PIXI.prepare, 'WebGLPrepare', {
        get(): typeof Prepare
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.prepare.WebGLPrepare class has moved to PIXI.Prepare');
            // #endif

            return PIXI.Prepare;
        },
    });

    /**
     * @method PIXI.Container#_renderWebGL
     * @private
     * @deprecated since 5.0.0
     * @see PIXI.Container#render
     * @param {PIXI.Renderer} renderer - Instance of renderer
     */
    PIXI.Container.prototype._renderWebGL = function _renderWebGL(this: Container, renderer: Renderer): void
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.Container._renderWebGL method has moved to PIXI.Container._render');
        // #endif

        this._render(renderer);
    };

    /**
     * @memberof PIXI.Container#
     * @method renderWebGL
     * @deprecated since 5.0.0
     * @see PIXI.Container#render
     * @param {PIXI.Renderer} renderer - Instance of renderer
     */
    PIXI.Container.prototype.renderWebGL = function renderWebGL(this: Container, renderer: Renderer): void
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.Container.renderWebGL method has moved to PIXI.Container.render');
        // #endif

        this.render(renderer);
    };

    /**
     * @memberof PIXI.DisplayObject#
     * @method renderWebGL
     * @deprecated since 5.0.0
     * @see PIXI.DisplayObject#render
     * @param {PIXI.Renderer} renderer - Instance of renderer
     */
    PIXI.DisplayObject.prototype.renderWebGL = function renderWebGL(this: DisplayObject, renderer: Renderer): void
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.DisplayObject.renderWebGL method has moved to PIXI.DisplayObject.render');
        // #endif

        this.render(renderer);
    };

    /**
     * @method PIXI.Container#renderAdvancedWebGL
     * @deprecated since 5.0.0
     * @see PIXI.Container#renderAdvanced
     * @param {PIXI.Renderer} renderer - Instance of renderer
     */
    PIXI.Container.prototype.renderAdvancedWebGL = function renderAdvancedWebGL(this: Container, renderer: Renderer): void
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.Container.renderAdvancedWebGL method has moved to PIXI.Container.renderAdvanced');
        // #endif

        this.renderAdvanced(renderer);
    };

    Object.defineProperties(PIXI.settings, {
        /**
         * Default transform type.
         *
         * @static
         * @deprecated since 5.0.0
         * @memberof PIXI.settings
         * @member {PIXI.TRANSFORM_MODE}
         * @default PIXI.TRANSFORM_MODE.STATIC
         */
        TRANSFORM_MODE: {
            get(): number
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.settings.TRANSFORM_MODE property has been removed');
                // #endif

                return 0;
            },
            set(): void
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.settings.TRANSFORM_MODE property has been removed');
                // #endif
            },
        },
    });

    const { BaseTexture: BaseTextureAny } = PIXI;

    /**
     * @method loadSource
     * @memberof PIXI.BaseTexture#
     * @deprecated since 5.0.0
     */
    BaseTextureAny.prototype.loadSource = function loadSource(image: string | HTMLImageElement): void
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.BaseTexture.loadSource method has been deprecated');
        // #endif

        const resource = PIXI.autoDetectResource(image);

        resource.internal = true;

        this.setResource(resource);
        this.update();
    };

    let baseTextureIdDeprecation = false;

    Object.defineProperties(BaseTextureAny.prototype, {
        /**
         * @name hasLoaded
         * @memberof PIXI.BaseTexture#
         * @type {boolean}
         * @deprecated since 5.0.0
         * @readonly
         * @see PIXI.BaseTexture#valid
         */
        hasLoaded: {
            get(): boolean
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.BaseTexture.hasLoaded property has been removed, use PIXI.BaseTexture.valid');
                // #endif

                return this.valid;
            },
        },
        /**
         * @name imageUrl
         * @memberof PIXI.BaseTexture#
         * @type {string}
         * @deprecated since 5.0.0
         * @see PIXI.ImageResource#url
         */
        imageUrl: {
            get(this: BaseTexture): string
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.BaseTexture.imageUrl property has been removed, use PIXI.BaseTexture.resource.url');
                // #endif

                return (this.resource as ImageResource)?.url;
            },

            set(this: BaseTexture, imageUrl: string): void
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.BaseTexture.imageUrl property has been removed, use PIXI.BaseTexture.resource.url');
                // #endif

                if (this.resource)
                {
                    (this.resource as ImageResource).url = imageUrl;
                }
            },
        },
        /**
         * @name source
         * @memberof PIXI.BaseTexture#
         * @type {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|SVGElement}
         * @deprecated since 5.0.0
         * @readonly
         * @see PIXI.BaseImageResource#source
         */
        source: {
            get(this: BaseTexture): ImageSource
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.BaseTexture.source property has been moved, use `PIXI.BaseTexture.resource.source`');
                // #endif

                return (this.resource as BaseImageResource).source;
            },
            set(this: BaseTexture, source: ImageSource): void
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.BaseTexture.source property has been moved, use `PIXI.BaseTexture.resource.source` '
                    + 'if you want to set HTMLCanvasElement. Otherwise, create new BaseTexture.');
                // #endif

                if (this.resource)
                {
                    (this.resource as BaseImageResource).source = source;
                }
            },
        },

        /**
         * @name premultiplyAlpha
         * @memberof PIXI.BaseTexture#
         * @type {boolean}
         * @deprecated since 5.2.0
         * @readonly
         * @see PIXI.BaseTexture#alphaMode
         */
        premultiplyAlpha: {
            get(this: BaseTexture): boolean
            {
                // #if _DEBUG
                deprecation('5.2.0', 'PIXI.BaseTexture.premultiplyAlpha property has been changed to `alphaMode`'
                    + ', see `PIXI.ALPHA_MODES`');
                // #endif

                return this.alphaMode !== 0;
            },
            set(this: BaseTexture, value: boolean): void
            {
                // #if _DEBUG
                deprecation('5.2.0', 'PIXI.BaseTexture.premultiplyAlpha property has been changed to `alphaMode`'
                    + ', see `PIXI.ALPHA_MODES`');
                // #endif

                this.alphaMode = Number(value);
            },
        },
        /**
         * Batch local field, stores current texture location
         *
         * @name _id
         * @memberof PIXI.BaseTexture#
         * @deprecated since 5.2.0
         * @type {number}
         * @see PIXI.BaseTexture#_batchLocation
         */
        _id: {
            get(this: BaseTexture): number
            {
                if (!baseTextureIdDeprecation)
                {
                    // #popelyshev: That property was a hot place, I don't want to call deprecation method on it if possible
                    // #if _DEBUG
                    deprecation('5.2.0', 'PIXI.BaseTexture._id batch local field has been changed to `_batchLocation`');
                    // #endif
                    baseTextureIdDeprecation = true;
                }

                return this._batchLocation;
            },
            set(this: BaseTexture, value: number): void
            {
                this._batchLocation = value;
            },
        },
    });

    /**
     * @method fromImage
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTextureAny.fromImage = function fromImage(
        canvas: HTMLCanvasElement,
        crossorigin: string | boolean,
        scaleMode: number,
        scale: number): BaseTexture
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.BaseTexture.fromImage method has been replaced with PIXI.BaseTexture.from');
        // #endif

        const resourceOptions = { scale, crossorigin };

        return BaseTextureAny.from(canvas, { scaleMode, resourceOptions });
    };

    /**
     * @method fromCanvas
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTextureAny.fromCanvas = function fromCanvas(canvas: HTMLCanvasElement, scaleMode: number): BaseTexture
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.BaseTexture.fromCanvas method has been replaced with PIXI.BaseTexture.from');
        // #endif

        return BaseTextureAny.from(canvas, { scaleMode });
    };

    /**
     * @method fromSVG
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTextureAny.fromSVG = function fromSVG(
        canvas: HTMLCanvasElement,
        crossorigin: string | boolean,
        scaleMode: number,
        scale: number): BaseTexture
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.BaseTexture.fromSVG method has been replaced with PIXI.BaseTexture.from');
        // #endif

        const resourceOptions = { scale, crossorigin };

        return BaseTextureAny.from(canvas, { scaleMode, resourceOptions });
    };

    Object.defineProperties(PIXI.ImageResource.prototype, {
        /**
         * @name premultiplyAlpha
         * @memberof PIXI.ImageResource#
         * @type {boolean}
         * @deprecated since 5.2.0
         * @readonly
         * @see PIXI.ImageResource#alphaMode
         */
        premultiplyAlpha: {
            get(this: ImageResource): boolean
            {
                // #if _DEBUG
                deprecation('5.2.0', 'PIXI.ImageResource.premultiplyAlpha property '
                    + 'has been changed to `alphaMode`, see `PIXI.ALPHA_MODES`');
                // #endif

                return this.alphaMode !== 0;
            },
            set(this: ImageResource, value: boolean): void
            {
                // #if _DEBUG
                deprecation('5.2.0', 'PIXI.ImageResource.premultiplyAlpha property '
                    + 'has been changed to `alphaMode`, see `PIXI.ALPHA_MODES`');
                // #endif
                this.alphaMode = Number(value);
            },
        },
    });

    /**
     * @method PIXI.Point#copy
     * @deprecated since 5.0.0
     * @see PIXI.Point#copyFrom
     */
    PIXI.Point.prototype.copy = function copy(this: Point, p: IPoint): Point
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.Point.copy method has been replaced with PIXI.Point.copyFrom');
        // #endif

        return this.copyFrom(p);
    };

    /**
     * @method PIXI.ObservablePoint#copy
     * @deprecated since 5.0.0
     * @see PIXI.ObservablePoint#copyFrom
     */
    PIXI.ObservablePoint.prototype.copy = function copy(this: ObservablePoint, p: IPoint): ObservablePoint
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.ObservablePoint.copy method has been replaced with PIXI.ObservablePoint.copyFrom');
        // #endif

        return this.copyFrom(p);
    };

    /**
     * @method PIXI.Rectangle#copy
     * @deprecated since 5.0.0
     * @see PIXI.Rectangle#copyFrom
     */
    PIXI.Rectangle.prototype.copy = function copy(this: Rectangle, p: Rectangle): Rectangle
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.Rectangle.copy method has been replaced with PIXI.Rectangle.copyFrom');
        // #endif

        return this.copyFrom(p);
    };

    /**
     * @method PIXI.Matrix#copy
     * @deprecated since 5.0.0
     * @see PIXI.Matrix#copyTo
     */
    PIXI.Matrix.prototype.copy = function copy(this: Matrix, p: Matrix): Matrix
    {
        // #if _DEBUG
        deprecation(v5, 'PIXI.Matrix.copy method has been replaced with PIXI.Matrix.copyTo');
        // #endif

        return this.copyTo(p);
    };

    /**
     * @method PIXI.StateSystem#setState
     * @deprecated since 5.1.0
     * @see PIXI.StateSystem#set
     */
    PIXI.StateSystem.prototype.setState = function setState(this: StateSystem, s: State): void
    {
        // #if _DEBUG
        deprecation('v5.1.0', 'StateSystem.setState has been renamed to StateSystem.set');
        // #endif

        return this.set(s);
    };

    Object.assign(PIXI.FilterSystem.prototype, {
        /**
         * @method PIXI.FilterManager#getRenderTarget
         * @deprecated since 5.0.0
         * @see PIXI.FilterSystem#getFilterTexture
         */
        getRenderTarget(this: FilterSystem, _clear: boolean, resolution: number)
        {
            // #if _DEBUG
            deprecation(v5,
                'PIXI.FilterManager.getRenderTarget method has been replaced with PIXI.FilterSystem#getFilterTexture'
            );
            // #endif

            return this.getFilterTexture(null, resolution);
        },

        /**
         * @method PIXI.FilterManager#returnRenderTarget
         * @deprecated since 5.0.0
         * @see PIXI.FilterSystem#returnFilterTexture
         */
        returnRenderTarget(this: FilterSystem, renderTexture: any)
        {
            // #if _DEBUG
            deprecation(v5,
                'PIXI.FilterManager.returnRenderTarget method has been replaced with '
                + 'PIXI.FilterSystem.returnFilterTexture'
            );
            // #endif

            this.returnFilterTexture(renderTexture);
        },

        /**
         * @method PIXI.FilterSystem#calculateScreenSpaceMatrix
         * @deprecated since 5.0.0
         * @param {PIXI.Matrix} outputMatrix - the matrix to output to.
         * @return {PIXI.Matrix} The mapped matrix.
         */
        calculateScreenSpaceMatrix(this: FilterSystem, outputMatrix: any)
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.FilterSystem.calculateScreenSpaceMatrix method is removed, '
                + 'use `(vTextureCoord * inputSize.xy) + outputFrame.xy` instead');
            // #endif

            const mappedMatrix = outputMatrix.identity();
            const { sourceFrame, destinationFrame } = this.activeState;

            mappedMatrix.translate(sourceFrame.x / destinationFrame.width, sourceFrame.y / destinationFrame.height);
            mappedMatrix.scale(destinationFrame.width, destinationFrame.height);

            return mappedMatrix;
        },

        /**
         * @method PIXI.FilterSystem#calculateNormalizedScreenSpaceMatrix
         * @deprecated since 5.0.0
         * @param {PIXI.Matrix} outputMatrix - The matrix to output to.
         * @return {PIXI.Matrix} The mapped matrix.
         */
        calculateNormalizedScreenSpaceMatrix(this: FilterSystem, outputMatrix: Matrix): Matrix
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.FilterManager.calculateNormalizedScreenSpaceMatrix method is removed, '
                + 'use `((vTextureCoord * inputSize.xy) + outputFrame.xy) / outputFrame.zw` instead.');
            // #endif

            const { sourceFrame, destinationFrame } = this.activeState;
            const mappedMatrix = outputMatrix.identity();

            mappedMatrix.translate(sourceFrame.x / destinationFrame.width, sourceFrame.y / destinationFrame.height);

            const translateScaleX = (destinationFrame.width / sourceFrame.width);
            const translateScaleY = (destinationFrame.height / sourceFrame.height);

            mappedMatrix.scale(translateScaleX, translateScaleY);

            return mappedMatrix;
        },
    });

    Object.defineProperties(PIXI.RenderTexture.prototype, {
        /**
         * @name sourceFrame
         * @memberof PIXI.RenderTexture#
         * @type {PIXI.Rectangle}
         * @deprecated since 5.0.0
         * @readonly
         */
        sourceFrame: {
            get(this: RenderTexture): Rectangle
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.RenderTexture.sourceFrame property has been removed');
                // #endif

                return this.filterFrame;
            },
        },
        /**
         * @name size
         * @memberof PIXI.RenderTexture#
         * @type {PIXI.Rectangle}
         * @deprecated since 5.0.0
         * @readonly
         */
        size: {
            get(this: RenderTexture): Rectangle
            {
                // #if _DEBUG
                deprecation(v5, 'PIXI.RenderTexture.size property has been removed');
                // #endif

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
        constructor(strength: number, quality: number, resolution: number, kernelSize: number)
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.filters.BlurXFilter class is deprecated, use PIXI.filters.BlurFilterPass');
            // #endif

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
        constructor(strength: number, quality: number, resolution: number, kernelSize: number)
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.filters.BlurYFilter class is deprecated, use PIXI.filters.BlurFilterPass');
            // #endif

            super(false, strength, quality, resolution, kernelSize);
        }
    }

    Object.assign(PIXI.filters, {
        BlurXFilter,
        BlurYFilter,
    });

    const {
        Sprite: SpriteAny,
        Texture: TextureAny,
        Graphics: GraphicsAny } = PIXI;

    // Support for pixi.js-legacy bifurcation
    // give users a friendly assist to use legacy
    if (!GraphicsAny.prototype.generateCanvasTexture)
    {
        GraphicsAny.prototype.generateCanvasTexture = function generateCanvasTexture(): void
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.Graphics.generateCanvasTexture method is only available in "pixi.js-legacy"');
            // #endif
        };
    }

    /**
     * @deprecated since 5.0.0
     * @member {PIXI.Graphics} PIXI.Graphics#graphicsData
     * @see PIXI.Graphics#geometry
     * @readonly
     */
    Object.defineProperty(GraphicsAny.prototype, 'graphicsData', {
        get(this: Graphics): GraphicsData[]
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.Graphics.graphicsData property is deprecated, use PIXI.Graphics.geometry.graphicsData');
            // #endif

            return this.geometry.graphicsData;
        },
    });

    // Use these to deprecate all the Sprite from* methods
    function spriteFrom(name: string, source: string, crossorigin: string | boolean, scaleMode: number): Sprite
    {
        // #if _DEBUG
        deprecation(v5, `PIXI.Sprite.${name} method is deprecated, use PIXI.Sprite.from`);
        // #endif

        return SpriteAny.from(source, {
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
    SpriteAny.fromImage = spriteFrom.bind(null, 'fromImage');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromSVG
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    SpriteAny.fromSVG = spriteFrom.bind(null, 'fromSVG');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromCanvas
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    SpriteAny.fromCanvas = spriteFrom.bind(null, 'fromCanvas');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromVideo
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    SpriteAny.fromVideo = spriteFrom.bind(null, 'fromVideo');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromFrame
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    SpriteAny.fromFrame = spriteFrom.bind(null, 'fromFrame');

    // Use these to deprecate all the Texture from* methods
    function textureFrom(name: string, source: string, crossorigin: string | boolean, scaleMode: number): Texture
    {
        // #if _DEBUG
        deprecation(v5, `PIXI.Texture.${name} method is deprecated, use PIXI.Texture.from`);
        // #endif

        return TextureAny.from(source, {
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
    TextureAny.fromImage = textureFrom.bind(null, 'fromImage');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromSVG
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    TextureAny.fromSVG = textureFrom.bind(null, 'fromSVG');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromCanvas
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    TextureAny.fromCanvas = textureFrom.bind(null, 'fromCanvas');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromVideo
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    TextureAny.fromVideo = textureFrom.bind(null, 'fromVideo');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromFrame
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    TextureAny.fromFrame = textureFrom.bind(null, 'fromFrame');

    /**
     * @deprecated since 5.0.0
     * @member {boolean} PIXI.AbstractRenderer#autoResize
     * @see PIXI.AbstractRenderer#autoDensity
     */
    Object.defineProperty(PIXI.AbstractRenderer.prototype, 'autoResize', {
        get(this: AbstractRenderer): boolean
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.AbstractRenderer.autoResize property is deprecated, '
                + 'use PIXI.AbstractRenderer.autoDensity');
            // #endif

            return this.autoDensity;
        },
        set(this: any, value: boolean): void
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.AbstractRenderer.autoResize property is deprecated, '
                + 'use PIXI.AbstractRenderer.autoDensity');
            // #endif

            this.autoDensity = value;
        },
    });

    /**
     * @deprecated since 5.0.0
     * @member {PIXI.TextureSystem} PIXI.Renderer#textureManager
     * @see PIXI.Renderer#texture
     */
    Object.defineProperty(PIXI.Renderer.prototype, 'textureManager', {
        get(this: Renderer)
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.Renderer.textureManager property is deprecated, use PIXI.Renderer.texture');
            // #endif

            return this.texture;
        },
    });

    /**
     * @namespace PIXI.utils.mixins
     * @deprecated since 5.0.0
     */
    PIXI.utils.mixins = {
        /**
         * @memberof PIXI.utils.mixins
         * @function mixin
         * @deprecated since 5.0.0
         */
        mixin(): void
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.utils.mixins.mixin function is no longer available');
            // #endif
        },
        /**
         * @memberof PIXI.utils.mixins
         * @function delayMixin
         * @deprecated since 5.0.0
         */
        delayMixin(): void
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.utils.mixins.delayMixin function is no longer available');
            // #endif
        },
        /**
         * @memberof PIXI.utils.mixins
         * @function performMixins
         * @deprecated since 5.0.0
         */
        performMixins(): void
        {
            // #if _DEBUG
            deprecation(v5, 'PIXI.utils.mixins.performMixins function is no longer available');
            // #endif
        },
    };

    /**
     * @memberof PIXI.BitmapText
     * @member {object} font
     * @deprecated since 5.3.0
     */
    Object.defineProperty(PIXI.BitmapText.prototype, 'font', {
        get(this: BitmapText): any
        {
            // #if _DEBUG
            deprecation('5.3.0', 'PIXI.BitmapText.font property is deprecated, '
                + 'use fontName, fontSize, tint or align properties');
            // #endif

            return {
                name: this._fontName,
                size: this._fontSize,
                tint: this._tint,
                align: this._align,
            };
        },
        set(this: BitmapText, value: any)
        {
            // #if _DEBUG
            deprecation('5.3.0', 'PIXI.BitmapText.font property is deprecated, '
                + 'use fontName, fontSize, tint or align properties');
            // #endif

            if (!value)
            {
                return;
            }

            const style: any = { font: value };

            this._upgradeStyle(style);

            style.fontSize = style.fontSize || PIXI.BitmapFont.available[style.fontName].size;

            this._fontName = style.fontName;
            this._fontSize = style.fontSize;

            this.dirty = true;
        },
    });
}
