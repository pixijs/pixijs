declare namespace PIXI {

    // from CONST
    export const VERSION: typeof CONST.VERSION;
    export const PI_2: typeof CONST.PI_2;
    export const RAD_TO_DEG: typeof CONST.RAD_TO_DEG;
    export const DEG_TO_RAD: typeof CONST.DEG_TO_RAD;
    export const ENV: typeof CONST.ENV;
    export const RENDERER_TYPE: typeof CONST.RENDERER_TYPE;
    export const BLEND_MODES: typeof CONST.BLEND_MODES;
    export const DRAW_MODES: typeof CONST.DRAW_MODES;
    export const FORMATS: typeof CONST.FORMATS;
    export const TARGETS: typeof CONST.TARGETS;
    export const TYPES: typeof CONST.TYPES;
    export const SCALE_MODES: typeof CONST.SCALE_MODES;
    export const WRAP_MODES: typeof CONST.WRAP_MODES;
    export const PRECISION: typeof CONST.PRECISION;
    export const GC_MODES: typeof CONST.GC_MODES;
    export const SHAPES: typeof CONST.SHAPES;
    export const TEXT_GRADIENT: typeof CONST.TEXT_GRADIENT;
    export const UPDATE_PRIORITY: typeof CONST.UPDATE_PRIORITY;

    //////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////SETTINGS///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export namespace settings {
        export let TARGET_FPMS: number;
        export let MIPMAP_TEXTURES: boolean;
        export let RESOLUTION: number;
        export let FILTER_RESOLUTION: number;
        export let SPRITE_MAX_TEXTURES: number;
        export let SPRITE_BATCH_SIZE: number;
        export let RETINA_PREFIX: RegExp;
        export const RENDER_OPTIONS: {
            view: HTMLCanvasElement | null,
            antialias: boolean,
            forceFXAA: boolean,
            autoResize: boolean,
            transparent: boolean,
            backgroundColor: number,
            clearBeforeRender: boolean,
            preserveDrawingBuffer: boolean,
            roundPixels: boolean
            width: number,
            height: number,
            legacy: boolean,
        };
        export let PREFER_ENV: string;
        export let GC_MODE: number;
        export let GC_MAX_IDLE: number;
        export let GC_MAX_CHECK_COUNT: number;
        export let WRAP_MODE: number;
        export let SCALE_MODE: number;
        export let PRECISION_VERTEX: string;
        export let PRECISION_FRAGMENT: string;
        export let PRECISION: string;
        export let UPLOADS_PER_FRAME: number;
        export let CAN_UPLOAD_SAME_BUFFER: boolean;
    }

    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////ACCESSIBILITY////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export namespace accessibility {

        // accessibility
        export class AccessibilityManager {

            constructor(renderer: Renderer);

            public activate(): void;

            public deactivate(): void;

            protected div: HTMLElement;
            protected pool: HTMLElement[];
            protected renderId: number;
            debug: boolean;
            renderer: SystemRenderer;
            protected children: AccessibleTarget[];
            protected isActive: boolean;

            protected updateAccessibleObjects(displayObject: DisplayObject): void;

            protected update(): void;

            protected capHitArea(hitArea: HitArea): void;

            protected addChild(displayObject: DisplayObject): void;

            protected _onClick(e: interaction.InteractionEvent): void;

            protected _onFocus(e: interaction.InteractionEvent): void;

            protected _onFocusOut(e: interaction.InteractionEvent): void;

            protected _onKeyDown(e: interaction.InteractionEvent): void;

            protected _onMouseMove(): void;

            destroy(): void;

        }

        export interface AccessibleTarget {

            accessible: boolean;
            accessibleTitle: string | null;
            accessibleHint: string | null;
            tabIndex: number;

        }

    }

    //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////CORE//////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    // const

    export namespace CONST {
        export const VERSION: string;
        export const PI_2: number;
        export const RAD_TO_DEG: number;
        export const DEG_TO_RAD: number;
        export const TARGET_FPMS: number;
        export const ENV: {
            WEBGL_LEGACY: number;
            WEBGL: number;
            WEBGL2: number;
        };
        export const RENDERER_TYPE: {
            UNKNOWN: number;
            WEBGL: number;
            CANVAS: number;
        };
        export const BLEND_MODES: {
            NORMAL: number;
            ADD: number;
            MULTIPLY: number;
            SCREEN: number;
            OVERLAY: number;
            DARKEN: number;
            LIGHTEN: number;
            COLOR_DODGE: number;
            COLOR_BURN: number;
            HARD_LIGHT: number;
            SOFT_LIGHT: number;
            DIFFERENCE: number;
            EXCLUSION: number;
            HUE: number;
            SATURATION: number;
            COLOR: number;
            LUMINOSITY: number;
            NORMAL_NPM: number;
            ADD_NPM: number;
            SCREEN_NPM: number;
        };
        export const DRAW_MODES: {
            POINTS: number;
            LINES: number;
            LINE_LOOP: number;
            LINE_STRIP: number;
            TRIANGLES: number;
            TRIANGLE_STRIP: number;
            TRIANGLE_FAN: number;
        };
        export const FORMATS: {
            RGBA: number;
            RGB: number;
            ALPHA: number;
            LUMINANCE: number;
            LUMINANCE_ALPHA: number;
            DEPTH_COMPONENT: number;
            DEPTH_STENCIL: number;
        };
        export const TARGETS: {
            TEXTURE_2D: number;
            TEXTURE_CUBE_MAP: number;
            TEXTURE_2D_ARRAY: number;
            TEXTURE_CUBE_MAP_POSITIVE_X: number;
            TEXTURE_CUBE_MAP_NEGATIVE_X: number;
            TEXTURE_CUBE_MAP_POSITIVE_Y: number;
            TEXTURE_CUBE_MAP_NEGATIVE_Y: number;
            TEXTURE_CUBE_MAP_POSITIVE_Z: number;
            TEXTURE_CUBE_MAP_NEGATIVE_Z: number;
        };
        export const TYPES: {
            UNSIGNED_BYTE: number;
            UNSIGNED_SHORT: number;
            UNSIGNED_SHORT_5_6_5: number;
            UNSIGNED_SHORT_4_4_4_4: number;
            UNSIGNED_SHORT_5_5_5_1: number;
            FLOAT: number;
            HALF_FLOAT: number;
        };
        export const SCALE_MODES: {
            LINEAR: number,
            NEAREST: number
        };
        export const GC_MODES: {
            AUTO: number;
            MANUAL: number;
        };
        export const WRAP_MODES: {
            CLAMP: number;
            MIRRORED_REPEAT: number;
            REPEAT: number;
        };
        export const DATA_URI: RegExp | string;
        export const SHAPES: {
            POLY: number;
            RECT: number;
            CIRC: number;
            ELIP: number;
            RREC: number;
        };
        export const PRECISION: {
            LOW: string;
            MEDIUM: string;
            HIGH: string;
        };
        export const TEXT_GRADIENT: {
            LINEAR_VERTICAL: number;
            LINEAR_HORIZONTAL: number;
        };
        export const UPDATE_PRIORITY: {
            INTERACTION: number;
            HIGH: number;
            NORMAL: number;
            LOW: number;
            UTILITY: number;
        };

    }

    // display

    export class Application {

        constructor(options?: ApplicationOptions);
        constructor(width?: number, height?: number, options?: ApplicationOptions, noWebGL?: boolean, sharedTicker?: boolean, sharedLoader?: boolean);

        private _ticker: Ticker;

        renderer: PIXI.Renderer;
        stage: Container;
        ticker: Ticker;
        loader: Loader;
        readonly screen: Rectangle;

        stop(): void;

        start(): void;

        render(): void;

        destroy(removeView?: boolean): void;

        readonly view: HTMLCanvasElement;

    }

    export interface DestroyOptions {
        children?: boolean;
        texture?: boolean;
        baseTexture?: boolean;
    }

    export class Bounds {

        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
        rect: Rectangle;

        isEmpty(): boolean;

        clear(): void;

        getRectangle(rect?: Rectangle): Rectangle;

        addPoint(point: Point): void;

        addQuad(vertices: number[]): Bounds | undefined;

        addFrame(transform: Transform, x0: number, y0: number, x1: number, y1: number): void;

        addVertices(transform: Transform, vertices: number[], beginOffset: number, endOffset: number): void;

        addBounds(bounds: Bounds): void;

        addBoundsMask(bounds: Bounds, mask: Bounds): void;

        addBoundsArea(bounds: Bounds, area: Rectangle): void;

    }

    export class Container extends DisplayObject {

        // begin extras.getChildByName
        getChildByName(name: string): DisplayObject;

        // end extras.getChildByName

        children: DisplayObject[];
        width: number;
        height: number;

        protected onChildrenChange: (...args: any[]) => void;

        addChild<T extends DisplayObject>(child: T, ...additionalChildren: DisplayObject[]): T;

        addChildAt<T extends DisplayObject>(child: T, index: number): T;

        swapChildren(child: DisplayObject, child2: DisplayObject): void;

        getChildIndex(child: DisplayObject): number;

        setChildIndex(child: DisplayObject, index: number): void;

        getChildAt(index: number): DisplayObject;

        removeChild(child: DisplayObject): DisplayObject;

        removeChildAt(index: number): DisplayObject;

        removeChildren(beginIndex?: number, endIndex?: number): DisplayObject[];

        updateTransform(): void;

        calculateBounds(): void;

        protected _calculateBounds(): void;

        protected containerUpdateTransform(): void;

        render(renderer: Renderer): void;

        renderAdvancedWebGL(renderer: Renderer): void;

        protected _render(renderer: Renderer): void;

        destroy(options?: DestroyOptions | boolean): void;

        once(event: "added" | "removed", fn: (displayObject: DisplayObject) => void, context?: any): this;
        //tslint:disable-next-line:ban-types forbidden-types
        once(event: string, fn: Function, context?: any): this;

        on(event: "added" | "removed", fn: (displayObject: DisplayObject) => void, context?: any): this;
        //tslint:disable-next-line:ban-types forbidden-types
        on(event: string, fn: Function, context?: any): this;

        //tslint:disable-next-line:ban-types forbidden-types
        off(event: "added" | "removed" | string, fn?: Function, context?: any): this;

    }

    export class DisplayObject extends utils.EventEmitter implements interaction.InteractiveTarget, accessibility.AccessibleTarget {

        // begin extras.cacheAsBitmap
        protected _cacheAsBitmap: boolean;
        protected _cacheData: boolean;
        cacheAsBitmap: boolean;

        protected _renderCached(renderer: Renderer): void;

        protected _initCachedDisplayObject(renderer: Renderer): void;

        protected _calculateCachedBounds(): Rectangle;

        protected _getCachedLocalBounds(): Rectangle;

        protected _destroyCachedDisplayObject(): void;

        protected _cacheAsBitmapDestroy(options: boolean | any): void;

        // end extras.cacheAsBitmap

        // begin extras.getChildByName
        name: string | null;
        // end extras.getChildByName

        // begin extras.getGlobalPosition
        getGlobalPosition(point?: Point, skipUpdate?: boolean): Point;

        // end extras.getGlobalPosition

        // begin accessible target
        accessible: boolean;
        accessibleTitle: string | null;
        accessibleHint: string | null;
        tabIndex: number;
        // end accessible target

        // begin interactive target
        interactive: boolean;
        interactiveChildren: boolean;
        hitArea: PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle | PIXI.HitArea;
        buttonMode: boolean;
        cursor: string;

        trackedPointers(): { [key: number]: interaction.InteractionTrackingData; };

        // deprecated
        defaultCursor: string;
        // end interactive target

        transform: Transform;
        alpha: number;
        visible: boolean;
        renderable: boolean;
        parent: Container;
        worldAlpha: number;
        filterArea: Rectangle | null;
        protected _filters: Filter<any>[] | null;
        protected _enabledFilters: Filter<any>[] | null;
        protected _bounds: Bounds;
        protected _boundsID: number;
        protected _lastBoundsID: number;
        protected _boundsRect: Rectangle;
        protected _localBoundsRect: Rectangle;
        protected _mask: PIXI.Graphics | PIXI.Sprite | null;
        protected readonly _destroyed: boolean;
        x: number;
        y: number;
        worldTransform: Matrix;
        localTransform: Matrix;
        position: Point | ObservablePoint;
        scale: Point | ObservablePoint;
        pivot: Point | ObservablePoint;
        skew: ObservablePoint;
        rotation: number;
        worldVisible: boolean;
        mask: PIXI.Graphics | PIXI.Sprite | null;
        filters: Filter<any>[] | null;

        updateTransform(): void;

        protected displayObjectUpdateTransform(): void;

        protected _recursivePostUpdateTransform(): void;

        getBounds(skipUpdate?: boolean, rect?: Rectangle): Rectangle;

        getLocalBounds(rect?: Rectangle): Rectangle;

        //creates and returns a new point
        toGlobal(position: PointLike): Point;
        //modifies the x and y of the passed point and returns it
        toGlobal<T extends PointLike>(position: PointLike, point?: T, skipUpdate?: boolean): T;

        //creates and returns a new point
        toLocal(position: PointLike, from?: DisplayObject): Point;
        //modifies the x and y of the passed point and returns it
        toLocal<T extends PointLike>(position: PointLike, from?: DisplayObject, point?: T, skipUpdate?: boolean): T;

        render(renderer: Renderer): void;

        setParent(container: Container): Container;

        setTransform(x?: number, y?: number, scaleX?: number, scaleY?: number, rotation?: number, skewX?: number, skewY?: number, pivotX?: number, pivotY?: number): DisplayObject;

        destroy(): void;

        on(event: interaction.InteractionEventTypes, fn: (event: interaction.InteractionEvent) => void, context?: any): this;

        once(event: interaction.InteractionEventTypes, fn: (event: interaction.InteractionEvent) => void, context?: any): this;

        removeListener(event: interaction.InteractionEventTypes, fn?: (event: interaction.InteractionEvent) => void, context?: any): this;

        removeAllListeners(event?: interaction.InteractionEventTypes): this;

        off(event: interaction.InteractionEventTypes, fn?: (event: interaction.InteractionEvent) => void, context?: any): this;

        addListener(event: interaction.InteractionEventTypes, fn: (event: interaction.InteractionEvent) => void, context?: any): this;

    }

    export class Transform {

        static IDENTITY: Transform;

        worldTransform: Matrix;
        localTransform: Matrix;
        protected _worldID: number;

        updateLocalTransform(): void;

        updateTransform(parentTransform: Transform): void;

        updateWorldTransform(parentTransform: Transform): void;

        position: ObservablePoint;
        scale: ObservablePoint;
        pivot: ObservablePoint;
        skew: ObservablePoint;

        protected _rotation: number;
        protected _sr?: number;
        protected _cr?: number;
        protected _cy?: number;
        protected _sy?: number;
        protected _nsx?: number;
        protected _cx?: number;
        protected _currentLocalID: number;

        protected onChange(): void;

        updateSkew(): void;

        updateLocalTransform(): void;

        updateTransform(parentTransform: Transform): void;

        setFromMatrix(matrix: Matrix): void;

        rotation: number;

    }

    // graphics

    export class GraphicsData {

        constructor(lineWidth: number, lineColor: number, lineAlpha: number, fillColor: number, fillAlpha: number, fill: boolean, nativeLines: boolean, shape: Circle | Rectangle | Ellipse | Polygon | RoundedRectangle | any, lineAlignment: number);

        lineWidth: number;
        /** The alignment of any lines drawn (0.5 = middle, 1 = outter, 0 = inner). */
        lineAlignment: number;
        nativeLines: boolean;
        lineColor: number;
        lineAlpha: number;
        protected _lineTint: number;
        fillColor: number;
        fillAlpha: number;
        protected _fillTint: number;
        fill: boolean;
        protected holes: Circle[] | Rectangle[] | Ellipse[] | Polygon[] | RoundedRectangle[] | any[];
        shape: Circle | Rectangle | Ellipse | Polygon | RoundedRectangle | any;
        type?: number;

        clone(): GraphicsData;

        addHole(shape: Circle | Rectangle | Ellipse | Polygon | RoundedRectangle | any): void;

        destroy(options?: DestroyOptions | boolean): void;

    }

    export class Graphics extends Container {

        constructor(nativeLines?: boolean);

        fillAlpha: number;
        lineWidth: number;
        nativeLines: boolean;
        lineColor: number;
        protected graphicsData: GraphicsData[];
        tint: number;
        protected _prevTint: number;
        blendMode: number;
        currentPath: GraphicsData;
        protected _webGL: any;
        isMask: boolean;
        boundsPadding: number;
        protected _localBounds: Bounds;
        dirty: number;
        fastRectDirty: number;
        clearDirty: number;
        boundsDirty: number;
        protected cachedSpriteDirty: boolean;
        protected _spriteRect: Rectangle;
        protected _fastRect: boolean;

        static _SPRITE_TEXTURE: Texture;

        clone(): Graphics;

        lineStyle(lineWidth?: number, color?: number, alpha?: number): Graphics;

        moveTo(x: number, y: number): Graphics;

        lineTo(x: number, y: number): Graphics;

        quadraticCurveTo(cpX: number, cpY: number, toX: number, toY: number): Graphics;

        bezierCurveTo(cpX: number, cpY: number, cpX2: number, cpY2: number, toX: number, toY: number): Graphics;

        arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): Graphics;

        arc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): Graphics;

        beginFill(color: number, alpha?: number): Graphics;

        endFill(): Graphics;

        drawRect(x: number, y: number, width: number, height: number): Graphics;

        drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): Graphics;

        drawCircle(x: number, y: number, radius: number): Graphics;

        drawEllipse(x: number, y: number, width: number, height: number): Graphics;

        drawPolygon(path: number[] | Point[] | Polygon): Graphics;

        drawStar(x: number, y: number, points: number, radius: number, innerRadius: number, rotation?: number): Graphics;

        clear(): Graphics;

        isFastRect(): boolean;

        protected _calculateBounds(): Rectangle;

        protected _renderSpriteRect(renderer: PIXI.SystemRenderer): void;

        containsPoint(point: Point): boolean;

        updateLocalBounds(): void;

        drawShape(shape: Circle | Rectangle | Ellipse | Polygon | RoundedRectangle | any): GraphicsData;

        closePath(): Graphics;

        addHole(): Graphics;

        destroy(options?: DestroyOptions | boolean): void;

    }

    export class GraphicsRenderer extends ObjectRenderer {

        constructor(renderer: PIXI.Renderer);

        protected graphicsDataPool: GraphicsData[];
        protected primitiveShader: PrimitiveShader;
        gl: WebGLRenderingContext;

        CONTEXT_UID: number;

        destroy(): void;

        render(graphics: Graphics): void;

        protected updateGraphics(graphics: PIXI.Graphics): void;

        getWebGLData(webGL: WebGLRenderingContext, type: number, nativeLines: number): WebGLGraphicsData;

    }

    export class WebGLGraphicsData {

        constructor(gl: WebGLRenderingContext, shader: Shader);

        gl: WebGLRenderingContext;
        color: number[];
        points: Point[];
        indices: number[];
        indexBuffer: Buffer;
        dirty: boolean;
        glPoints: number[];
        glIndices: number[];
        shader: Shader;
        buffer: Buffer;
        uvBuffer: Buffer;
        nativeLines: boolean;

        reset(): void;

        upload(): void;

        destroy(): void;

    }

    export class PrimitiveShader extends Shader {
    }

    // math

    export namespace GroupD8 {

        export const E: number;
        export const SE: number;
        export const S: number;
        export const SW: number;
        export const W: number;
        export const NW: number;
        export const N: number;
        export const NE: number;
        export const MIRROR_HORIZONTAL: number;
        export const MIRROR_VERTICAL: number;

        export function uX(ind: number): number;

        export function uY(ind: number): number;

        export function vX(ind: number): number;

        export function vY(ind: number): number;

        export function inv(rotation: number): number;

        export function add(rotationSecond: number, rotationFirst: number): number;

        export function sub(rotationSecond: number, rotationFirst: number): number;

        export function rotate180(rotation: number): number;

        export function isVertical(rotation: number): boolean;

        export function byDirection(dx: number, dy: number): number;

        export function matrixAppendRotationInv(matrix: Matrix, rotation: number, tx: number, ty: number): void;

    }

    export class Matrix {

        constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);

        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;

        fromArray(array: number[]): void;

        set(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix;

        toArray(transpose?: boolean, out?: number[]): number[];

        apply(pos: Point, newPos?: Point): Point;

        applyInverse(pos: Point, newPos?: Point): Point;

        translate(x: number, y: number): Matrix;

        scale(x: number, y: number): Matrix;

        rotate(angle: number): Matrix;

        append(matrix: Matrix): Matrix;

        setTransform(x: number, y: number, pivotX: number, pivotY: number, scaleX: number, scaleY: number, rotation: number, skewX: number, skewY: number): PIXI.Matrix;

        prepend(matrix: Matrix): Matrix;

        invert(): Matrix;

        identity(): Matrix;

        decompose(transform: Transform): Transform;

        clone(): Matrix;

        copyTo(matrix: Matrix): Matrix;

        copyFrom(matrix: Matrix): Matrix;

        static IDENTITY: Matrix;
        static TEMP_MATRIX: Matrix;

    }

    class PointLike {

        x: number;
        y: number;

        set(x?: number, y?: number): void;

        copyTo(point: PointLike): void;

        copyFrom(point: PointLike): void;

    }

    export class ObservablePoint extends PointLike {

        constructor(cb: () => any, scope?: any, x?: number, y?: number);

        cb: () => any;
        scope: any;

    }

    export class Point extends PointLike {

        constructor(x?: number, y?: number);

        clone(): Point;

        equals(p: PointLike): boolean;

    }

    export interface HitArea {

        contains(x: number, y: number): boolean;

    }

    export class Circle implements HitArea {

        constructor(x?: number, y?: number, radius?: number);

        x: number;
        y: number;
        radius: number;
        type: number;

        clone(): Circle;

        contains(x: number, y: number): boolean;

        getBounds(): Rectangle;

    }

    export class Ellipse implements HitArea {

        constructor(x?: number, y?: number, width?: number, height?: number);

        x: number;
        y: number;
        width: number;
        height: number;
        type: number;

        clone(): Ellipse;

        contains(x: number, y: number): boolean;

        getBounds(): Rectangle;

    }

    export class Polygon implements HitArea {

        constructor(points: Point[] | number[]);
        // Note - Rest Params cannot be combined with |
        //tslint:disable-next-line:unified-signatures
        constructor(...points: Point[]);
        //tslint:disable-next-line:unified-signatures
        constructor(...points: number[]);

        closed: boolean;
        points: number[];
        type: number;

        clone(): Polygon;

        contains(x: number, y: number): boolean;

        close(): void;

    }

    export class Rectangle implements HitArea {

        constructor(x?: number, y?: number, width?: number, height?: number);

        x: number;
        y: number;
        width: number;
        height: number;
        type: number;
        left: number;
        right: number;
        top: number;
        bottom: number;

        static EMPTY: Rectangle;

        clone(): Rectangle;

        copy(rectangle: Rectangle): Rectangle;

        contains(x: number, y: number): boolean;

        pad(paddingX: number, paddingY: number): void;

        fit(rectangle: Rectangle): void;

        enlarge(rectangle: Rectangle): void;

    }

    export class RoundedRectangle implements HitArea {

        constructor(x?: number, y?: number, width?: number, height?: number, radius?: number);

        x: number;
        y: number;
        width: number;
        height: number;
        radius: number;
        type: number;

        clone(): RoundedRectangle;

        contains(x: number, y: number): boolean;

    }

    // renderers

    export interface RendererOptions {

        /**
         * the width of the renderers view [default=800]
         */
        width?: number;

        /**
         * the height of the renderers view [default=600]
         */
        height?: number;

        /**
         * the canvas to use as a view, optional
         */
        view?: HTMLCanvasElement;

        /**
         * If the render view is transparent, [default=false]
         */
        transparent?: boolean;

        /**
         * sets antialias (only applicable in chrome at the moment) [default=false]
         */
        antialias?: boolean;

        /**
         * enables drawing buffer preservation, enable this if you need to call toDataUrl on the webgl context [default=false]
         */
        preserveDrawingBuffer?: boolean;

        /**
         * The resolution / device pixel ratio of the renderer, retina would be 2 [default=1]
         */
        resolution?: number;

        /**
         * prevents selection of WebGL renderer, even if such is present [default=false]
         */
        forceCanvas?: boolean;

        /**
         * The background color of the rendered area (shown if not transparent) [default=0x000000]
         */
        backgroundColor?: number;

        /**
         * This sets if the renderer will clear the canvas or not before the new render pass. [default=true]
         */
        clearBeforeRender?: boolean;

        /**
         * If true Pixi will Math.floor() x/ y values when rendering, stopping pixel interpolation. [default=false]
         */
        roundPixels?: boolean;

        /**
         * forces FXAA antialiasing to be used over native FXAA is faster, but may not always look as great ** webgl only** [default=false]
         */
        forceFXAA?: boolean;

        /**
         * `true` to ensure compatibility with older / less advanced devices. If you experience unexplained flickering try setting this to true. **webgl only** [default=false]
         */
        legacy?: boolean;

        /**
         * Deprecated
         */
        context?: WebGLRenderingContext;

        /**
         * Deprecated
         */
        autoResize?: boolean;

        /**
         * Parameter passed to webgl context, set to "high-performance" for devices with dual graphics card
         */
        powerPreference?: string;

    }

    export interface ApplicationOptions extends RendererOptions {

        /**
         * `true` to use PIXI.ticker.shared, `false` to create new ticker. [default=false]
         */
        sharedTicker?: boolean;

        /**
         * `true` to use PIXI.loaders.shared, `false` to create new Loader.
         */
        sharedLoader?: boolean;

        /**
         * automatically starts the rendering after the construction.
         * Note that setting this parameter to false does NOT stop the shared ticker even if you set
         * options.sharedTicker to true in case that it is already started. Stop it by your own.
         */
        autoStart?: boolean;

    }


    interface DefaultRendererPlugins {
        accessibility: accessibility.AccessibilityManager;
        interaction: interaction.InteractionManager;
    }

    export interface RendererPlugins extends DefaultRendererPlugins {
    }

    export class SystemRenderer extends utils.EventEmitter {

        constructor(system: string, options?: RendererOptions);
        constructor(system: string, screenWidth?: number, screenHeight?: number, options?: RendererOptions);

        type: number;
        options: RendererOptions;
        screen: Rectangle;
        readonly width: number;
        readonly height: number;
        view: HTMLCanvasElement;
        resolution: number;
        transparent: boolean;
        autoResize: boolean;
        blendModes: any; // todo?
        preserveDrawingBuffer: boolean;
        clearBeforeRender: boolean;
        roundPixels: boolean;
        backgroundColor: number;
        protected _backgroundColor: number;
        protected _backgroundColorRgba: number[];
        protected _backgroundColorString: string;
        protected _tempDisplayObjectParent: Container;
        protected _lastObjectRendered: DisplayObject;

        resize(screenWidth: number, screenHeight: number): void;

        generateTexture(displayObject: DisplayObject, scaleMode?: number, resolution?: number, region?: Rectangle): RenderTexture;

        render(...args: any[]): void;

        destroy(removeView?: boolean): void;

    }

    export interface WebGLRendererOptions extends RendererOptions {
    }

    interface DefaultWebGLRendererPlugins {
        extract: extract.Extract;
        prepare: prepare.Prepare;
    }

    export interface WebGLRendererPlugins extends DefaultWebGLRendererPlugins, RendererPlugins {
    }

    export class Renderer extends SystemRenderer {

        // plugintarget mixin start
        static __plugins: { [pluginName: string]: { new(renderer: Renderer): any; } };

        static registerPlugin(pluginName: string, ctor: { new(renderer: Renderer): any; }): void;

        plugins: WebGLRendererPlugins;

        initPlugins(): void;

        destroyPlugins(): void;

        // plugintarget mixin end

        constructor(options?: WebGLRendererOptions);
        constructor(screenWidth?: number, screenHeight?: number, options?: WebGLRendererOptions);

        protected _contextOptions: {
            alpha: boolean;
            antiAlias?: boolean;
            premultipliedAlpha: boolean;
            stencil: boolean;
            preserveDrawingBuffer?: boolean;
        };
        protected _backgroundColorRgba: number[];

        mask: systems.MaskSystem;
        context: systems.ContextSystem;
        state: systems.StateSystem;
        shader: systems.ShaderSystem;
        texture: systems.TextureSystem;
        geometry: systems.GeometrySystem;
        framebuffer: systems.FramebufferSystem;
        stencil: systems.StencilSystem;
        projection: systems.ProjectionSystem;
        textureGC: systems.TextureGCSystem;
        filter: systems.FilterSystem;
        renderTexture: systems.RenderTextureSystem;
        batch: systems.BatchSystem;

        gl: WebGLRenderingContext;
        CONTEXT_UID: number;
        renderingToScreen: boolean;
        boundTextures: BaseTexture[];
        extract: extract.Extract;

        render(displayObject: PIXI.DisplayObject, renderTexture?: PIXI.RenderTexture, clear?: boolean, transform?: PIXI.Transform, skipUpdateTransform?: boolean): void

        flush(): void;

        clear(): void;

        reset(): Renderer;

        destroy(removeView?: boolean): void;

        on(event: "prerender" | "postrender", fn: () => void, context?: any): this;
        on(event: "context", fn: (gl: WebGLRenderingContext) => void, context?: any): this;

        once(event: "prerender" | "postrender", fn: () => void, context?: any): this;
        once(event: "context", fn: (gl: WebGLRenderingContext) => void, context?: any): this;

        removeListener(event: "prerender" | "postrender", fn?: () => void, context?: any): this;
        removeListener(event: "context", fn?: (gl: WebGLRenderingContext) => void, context?: any): this;

        removeAllListeners(event?: "prerender" | "postrender" | "context"): this;

        off(event: "prerender" | "postrender", fn?: () => void, context?: any): this;
        off(event: "context", fn?: (gl: WebGLRenderingContext) => void, context?: any): this;

        addListener(event: "prerender" | "postrender", fn: () => void, context?: any): this;
        addListener(event: "context", fn: (gl: WebGLRenderingContext) => void, context?: any): this;

    }

    export abstract class System {
        constructor(renderer: Renderer);

        renderer: Renderer;

        contextChange(gl: WebGLRenderingContext): void;

        destroy(): void;
    }

    export namespace systems {
        export class BatchSystem extends System {
            setObjectRenderer(objectRenderer: ObjectRenderer): void;

            currentRenderer: ObjectRenderer;
            emptyRenderer: ObjectRenderer;

            flush(): void;

            reset(): void;
        }
    }

    export abstract class ObjectRenderer extends System {
        start(): void;

        stop(): void;

        flush(): void;

        render(...args: any[]): void;

    }

    // sprites

    export class Sprite extends Container {

        constructor(texture?: Texture);

        protected _anchor: ObservablePoint;
        anchor: ObservablePoint;
        protected _texture: Texture;
        protected _transformTrimmedID: number;
        protected _textureTrimmedID: number;
        protected _width: number;
        protected _height: number;
        tint: number;
        protected _tint: number;
        protected _tintRGB: number;
        blendMode: number;
        pluginName: string;
        protected cachedTint: number;
        texture: Texture;
        protected textureDirty: boolean;
        protected _textureID: number;
        protected _transformID: number;
        protected vertexTrimmedData: Float32Array;
        vertexData: Float32Array;
        width: number;
        height: number;

        protected _onTextureUpdate(): void;

        calculateVertices(): void;

        protected _calculateBounds(): void;

        protected calculateTrimmedVertices(): void;

        protected onAnchorUpdate(): void;

        protected _render(renderer: Renderer): void;

        getLocalBounds(): Rectangle;

        containsPoint(point: Point): boolean;

        destroy(options?: DestroyOptions | boolean): void;

        static from(source: number | string | BaseTexture | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Sprite;

        static fromFrame(frameId: string): Sprite;

        static fromImage(imageId: string, crossorigin?: boolean, scaleMode?: number): Sprite;

    }

    export class BatchBuffer {

        vertices: ArrayBuffer;
        float32View: number[];
        uint32View: number[];

        destroy(): void;

    }

    export class SpriteRenderer extends ObjectRenderer {

        constructor(renderer: PIXI.Renderer);

        vertSize: number;
        vertByteSize: number;
        size: number;
        buffers: BatchBuffer[];
        indexBuffer: Buffer;
        indices: number[];
        shader: Shader;
        currentIndex: number;
        tick: number;
        groups: any[];
        sprites: Sprite[];
        vertexBuffers: number[];
        vaos: Array<Geometry>;
        vaoMax: number;
        vertexCount: number;

        prerender(): void;

        render(sprite: Sprite): void;

    }

    // text
    export interface TextStyleOptions {
        align?: string;
        breakWords?: boolean;
        dropShadow?: boolean;
        dropShadowAlpha?: number;
        dropShadowAngle?: number;
        dropShadowBlur?: number;
        dropShadowColor?: string | number;
        dropShadowDistance?: number;
        fill?: string | string[] | number | number[] | CanvasGradient | CanvasPattern;
        fillGradientType?: number;
        fillGradientStops?: number[];
        fontFamily?: string | string[];
        fontSize?: number | string;
        fontStyle?: string;
        fontVariant?: string;
        fontWeight?: string;
        letterSpacing?: number;
        lineHeight?: number;
        lineJoin?: string;
        miterLimit?: number;
        padding?: number;
        stroke?: string | number;
        strokeThickness?: number;
        textBaseline?: string;
        trim?: boolean;
        wordWrap?: boolean;
        wordWrapWidth?: number;
        leading?: number;
    }

    export class TextStyle implements TextStyleOptions {

        constructor(style: TextStyleOptions)

        styleID: number;

        clone(): TextStyle;

        reset(): void;

        protected _align: string;
        align: string;
        protected _breakWords: boolean;
        breakWords: boolean;
        protected _dropShadow: boolean;
        dropShadow: boolean;
        protected _dropShadowAlpha: number;
        dropShadowAlpha: number;
        protected _dropShadowAngle: number;
        dropShadowAngle: number;
        protected _dropShadowBlur: number;
        dropShadowBlur: number;
        protected _dropShadowColor: string | number;
        dropShadowColor: string | number;
        protected _dropShadowDistance: number;
        dropShadowDistance: number;
        protected _fill: string | string[] | number | number[] | CanvasGradient | CanvasPattern;
        fill: string | string[] | number | number[] | CanvasGradient | CanvasPattern;
        protected _fillGradientType: number;
        fillGradientType: number;
        protected _fillGradientStops: number[];
        fillGradientStops: number[];
        protected _fontFamily: string | string[];
        fontFamily: string | string[];
        protected _fontSize: number | string;
        fontSize: number | string;
        protected _fontStyle: string;
        fontStyle: string;
        protected _fontVariant: string;
        fontVariant: string;
        protected _fontWeight: string;
        fontWeight: string;
        protected _leading: number;
        leading: number;
        protected _letterSpacing: number;
        letterSpacing: number;
        protected _lineHeight: number;
        lineHeight: number;
        protected _lineJoin: string;
        lineJoin: string;
        protected _miterLimit: number;
        miterLimit: number;
        protected _padding: number;
        padding: number;
        protected _stroke: string | number;
        stroke: string | number;
        protected _strokeThickness: number;
        strokeThickness: number;
        protected _textBaseline: string;
        textBaseline: string;
        protected _trim: boolean;
        trim: boolean;
        protected _wordWrap: boolean;
        wordWrap: boolean;
        protected _wordWrapWidth: number;
        wordWrapWidth: number;

        toFontString(): string;

    }

    export class TextMetrics {

        protected _canvas: HTMLCanvasElement;
        protected _context: CanvasRenderingContext2D;
        protected _fonts: FontMetrics;

        text: string;
        style: TextStyle;
        width: number;
        height: number;
        lines: number[];
        lineWidths: number[];
        lineHeight: number;
        maxLineWidth: number;
        fontProperties: any;

        constructor(text: string, style: TextStyle, width: number, height: number, lines: number[], lineWidths: number[], lineHeight: number, maxLineWidth: number, fontProperties: any);

        static measureText(text: string, style: TextStyle, wordWrap?: boolean, canvas?: HTMLCanvasElement): TextMetrics;

        static wordWrap(text: string, style: TextStyle, canvas?: HTMLCanvasElement): string;

        static measureFont(font: string): FontMetrics;

    }

    interface FontMetrics {

        ascent: number;
        descent: number;
        fontSize: number;

    }

    export class Text extends Sprite {

        constructor(text?: string, style?: TextStyleOptions, canvas?: HTMLCanvasElement);

        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        resolution: number;
        protected _text: string;
        protected _style: TextStyle;
        //tslint:disable-next-line:ban-types forbidden-types
        protected _styleListener: Function;
        protected _font: string;
        protected localStyleID: number;

        width: number;
        height: number;
        style: TextStyle;
        text: string;

        protected updateText(respectDirty?: boolean): void;

        protected drawLetterSpacing(text: string, x: number, y: number, isStroke?: boolean): void;

        protected updateTexture(): void;

        render(renderer: Renderer): void;

        getLocalBounds(rect?: Rectangle): Rectangle;

        protected _calculateBounds(): void;

        protected _onStyleChange: () => void;

        protected _generateFillStyle(style: TextStyle, lines: string[]): string | number | CanvasGradient;

        destroy(options?: DestroyOptions | boolean): void;

        dirty: boolean;

    }

    export class Spritesheet {

        static BATCH_SIZE: number;

        constructor(baseTexture: BaseTexture, data: any, resolutionFilename?: string);

        baseTexture: BaseTexture;
        textures: { [key: string]: Texture; };
        data: any;
        resolution: number;
        protected _frames: any;
        protected _frameKeys: string;
        protected _batchIndex: number;
        protected _callback: (spriteSheet: this, textures: { [key: string]: Texture; }) => void;

        protected _updateResolution(resolutionFilename: string): number;

        parse(callback: (spriteSheet: this, textures: { [key: string]: Texture; }) => void): void;

        protected _processFrames(initialFrameIndex: number): void;

        protected _parseComplete(): void;

        protected _nextBatch(): void;

        destroy(destroyBase?: boolean): void;

    }

    export class VideoBaseTexture extends BaseTexture {

        constructor(source: HTMLVideoElement, scaleMode?: number);

        autoUpdate: boolean;
        autoPlay: boolean;
        protected _isAutoUpdating: boolean;

        update(): void;

        protected _onCanPlay(): void;

        protected _onPlayStart(): void;

        protected _onPlayStop(): void;

        destroy(): void;

        protected _isSourcePlaying(): boolean;

        protected _isSourceReady(): boolean;

        static fromVideo(video: HTMLVideoElement, scaleMode?: number): VideoBaseTexture;

        static fromUrl(videoSrc: string | any | string[] | any[], crossOrigin?: boolean): VideoBaseTexture;

        static fromUrls(videoSrc: string | any | string[] | any[]): VideoBaseTexture;

        source: HTMLVideoElement;

        protected loadSource(source: HTMLVideoElement): void;
    }

    // ticker

    namespace ticker_internals {
        export class TickerListener {

            constructor(fn: (deltaTime: number) => void, context?: any, priority?: number, once?: boolean);

            fn: (deltaTime: number) => void;
            context: any;
            priority: number;
            once: boolean;
            next: TickerListener;
            previous: TickerListener;

            protected _destroyed: boolean;

            match(fn: (deltaTime: number) => void, context?: any): boolean;

            emit(deltaTime: number): TickerListener;

            connect(previous: TickerListener): void;

            destroy(hard?: boolean): void;

        }
    }

    export class Ticker {
        static shared: Ticker;

        protected _tick: (time: number) => void;
        protected _head: ticker_internals.TickerListener;
        protected _requestId: number | null;
        protected _maxElapsedMS: number;

        autoStart: boolean;
        deltaTime: number;
        elapsedMS: number;
        lastTime: number;
        speed: number;
        started: boolean;

        protected _requestIfNeeded(): void;

        protected _cancelIfNeeded(): void;

        protected _startIfPossible(): void;

        add(fn: (deltaTime: number) => void, context?: any, priority?: number): Ticker;

        addOnce(fn: (deltaTime: number) => void, context?: any, priority?: number): Ticker;

        //tslint:disable-next-line:ban-types forbidden-types
        remove(fn: Function, context?: any, priority?: number): Ticker;

        protected _addListener(listener: ticker_internals.TickerListener): Ticker;

        readonly FPS: number;
        minFPS: number;

        start(): void;

        stop(): void;

        destroy(): void;

        update(currentTime?: number): void;

    }

    //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////EXTRACT///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export namespace extract {
        export class Extract {
            protected renderer: Renderer;

            constructor(renderer: Renderer);

            image(target?: DisplayObject | RenderTexture): HTMLImageElement;

            base64(target?: DisplayObject | RenderTexture): string;

            canvas(target?: DisplayObject | RenderTexture): HTMLCanvasElement;

            pixels(renderTexture?: DisplayObject | RenderTexture): Uint8Array;

            destroy(): void;
        }

    }

    //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////EXTRAS////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export interface BitmapTextStyle {

        font?: string | {
            name?: string;
            size?: number;
        };
        align?: string;
        tint?: number;

    }

    export class BitmapText extends Container {

        static registerFont(xml: XMLDocument, texture: Texture): any;

        constructor(text: string, style?: BitmapTextStyle);

        protected _textWidth: number;
        protected _textHeight: number;
        textWidth: number;
        textHeight: number;
        protected _glyphs: Sprite[];
        protected _font: string | {
            name?: string;
            size?: number;
        };
        font: string | {
            name?: string;
            size?: number;
        };
        protected _text: string;
        protected _maxWidth: number;
        maxWidth: number;
        protected _maxLineHeight: number;
        maxLineHeight: number;
        protected _anchor: ObservablePoint;
        dirty: boolean;
        tint: number;
        align: string;
        text: string;
        anchor: PIXI.Point | number;

        protected updateText(): void;

        updateTransform(): void;

        getLocalBounds(): Rectangle;

        protected validate(): void;

        static fonts: any;

    }

    interface AnimatedSpriteTextureTimeObject {
        texture: Texture;
        time?: number;
    }

    export class AnimatedSprite extends Sprite {

        constructor(textures: Texture[] | AnimatedSpriteTextureTimeObject[], autoUpdate?: boolean);

        protected _autoUpdate: boolean;
        protected _textures: Texture[];
        protected _durations: number[];
        textures: Texture[] | AnimatedSpriteTextureTimeObject[];
        animationSpeed: number;
        loop: boolean;
        onComplete: () => void;
        onFrameChange: (currentFrame: number) => void;
        onLoop: () => void;
        protected _currentTime: number;
        playing: boolean;
        totalFrames: number;
        currentFrame: number;

        stop(): void;

        play(): void;

        gotoAndStop(frameNumber: number): void;

        gotoAndPlay(frameNumber: number): void;

        protected update(deltaTime: number): void;

        destroy(options?: DestroyOptions | boolean): void;

        static fromFrames(frame: string[]): AnimatedSprite;

        static fromImages(images: string[]): AnimatedSprite;

    }

    export class TilingSprite extends Sprite {

        constructor(texture: Texture, width?: number, height?: number);

        tileTransform: Transform;
        protected _width: number;
        protected _height: number;
        protected _canvasPattern: CanvasPattern;
        uvTransform: TextureMatrix;
        uvRespectAnchor: boolean;

        clampMargin: number;
        tileScale: Point | ObservablePoint;
        tilePosition: Point | ObservablePoint;

        multiplyUvs(uvs: Float32Array, out: Float32Array): Float32Array;

        protected _onTextureUpdate(): void;

        protected _render(renderer: Renderer): void;

        protected _calculateBounds(): void;

        getLocalBounds(rect?: Rectangle): Rectangle;

        containsPoint(point: Point): boolean;

        destroy(options?: DestroyOptions | boolean): void;

        static from(source: number | string | BaseTexture | HTMLCanvasElement | HTMLVideoElement, width?: number, height?: number): TilingSprite;

        static fromFrame(frameId: string, width?: number, height?: number): TilingSprite;

        // if you remove the next line, the class will break. https://github.com/pixijs/pixi-typescript/issues/96
        static fromImage(imageId: string, crossorigin?: boolean, scaleMode?: number): Sprite;
        static fromImage(imageId: string, width?: number, height?: number, crossorigin?: boolean, scaleMode?: number): TilingSprite;

        width: number;
        height: number;

    }

    export class TilingSpriteRenderer extends ObjectRenderer {

        constructor(renderer: Renderer);

        render(ts: TilingSprite): void;

    }

    //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////FILTERS///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export namespace filters {

        export class FXAAFilter extends Filter<{}> {
        }

        export class BlurFilter extends Filter<{}> {

            constructor(strength?: number, quality?: number, resolution?: number, kernelSize?: number);

            blurXFilter: BlurFilterPass;
            blurYFilter: BlurFilterPass;
            resolution: number;
            padding: number;
            passes: number;
            blur: number;
            blurX: number;
            blurY: number;
            quality: number;
            blendMode: number

        }

        type BlurFilterUniforms =
            {
                strength: number;
            }

        export class BlurFilterPass extends Filter<BlurFilterUniforms> {

            constructor(horizontal: boolean, strength?: number, quality?: number, resolution?: number, kernelSize?: number);

            protected _quality: number;

            quality: number;
            passes: number;
            resolution: number;
            strength: number;
            firstRun: boolean;
            blur: number;

        }

        type ColorMatrixFilterUniforms =
            {
                m: Matrix;
                uAlpha: number;
            }

        export class ColorMatrixFilter extends Filter<ColorMatrixFilterUniforms> {

            constructor();

            protected _loadMatrix(matrix: number[], multiply?: boolean): void;

            protected _multiply(out: number[], a: number[], b: number[]): void;

            protected _colorMatrix(matrix: number[]): void;

            matrix: number[];
            alpha: number;

            brightness(b: number, multiply?: boolean): void;

            greyscale(scale: number, multiply?: boolean): void;

            blackAndWhite(multiply?: boolean): void;

            hue(rotation: number, multiply?: boolean): void;

            contrast(amount: number, multiply?: boolean): void;

            saturate(amount: number, multiply?: boolean): void;

            desaturate(multiply?: boolean): void;

            negative(multiply?: boolean): void;

            sepia(multiply?: boolean): void;

            technicolor(multiply?: boolean): void;

            polaroid(multiply?: boolean): void;

            toBGR(multiply?: boolean): void;

            kodachrome(multiply?: boolean): void;

            browni(multiply?: boolean): void;

            vintage(multiply?: boolean): void;

            colorTone(desaturation: number, toned: number, lightColor: string, darkColor: string, multiply?: boolean): void;

            night(intensity: number, multiply?: boolean): void;

            predator(amount: number, multiply?: boolean): void;

            lsd(multiply?: boolean): void;

            reset(): void;

        }

        type DisplacementFilterUniforms =
            {
                mapSampler: Texture;
                filterMatrix: Matrix;
                scale: Point;
            }

        export class DisplacementFilter extends Filter<DisplacementFilterUniforms> {

            constructor(sprite: Sprite, scale?: number);

            scale: Point;
            map: Texture;

        }

        export class AlphaFilter extends Filter<{}> {

            constructor(alpha?: number);

            alpha: number;
            glShaderKey: number;
        }

        // pixi-filters.d.ts todo
        // https://github.com/pixijs/pixi-filters/
        type NoiseFilterUniforms =
            {
                uNoise: number;
                uSeed: number;
            }

        export class NoiseFilter extends Filter<NoiseFilterUniforms> {

            constructor(noise?: number, seed?: number);

            noise: number;
            seed: number;

        }

    }

    //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////INTERACTION///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export namespace interaction {

        export interface InteractiveTarget {

            interactive: boolean;
            interactiveChildren: boolean;
            hitArea: PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle | PIXI.HitArea;
            buttonMode: boolean;
            cursor: string;

            trackedPointers(): { [key: number]: InteractionTrackingData; };

            // deprecated
            defaultCursor: string;

        }

        export interface InteractionTrackingData {

            readonly pointerId: number;
            flags: number;
            none: number;
            over: boolean;
            rightDown: boolean;
            leftDown: boolean;

        }

        export interface InteractionEvent {

            stopped: boolean;
            target: DisplayObject;
            currentTarget: DisplayObject;
            type: string;
            data: InteractionData;

            stopPropagation(): void;

        }

        export class InteractionData {

            global: Point;
            target: DisplayObject;
            originalEvent: MouseEvent | TouchEvent | PointerEvent;
            identifier: number;
            isPrimary: boolean;
            button: number;
            buttons: number;
            width: number;
            height: number;
            tiltX: number;
            tiltY: number;
            pointerType: string;
            pressure: number;
            rotationAngle: number;
            twist: number;
            tangentialPressure: number;

            readonly pointerID: number;

            protected _copyEvent(event: Touch | MouseEvent | PointerEvent): void;

            protected _reset(): void;

            getLocalPosition(displayObject: DisplayObject, point?: Point, globalPos?: Point): Point;

        }

        type InteractionPointerEvents =
            "pointerdown"
            | "pointercancel"
            | "pointerup"
            | "pointertap"
            | "pointerupoutside"
            | "pointermove"
            | "pointerover"
            | "pointerout";
        type InteractionTouchEvents =
            "touchstart"
            | "touchcancel"
            | "touchend"
            | "touchendoutside"
            | "touchmove"
            | "tap";
        type InteractionMouseEvents =
            "rightdown"
            | "mousedown"
            | "rightup"
            | "mouseup"
            | "rightclick"
            | "click"
            | "rightupoutside"
            | "mouseupoutside"
            | "mousemove"
            | "mouseover"
            | "mouseout"
            | "mouseover";
        type InteractionPixiEvents = "added" | "removed";
        type InteractionEventTypes =
            InteractionPointerEvents
            | InteractionTouchEvents
            | InteractionMouseEvents
            | InteractionPixiEvents;

        export interface InteractionManagerOptions {
            autoPreventDefault?: boolean;
            interactionFrequency?: number;
        }

        export class InteractionManager extends utils.EventEmitter {

            constructor(renderer: Renderer | SystemRenderer, options?: InteractionManagerOptions);

            renderer: SystemRenderer;
            autoPreventDefault: boolean;
            interactionFrequency: number;
            mouse: InteractionData;
            activeInteractionData: { [key: number]: InteractionData; };
            interactionDataPool: InteractionData[];
            eventData: InteractionEvent;
            protected interactionDOMElement: HTMLElement;
            moveWhenInside: boolean;
            eventsAdded: boolean;
            protected mouseOverRenderer: boolean;
            readonly supportsTouchEvents: boolean;
            readonly supportsPointerEvents: boolean;
            protected onPointerUp: (event: PointerEvent) => void;
            protected processPointerUp: (interactionEvent: InteractionEvent, displayObject: Container, hit: boolean) => void;
            protected onPointerCancel: (event: PointerEvent) => void;
            protected processPointerCancel: (interactionEvent: InteractionEvent, displayObject: Container) => void;
            protected onPointerDown: (event: PointerEvent) => void;
            protected processPointerDown: (interactionEvent: InteractionEvent, displayObject: Container, hit: boolean) => void;
            protected onPointerMove: (event: PointerEvent) => void;
            protected processPointerMove: (interactionEvent: InteractionEvent, displayObject: Container, hit: boolean) => void;
            protected onPointerOut: (event: PointerEvent) => void;
            protected processPointerOverOut: (interactionEvent: InteractionEvent, displayObject: Container, hit: boolean) => void;
            protected onPointerOver: (event: PointerEvent) => void;
            cursorStyles: {
                default: string;
                pointer: string;
            };
            currentCursorMode: string;
            cursor: string;
            protected _tempPoint: Point;
            resolution: number;

            hitTest(globalPoint: Point, root?: Container): DisplayObject;

            setTargetElement(element: HTMLCanvasElement, resolution?: number): void;

            protected addEvents(): void;

            protected removeEvents(): void;

            update(deltaTime?: number): void;

            setCursorMode(mode: string): void;

            protected dispatchEvent(displayObject: Container | Sprite | TilingSprite, eventString: string, eventData: any): void;

            mapPositionToPoint(point: Point, x: number, y: number): void;

            //tslint:disable-next-line:ban-types forbidden-types
            protected processInteractive(interactionEvent: InteractionEvent, displayObject: PIXI.Container | PIXI.Sprite | PIXI.TilingSprite, func?: Function, hitTest?: boolean, interactive?: boolean): boolean;

            //tslint:disable-next-line:ban-types forbidden-types
            protected onPointerComplete(originalEvent: PointerEvent, cancelled: boolean, func: Function): void;

            protected getInteractionDataForPointerId(pointerId: number): InteractionData;

            protected releaseInteractionDataForPointerId(event: PointerEvent): void;

            protected configureInteractionEventForDOMEvent(interactionEvent: InteractionEvent, pointerEvent: PointerEvent, interactionData: InteractionData): InteractionEvent;

            protected normalizeToPointerData(event: TouchEvent | MouseEvent | PointerEvent): PointerEvent[];

            destroy(): void;

            // deprecated
            defaultCursorStyle: string;
            currentCursorStyle: string;

        }

    }

    //////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////LOADER/////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    // pixi loader extends
    // https://github.com/englercj/resource-loader/
    // 2.1.1

    class MiniSignalBinding {

        //tslint:disable-next-line:ban-types forbidden-types
        constructor(fn: Function, once?: boolean, thisArg?: any);

        //tslint:disable-next-line:ban-types forbidden-types
        protected _fn: Function;
        protected _once: boolean;
        protected _thisArg: any;
        protected _next: MiniSignalBinding;
        protected _prev: MiniSignalBinding;
        protected _owner: MiniSignal;

        detach(): boolean;

    }

    class MiniSignal {

        constructor();

        protected _head: MiniSignalBinding;
        protected _tail: MiniSignalBinding;

        handlers(exists?: boolean): MiniSignalBinding[] | boolean;
        handlers(exists?: true): boolean;
        handlers(exists?: false): MiniSignalBinding[];

        has(node: MiniSignalBinding): boolean;

        dispatch(): boolean;

        //tslint:disable-next-line:ban-types forbidden-types
        add(fn: Function, thisArg?: any): any;

        //tslint:disable-next-line:ban-types forbidden-types
        once(fn: Function, thisArg?: any): any;

        detach(node: MiniSignalBinding): MiniSignal;

        detachAll(): MiniSignal;

    }


    // As of ResourceLoader v2 we no longer require EventEmitter
    // However, for depreciation reasons, it remains.
    export class Loader extends utils.EventEmitter {

        static shared: Loader;
        static registerPlugin(plugin: {pre?: Function, use?: Function}): any;

        // below this line is the original non-pixi loader

        static Resource: any;
        static async: any;
        static base64: any;

        constructor(baseUrl?: string, concurrency?: number);

        baseUrl: string;
        progress: number;
        loading: boolean;
        defaultQueryString: string;

        //tslint:disable-next-line:ban-types forbidden-types
        protected _beforeMiddleware: Function[];
        //tslint:disable-next-line:ban-types forbidden-types
        protected _afterMiddleware: Function[];
        protected _resourcesParsing: LoaderResource[];
        //tslint:disable-next-line:ban-types forbidden-types
        protected _boundLoadResource: (r: LoaderResource, d: Function) => void;
        protected _queue: any;

        resources: loaders.ResourceDictionary;

        onProgress: MiniSignal;
        onError: MiniSignal;
        onLoad: MiniSignal;
        onStart: MiniSignal;
        onComplete: MiniSignal;

        concurrency: number;

        add(...params: any[]): this;
        //tslint:disable-next-line:ban-types forbidden-types
        add(name: string, url: string, options?: loaders.LoaderOptions, cb?: Function): this;
        //tslint:disable-next-line:ban-types forbidden-types
        add(obj: string | any | any[], options?: loaders.LoaderOptions, cb?: Function): this;

        //tslint:disable-next-line:ban-types forbidden-types
        pre(fn: Function): this;

        //tslint:disable-next-line:ban-types forbidden-types
        use(fn: Function): this;

        reset(): this;

        //tslint:disable-next-line:ban-types forbidden-types
        load(cb?: Function): this;

        protected _prepareUrl(url: string): string;

        //tslint:disable-next-line:ban-types forbidden-types
        protected _loadResource(resource: LoaderResource, dequeue: Function): void;

        protected _onStart(): void;

        protected _onComplete(): void;

        protected _onLoad(resource: LoaderResource): void;

        destroy(): void;

        // depreciation

        on(event: "complete", fn: (loader: Loader, object: any) => void, context?: any): this;
        on(event: "error", fn: (error: Error, loader: Loader, resource: LoaderResource) => void, context?: any): this;
        on(event: "load" | "progress", fn: (loader: Loader, resource: LoaderResource) => void, context?: any): this;
        on(event: "start", fn: (loader: Loader) => void, context?: any): this;

        once(event: "complete", fn: (loader: Loader, object: any) => void, context?: any): this;
        once(event: "error", fn: (error: Error, loader: Loader, resource: LoaderResource) => void, context?: any): this;
        once(event: "load" | "progress", fn: (loader: Loader, resource: LoaderResource) => void, context?: any): this;
        once(event: "start", fn: (loader: Loader) => void, context?: any): this;

        //tslint:disable-next-line:ban-types forbidden-types
        off(event: "complete" | "error" | "load" | "progress" | "start" | string, fn?: Function, context?: any): this;

    }

    export class LoaderResource {

        static setExtensionLoadType(extname: string, loadType: number): void;

        static setExtensionXhrType(extname: string, xhrType: string): void;

        constructor(name: string, url: string | string[], options?: loaders.LoaderOptions);

        protected _flags: number;

        name: string;
        url: string;
        extension: string;
        data: any;
        crossOrigin: boolean | string;
        loadType: number;
        xhrType: string;
        metadata: any;
        error: Error;
        xhr: XMLHttpRequest | null;
        children: LoaderResource[];
        type: number;
        progressChunk: number;

        //tslint:disable-next-line:ban-types forbidden-types
        protected _dequeue: Function;
        //tslint:disable-next-line:ban-types forbidden-types
        protected _onLoadBinding: Function;
        //tslint:disable-next-line:ban-types forbidden-types
        protected _boundComplete: Function;
        //tslint:disable-next-line:ban-types forbidden-types
        protected _boundOnError: Function;
        //tslint:disable-next-line:ban-types forbidden-types
        protected _boundOnProgress: Function;
        //tslint:disable-next-line:ban-types forbidden-types
        protected _boundXhrOnError: Function;
        //tslint:disable-next-line:ban-types forbidden-types
        protected _boundXhrOnAbort: Function;
        //tslint:disable-next-line:ban-types forbidden-types
        protected _boundXhrOnLoad: Function;
        //tslint:disable-next-line:ban-types forbidden-types
        protected _boundXdrOnTimeout: Function;

        onStart: MiniSignal;
        onProgress: MiniSignal;
        onComplete: MiniSignal;
        onAfterMiddleware: MiniSignal;

        isDataUrl: boolean;
        isComplete: boolean;
        isLoading: boolean;

        complete(): void;

        abort(message?: string): void;

        //tslint:disable-next-line:ban-types forbidden-types
        load(cb?: Function): void;

        protected _hasFlag(flag: number): boolean;

        protected _setFlag(flag: number, value: boolean): void;

        protected _loadElement(type: string): void;

        protected _loadSourceElement(type: string): void;

        protected _loadXhr(): void;

        protected _loadXdr(): void;

        protected _createSource(type: string, url: string, mime?: string): HTMLSourceElement;

        protected _onError(event?: any): void;

        protected _onProgress(event?: any): void;

        protected _xhrOnError(): void;

        protected _xhrOnAbort(): void;

        protected _xdrOnTimeout(): void;

        protected _xhrOnLoad(): void;

        protected _determineCrossOrigin(url: string, loc: any): string;

        protected _determineXhrType(): number;

        protected _determineLoadType(): number;

        protected _getExtension(): string;

        protected _getMimeXhrType(type: number): string;

        static STATUS_FLAGS: {
            NONE: number;
            DATA_URL: number;
            COMPLETE: number;
            LOADING: number;
        };

        static TYPE: {
            UNKNOWN: number;
            JSON: number;
            XML: number;
            IMAGE: number;
            AUDIO: number;
            VIDEO: number;
            TEXT: number;
        };

        static LOAD_TYPE: {
            XHR: number;
            IMAGE: number;
            AUDIO: number;
            VIDEO: number;
        };

        static XHR_RESPONSE_TYPE: {
            DEFAULT: string;
            BUFFER: string;
            BLOB: string;
            DOCUMENT: string;
            JSON: string;
            TEXT: string;
        };

        static EMPTY_GIF: string;

        texture: Texture;
        spineAtlas: any;
        spineData: any;
        textures?: loaders.TextureDictionary;
    }

    export namespace loaders {

        export interface LoaderOptions {

            crossOrigin?: boolean | string;
            loadType?: number;
            xhrType?: string;
            metaData?: {
                loadElement?: HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
                skipSource?: boolean;
                mimeType?: string | string[];
            };

        }

        export interface ResourceDictionary {

            [index: string]: PIXI.LoaderResource;

        }

        export interface TextureDictionary {
            [index: string]: PIXI.Texture;
        }
    }


    //////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////MESH///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export class Mesh extends Container {

        constructor(texture: Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number);

        protected _texture: Texture;
        uvs: Float32Array;
        vertices: Float32Array;
        indices: Uint16Array;
        dirty: number;
        indexDirty: number;
        dirtyVertex: boolean;
        blendMode: number;
        pluginName: string;
        drawMode: number;
        texture: Texture;
        tintRgb: Float32Array;
        protected _glDatas: { [n: number]: any; };
        protected _uvTransform: TextureMatrix;
        uploadUvTransform: boolean;

        multiplyUvs(): void;

        refresh(forceUpdate?: boolean): void;

        protected _refresh(): void;

        protected _render(renderer: Renderer): void;

        protected _onTextureUpdate(): void;

        protected _calculateBounds(): void;

        containsPoint(point: Point): boolean;

        tint: number;

        static DRAW_MODES: {
            TRIANGLE_MESH: number;
            TRIANGLES: number;
        };

    }

    export class MeshRenderer extends ObjectRenderer {

        constructor(renderer: Renderer);

        shader: Shader;

        render(mesh: Mesh): void;

    }

    export class Plane extends Mesh {

        constructor(texture: Texture, verticesX?: number, verticesY?: number);

        protected _ready: boolean;
        verticesX: number;
        verticesY: number;
        drawMode: number;

        refresh(): void;

        protected _onTextureUpdate(): void;

    }

    export class NineSlicePlane extends Plane {

        constructor(texture: Texture, leftWidth?: number, topHeight?: number, rightWidth?: number, bottomHeight?: number);

        width: number;
        height: number;
        leftWidth: number;
        rightWidth: number;
        topHeight: number;
        bottomHeight: number;

        protected _leftWidth: number;
        protected _rightWidth: number;
        protected _topHeight: number;
        protected _bottomHeight: number;
        protected _height: number;
        protected _width: number;
        protected _origHeight: number;
        protected _origWidth: number;
        protected _uvh: number;
        protected _uvw: number;

        updateHorizontalVertices(): void;

        updateVerticalVertices(): void;

        protected _refresh(): void;

    }

    export class Rope extends Mesh {

        constructor(texture: Texture, points: Point[]);

        points: Point[];
        colors: number[];
        autoUpdate: boolean;

        protected _refresh(): void;

        refreshVertices(): void;

    }

    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////PARTICLES////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export interface ParticleContainerProperties {

        /**
         * DEPRECIATED - Use `vertices`
         */
        scale?: boolean;
        vertices?: boolean;
        position?: boolean;
        rotation?: boolean;
        uvs?: boolean;
        tint?: boolean;
        alpha?: boolean;

    }

    export class ParticleContainer extends Container {

        constructor(maxSize?: number, properties?: ParticleContainerProperties, batchSize?: number, autoResize?: boolean);

        protected _tint: number;
        protected tintRgb: number | any[];
        tint: number;
        protected _properties: boolean[];
        protected _maxSize: number;
        protected _batchSize: number;
        protected _buffers: { [n: number]: ParticleBuffer; };
        interactiveChildren: boolean;
        blendMode: number;
        autoResize: boolean;
        roundPixels: boolean;
        baseTexture: BaseTexture;

        setProperties(properties: ParticleContainerProperties): void;

        protected onChildrenChange: (smallestChildIndex?: number) => void;

        destroy(options?: DestroyOptions | boolean): void;

    }

    export class ParticleBuffer {

        constructor(properties: any, dynamicPropertyFlags: any[], size: number);

        geometry: Geometry;
        size: number;
        dynamicProperties: any[];
        staticProperties: any[];
        staticStride: number;
        staticBuffer: any;
        staticData: any;
        staticDataUint32: any;
        dynamicStride: number;
        dynamicBuffer: any;
        dynamicData: any;
        dynamicDataUint32: any;

        destroy(): void;

    }

    export interface ParticleRendererProperty {
        attribute: number;
        size: number;
        uploadFunction: (children: PIXI.DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number) => void;
        unsignedByte: any;
        offset: number;
    }

    export class ParticleRenderer extends ObjectRenderer {

        constructor(renderer: Renderer);

        shader: Shader;
        indexBuffer: WebGLBuffer;
        properties: ParticleRendererProperty[];
        protected tempMatrix: Matrix;

        start(): void;

        generateBuffers(container: ParticleContainer): ParticleBuffer[];

        protected _generateOneMoreBuffer(container: ParticleContainer): ParticleBuffer;

        uploadVertices(children: DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number): void;

        uploadPosition(children: DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number): void;

        uploadRotation(children: DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number): void;

        uploadUvs(children: DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number): void;

        uploadTint(children: DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number): void;

        destroy(): void;

    }

    //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////PREPARE///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export namespace prepare {

        type AddHook = (item: any, queue: any[]) => boolean;
        type UploadHook<UploadHookSource> = (prepare: UploadHookSource, item: any) => boolean;

        export abstract class BasePrepare<UploadHookSource> {

            constructor(renderer: SystemRenderer);

            limiter: CountLimiter | TimeLimiter;
            protected renderer: SystemRenderer;
            protected uploadHookHelper: UploadHookSource;
            protected queue: any[];
            protected addHooks: AddHook[];
            protected uploadHooks: Array<UploadHook<UploadHookSource>>;
            //tslint:disable-next-line:ban-types forbidden-types
            protected completes: Function[];
            protected ticking: boolean;
            protected delayedTick: () => void;

            //tslint:disable-next-line:ban-types forbidden-types
            upload(item: Function | DisplayObject | Container | BaseTexture | Texture | Graphics | Text | any, done?: () => void): void;

            protected tick(): void;

            protected prepareItems(): void;

            registerFindHook(addHook: AddHook): this;

            registerUploadHook(uploadHook: UploadHook<UploadHookSource>): this;

            protected findMultipleBaseTextures(item: PIXI.DisplayObject, queue: any[]): boolean;

            protected findBaseTexture(item: PIXI.DisplayObject, queue: any[]): boolean;

            protected findTexture(item: PIXI.DisplayObject, queue: any[]): boolean;

            add(item: PIXI.DisplayObject | PIXI.Container | PIXI.BaseTexture | PIXI.Texture | PIXI.Graphics | PIXI.Text | any): this;

            destroy(): void;


        }

        export class Prepare extends BasePrepare<Renderer> {

            constructor(renderer: Renderer);

        }

        export class CountLimiter {

            constructor(maxItemsPerFrame: number);

            protected maxItemsPerFrame: number;
            protected itemsLeft: number;

            beginFrame(): void;

            allowedToUpload(): boolean;

        }

        export class TimeLimiter {

            constructor(maxMilliseconds: number);

            protected maxMilliseconds: number;
            protected frameStart: number;

            beginFrame(): void;

            allowedToUpload(): boolean;

        }

    }

    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////GEOMETRY/////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export class Attribute {
        constructor(buffer: string, size?: number, normalized?: boolean, type?: number,
                    stride?: number, start?: number, instance?: number);

        buffer: string;
        size: number;
        normalized: boolean;
        type: number;
        stride: number;
        start: number;
        instance: number;

        destroy(): void;
    }

    export class Buffer {
        constructor(data?: ArrayBuffer | ArrayBufferView, _static?: boolean, index?: boolean);

        private _glBuffers: { [key: number]: { buffer: WebGLBuffer, updateID: number, byteLength: number } };
        private _updateID: number;

        update(data?: ArrayBuffer | ArrayBufferView): void;

        destroy(): void;

        static from(data: Array<number> | ArrayBuffer | ArrayBufferView): Buffer;
    }

    export class Geometry {
        constructor(buffers?: Array<Buffer>, attributes?: { [key: string]: Attribute });

        buffers: Array<Buffer>;
        attributes: { [key: string]: Attribute };
        indexBuffer: Buffer | null;

        //private glVertexArrayObjects: { [key: number]: VertexArrayObject };
        id: number;
        instanced: boolean;
        instanceCount: number;

        addAttribute(id: string, buffer: Buffer | Array<number> | ArrayBuffer | ArrayBufferView, size?: number,
                     normalized?: boolean, type?: number, stride?: number, start?: number, instance?: boolean): void;

        getAttribute(id: string): Attribute;

        addIndex(buffer: Buffer): void;

        getIndex(): Buffer;

        interleave(): this;

        getSize(): number;

        destroy(): void;

        clone(): Geometry;

        static merge(geometries: Array<Geometry>): Geometry;
    }

    export namespace systems {
        export class GeometrySystem extends System {
            constructor(renderer: Renderer);

            private _activeGeometry: Geometry;
            private _activeVao: any;
            readonly hasVao: boolean;
            readonly hasInstance: boolean;

            bind(geometry: Geometry, shader?: Shader): void;

            reset(): void;

            updateBuffers(): void;

            checkCompatibility(geometry: Geometry, program: Program): void;

            initGeometryVao(geometry: Geometry, program: Program): any;

            activateVao(geometry: Geometry, program: Program): void;

            draw(type: number, size: number, start: number, instanceCount: number): void;

            unbind(): void;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////FrameBuffer//////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export class FrameBuffer {
        constructor(width: number, height: number);

        readonly width: number;
        readonly height: number;

        private stencil: boolean;
        private depth: boolean;

        private dirtyId: number;
        private dirtyFormat: number;
        private dirtySize: number;

        depthTexture: BaseTexture;
        colorTextures: Array<BaseTexture>;

        addColorTexture(index: number, colorTexture: BaseTexture): this;

        addDepthTexture(colorTexture: BaseTexture): this;

        enableDepth(): this;

        enableStencil(): this;

        resize(width: number, height: number): void;
    }

    export namespace systems {
        export class FramebufferSystem {
            bind(framebuffer: FrameBuffer, frame: Rectangle): void;

            setViewport(x: number, y: number, width: number, heigh: number): void;

            size(): Rectangle;

            clear(r: number, g: number, b: number, a: number): void;

            initFramebuffer(framebuffer: FrameBuffer): void;

            resizeFramebuffer(framebuffer: FrameBuffer): void;

            updateFramebuffer(framebuffer: FrameBuffer): void;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////Shader///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export namespace glCore {
        export class GLProgram {
            program: WebGLProgram;
            uniformData: any;
            uniformGroups: any;
        }

        export type AttributeData = { [name: string]: { type: number, name: string, size: number, location: number } }
        export type UniformData = { [name: string]: { type: number, size: number, isArray: boolean, value: any } };
        export type SyncUniforms = (uniforms: any) => {};
    }

    export class Program {
        constructor(vertexSrc: string, fragmentSrc: string);

        private glPrograms: { [key: number]: glCore.GLProgram };

        extractData(vertexSrc: string, fragmentSrc: string): void;

        syncUniforms: glCore.SyncUniforms;
        readonly id: number;
        attributeData: glCore.AttributeData;
        uniformData: glCore.UniformData;

        private getAttributeData(program: WebGLProgram, gl: WebGLRenderingContext): glCore.AttributeData;

        private getUniformData(program: WebGLProgram, gl: WebGLRenderingContext): glCore.UniformData;

        static readonly defaultVertexSrc: string;
        static readonly defaultFragmentSrc: string;

        from(vertexSrc: string, fragmentSrc: string): Program;
    }

    export class UniformGroup {
        constructor(uniforms: any, _static?: boolean);

        uniforms: any;
        group: boolean;
        syncUniforms: glCore.SyncUniforms;
        dirtyId: number;
        id: number;
        static: number;

        update(): void;

        add(name: string, uniforms: any, _static: boolean): void;
    }

    export class Shader {
        constructor(program: Program, uniforms: any);

        uniformGroup: UniformGroup;
        program: Program;

        checkUniformExists(name: string, group: UniformGroup): boolean;

        destroy(): void;

        readonly uniforms: any;

        static from(vertexSrc: string, fragmentSrc: string, uniforms: any): Shader;
    }

    export namespace systems {
        export class ShaderSystem extends System {
            bind(shader: Shader, dontSync?: boolean): void;

            setUniforms(uniforms: any): void;

            syncUniformGroup(group: UniformGroup): void;

            createSyncGroups(group: UniformGroup): glCore.SyncUniforms;

            getglProgram(): glCore.GLProgram;

            generateShader(shader: Shader): glCore.GLProgram;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////Projection///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export namespace systems {
        export class ProjectionSystem extends System {
            projectionMatrix: Matrix;

            update(destinationFrame?: Rectangle, sourceFrame?: Rectangle, resolution?: number, root?: boolean): void;

            calculateProjection(destinationFrame: Rectangle, sourceFrame: Rectangle, resolution: number, root: boolean): void;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////Filters//////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export class Quad extends Geometry {
        constructor(gl: WebGLRenderingContext);
    }

    export class QuadUv extends Geometry {
        vertices: number[];
        uvs: number[];
        vertexBuffer: Buffer;
        uvBuffer: Buffer;

        map(targetTextureFrame: Rectangle, destinationFrame: Rectangle): QuadUv;

        invalidate(): Quad;
    }

    export namespace systems {
        export class FilterSystem extends System {
            quad: Quad;
            quadUv: QuadUv;
            statePool: Array<filters.IFilterState>;
            private tempRect: Rectangle;

            push(target: DisplayObject, filters: Array<Filter>): void;

            pop(): void;

            popFilter(): void;

            applyFilter(filter: Filter, inputTarget: RenderTexture, outputTarget: RenderTexture, clear?: boolean): void;

            syncUniforms(shader: Shader, filter: Filter<any>): void;

            getFilterTexture(resolution?: number): RenderTexture;

            returnFilterTexture(renderTexture: RenderTexture): RenderTexture;

            calculateScreenSpaceMatrix(outputMatrix: Matrix): Matrix;

            calculateNormalizedScreenSpaceMatrix(outputMatrix: Matrix): Matrix;

            calculateSpriteMatrix(outputMatrix: Matrix, sprite: Sprite): Matrix;

            destroy(contextLost?: boolean): void;

            emptyPool(): void;

            getOptimalFilterTexture(minWidth: number, minHeight: number, resolution: number): RenderTexture;

            freePotRenderTarget(renderTarget: RenderTexture): void;

        }
    }

    export namespace filters {
        interface IFilterState {
            renderTexture: RenderTexture;
            sourceFrame: Rectangle;
            destinationFrame: Rectangle;
            filters: Array<Filter>;
            target: RenderTexture;
            legacy: boolean;
            resolution: number;
        }
    }

    export class Filter<U=any> extends Shader {
        constructor(vertexSrc?: string, fragmentSrc?: string, uniforms?: any);

        protected _blendMode: number;
        blendMode: number;
        autoFit: boolean;
        padding: number;
        state: State;
        resolution: number;
        readonly legacy: boolean;

        apply(filterManager: systems.FilterSystem, input: RenderTexture, output: RenderTexture, clear?: boolean, currentState?: any): void;

        static defaultVertexSrc: string;
        static defaultFragmentSrc: string;

    }

    export class SpriteMaskFilter extends Filter {

        constructor(sprite: Sprite);

        maskSprite: Sprite;
        maskMatrix: Matrix;
    }


    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////Mask/////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export namespace systems {
        export class MaskSystem extends System {

            scissor: boolean;
            scissorData: any;
            scissorRenderTarget: RenderTexture;
            enableScissor: boolean;
            alphaMaskPool: number[];
            alphaMaskIndex: number;

            pushMask(target: DisplayObject, maskData: Sprite | Graphics): void;

            popMask(target: DisplayObject, maskData: Sprite | Graphics): void;

            pushSpriteMask(target: DisplayObject, maskData: Sprite | Graphics): void;

            popSpriteMask(): void;

            pushStencilMask(maskData: Sprite | Graphics): void;

            popStencilMask(): void;

            pushScissorMask(target: DisplayObject, maskData: Sprite | Graphics): void;

            popScissorMask(): void;

        }

        export class StencilSystem extends System {

            setMaskStack(stencilMaskStack: Array<Graphics>): void;

            pushStencil(graphics: Graphics): void;

            popStencil(): void;

            _useCurrent(): void;

            _getBitwiseMask(): number;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////State////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export class State {
        data: number;
        blendMode: number;
        polygonOffset: number;
        blend: boolean;
        offsets: boolean;
        culling: boolean;
        depthTest: boolean;
        clockwiseFrontFace: boolean;
    }

    export namespace systems {
        export class StateSystem extends State {
            setState(state: State): void;

            setBlend(value: boolean): void;

            setOffset(value: boolean): void;

            setDepthTest(value: boolean): void;

            setCullFace(value: boolean): void;

            setFrontFace(value: boolean): void;

            setBlendMode(value: number): void;

            setPolygonOffset(value: number, scale: number): void;

            resetAttributes(): void;

            reset(): void;

            updateCheck(fun: Function, value: boolean): void;

            static checkBlendMode(system: StateSystem, state: State): void;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////Context//////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    export namespace systems {
        export class ContextSystem extends System {
            extensions: any;

            readonly isLost: boolean;

            initFromContext(gl: WebGLRenderingContext): void;

            initFromOptions(options: WebGLContextAttributes): void;

            createContext(canvas: HTMLCanvasElement, options: WebGLContextAttributes): void;

            getExtensions(): void;

            handleContextLost(event: any): void;

            handleContextRestored(): void;

            postrender(): void;

            validateContext(gl: WebGLRenderingContext): void;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////Textures/////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export interface IBaseTextureOptions {
        mipmap?: boolean;
        wrapMode?: number;
        scaleMode?: number;
        format?: number;
        type?: number;
        target?: number;
        premultiplyAlpha?: boolean;
        width?: number;
        height?: number;
        resolution?: number;
        resourceOptions?: any;
    }

    export namespace glCore {
        export class GLTexture {
            texture: WebGLTexture;
            width: number;
            height: number;
            dirtyId: number;
            dirtyStyleId: number;
            mipmap: boolean;
        }
    }

    export class BaseTexture extends utils.EventEmitter {

        constructor(resource: resources.Resource | string | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
                    options: IBaseTextureOptions);

        static from(source: any, options: IBaseTextureOptions): BaseTexture;

        static fromBuffer(buffer: Float32Array | Uint8Array | Uint32Array, width: number, height: number, options?: IBaseTextureOptions): BaseTexture;

        static addToCache(baseTexture: BaseTexture, id: string): void;

        readonly resource: resources.Resource;
        width: number;
        height: number;
        resolution: number;

        mipmap: boolean;
        wrapMode: number;
        scaleMode: number;
        format: number;
        type: number;
        target: number;
        premultiplyAlpha: boolean;

        readonly uid: number;
        protected touched: number;
        readonly isPowerOfTwo: boolean;
        readonly _glTextures: { [key: number]: glCore.GLTexture };

        dirtyId: number;
        dirtyStyleId: number;
        cacheId: string | null;
        valid: boolean;
        textureCacheIds: Array<string>;
        destroyed: boolean;

        readonly realWidth: number;
        readonly realHeight: number;

        setStyle(scaleMode: number, mipmap: boolean): this;

        setSize(width: number, height: number, resolution: number): this;

        setRealSize(width: number, height: number, resolution: number): this;

        private _refreshPOT(): void;

        setResolution(resolution: number): this;

        setResource(resource: resources.Resource): this;

        update(): void;

        destroy(): void;

        dispose(): void;

        on(event: "update" | "loaded" | "error" | "dispose", fn: (baseTexture: BaseTexture) => void, context?: any): this;

        once(event: "update" | "loaded" | "error" | "dispose", fn: (baseTexture: BaseTexture) => void, context?: any): this;

        removeListener(event: "update" | "loaded" | "error" | "dispose", fn?: (baseTexture: BaseTexture) => void, context?: any): this;

        removeAllListeners(event?: "update" | "loaded" | "error" | "dispose"): this;

        off(event: "update" | "loaded" | "error" | "dispose", fn?: (baseTexture: BaseTexture) => void, context?: any): this;

        addListener(event: "update" | "loaded" | "error" | "dispose", fn: (baseTexture: BaseTexture) => void, context?: any): this;
    }

    export class CubeTexture extends BaseTexture {
        static from(resources: Array<resources.Resource>, options: IBaseTextureOptions): CubeTexture;
    }

    export class Texture extends utils.EventEmitter {

        constructor(baseTexture: BaseTexture, frame?: Rectangle, orig?: Rectangle, trim?: Rectangle, rotate?: number);

        noFrame: boolean;
        baseTexture: BaseTexture;
        protected _frame: Rectangle;
        trim?: Rectangle;
        valid: boolean;
        _uvs: TextureUvs;
        orig: Rectangle;
        _updateID: number;
        uvMatrix: TextureMatrix;
        textureCacheIds: string[];

        update(): void;

        protected onBaseTextureLoaded(baseTexture: BaseTexture): void;

        protected onBaseTextureUpdated(baseTexture: BaseTexture): void;

        destroy(destroyBase?: boolean): void;

        clone(): Texture;

        updateUvs(): void;

        static from(source: number | string | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | BaseTexture): Texture;

        static fromBuffer(buffer: Float32Array | Uint8Array | Uint32Array, width: number, height: number, options?: IBaseTextureOptions): Texture;

        static fromLoader(source: HTMLImageElement | HTMLCanvasElement, imageUrl: string, name?: string): Texture;

        static fromImage(imageUrl: string, crossOrigin?: boolean, scaleMode?: number, sourceScale?: number): Texture;

        static fromFrame(frameId: string): Texture;

        static fromCanvas(canvas: HTMLCanvasElement, scaleMode?: number, origin?: string): Texture;

        static fromVideo(video: HTMLVideoElement | string, scaleMode?: number): Texture;

        static addToCache(texture: Texture, id: string): void;

        static removeFromCache(texture: string | Texture): Texture;

        frame: Rectangle;
        protected _rotate: boolean | 0;
        rotate: number;
        width: number;
        height: number;

        static EMPTY: Texture;
        static WHITE: Texture;

        on(event: "update", fn: (texture: Texture) => void, context?: any): this;

        once(event: "update", fn: (texture: Texture) => void, context?: any): this;

        removeListener(event: "update", fn?: (texture: Texture) => void, context?: any): this;

        removeAllListeners(event?: "update"): this;

        off(event: "update", fn?: (texture: Texture) => void, context?: any): this;

        addListener(event: "update", fn: (texture: Texture) => void, context?: any): this;

    }

    export class TextureMatrix {

        constructor(texture: Texture, clampMargin?: number);

        protected _texture: Texture;
        mapCoord: Matrix;
        uClampFrame: Float32Array;
        uClampOffset: Float32Array;
        protected _lastTextureID: number;

        clampOffset: number;
        clampMargin: number;

        texture: Texture;

        update(forceUpdate?: boolean): boolean;

        multiplyUvs(uvs: Float32Array, out?: Float32Array): Float32Array;

    }

    export class TextureUvs {

        x0: number;
        y0: number;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        x3: number;
        y3: number;

        uvsUint32: Uint32Array;

        protected set(frame: Rectangle, baseFrame: Rectangle, rotate: number): void;

    }

    export namespace systems {
        export class TextureSystem extends System {
            boundTextures: Array<BaseTexture>;
            currentLocation: number;
            managedTextures: Array<BaseTexture>;

            bind(texture: BaseTexture | Texture, location?: number): void;

            unbind(texture: BaseTexture): void;

            initTexture(texture: BaseTexture): glCore.GLTexture;

            updateTexture(texture: BaseTexture): WebGLTexture;

            destroyTexture(texture: BaseTexture, _skipRemove?: boolean): void;

            updateTextureStyle(texture: BaseTexture): void;

            setStyle(texture: BaseTexture, glTexture: glCore.GLTexture): void;
        }

        export class TextureGCSystem extends System {
            count: number;
            checkCount: number;
            maxIdle: number;
            checkCountMax: number;
            mode: number;

            postrender(): void;

            run(): void;

            unload(displayObject: DisplayObject): void;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////Resources//////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export namespace resources {
        export class Resource {
            constructor(width?: number, height?: number);

            protected _width: number;
            protected _height: number;
            destroyed: boolean;
            internal: boolean;
            onResize: any;
            onUpdate: any;

            bind(baseTexture: BaseTexture): void;

            unbind(baseTexture: BaseTexture): void;

            resize(width: number, height: number): void;

            readonly valid: boolean;

            update(): void;

            load(): Promise<any>;

            readonly width: number;
            readonly height: number

            upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: glCore.GLTexture): boolean;

            style(renderer: Renderer, baseTexture: BaseTexture, glTexture: glCore.GLTexture): boolean;

            dispose(): void;

            destroy(): void;
        }

        export class BufferResource extends Resource {
            constructor(source: Float32Array | Uint8Array | Uint32Array, options?: any);

            static test(source: any): boolean;
        }

        export class BaseImageResource extends Resource {
            constructor(source: any);

            source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | SVGElement;

            static crossOrigin(element: HTMLElement, url: string, crossorigin: string | boolean): void;

            upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: glCore.GLTexture, source?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | SVGElement): boolean;
        }

        export class CanvasResource extends BaseImageResource {
            constructor(source: HTMLCanvasElement, options: any);

            static test(source: any): boolean;
        }

        export class CubeResource extends Resource {

        }

        export class SVGResource extends BaseImageResource {
            constructor(source: string, options: any);

            private _loadDataUri(dataUri: string): void;

            private _loadXhr(): void;

            private _loadString(svgString: string): void;

            static getSize(svgString: string): { width: number, height: number };

            static SVG_SIZE: RegExp;

            static test(source: any, extension: string): boolean;
        }

        export class ImageResource extends BaseImageResource {
            constructor(source: HTMLImageElement, options: any);

            load(createBitmap?: boolean): Promise<any>

            process(): Promise<any>;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////RenderTexture//////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export class BaseRenderTexture extends BaseTexture {

        constructor(options: IBaseTextureOptions);

        clearColor: Array<number>;
        frameBuffer: FrameBuffer;
        stencilMaskStack: Array<Graphics>;
        filterStack: Array<filters.IFilterState>;

        resize(width: number, height: number): void;

        destroy(): void;

        on(event: "update", fn: (baseRenderTexture: BaseRenderTexture) => void, context?: any): this;

        once(event: "update", fn: (baseRenderTexture: BaseRenderTexture) => void, context?: any): this;

        removeListener(event: "update", fn?: (baseRenderTexture: BaseRenderTexture) => void, context?: any): this;

        removeAllListeners(event?: "update"): this;

        off(event: "update", fn?: (baseRenderTexture: BaseRenderTexture) => void, context?: any): this;

        addListener(event: "update", fn: (baseRenderTexture: BaseRenderTexture) => void, context?: any): this;

    }

    export class RenderTexture extends Texture {

        constructor(baseRenderTexture: BaseRenderTexture, frame?: Rectangle);

        resize(width: number, height: number, resizeBaseTexture?: boolean): void;

        static create(options: IBaseTextureOptions): RenderTexture;

    }

    export namespace systems {
        export class RenderTextureSystem extends System {
            clearColor: Array<number>;
            defaultMaskStack: Array<Graphics>;
            defaultFilterStack: Array<filters.IFilterState>;
            renderTexture: RenderTexture | null;
            readonly sourceFrame: Rectangle;
            readonly destinationFrame: Rectangle;

            bind(renderTexture: RenderTexture, sourceFrame: Rectangle, destinationFrame: Rectangle): void;

            clear(clearColor: ArrayLike<number>): void;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////UTILS//////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    export interface DecomposedDataUri {
        mediaType: string;
        subType: string;
        encoding: string;
        data: any;
    }

    export namespace utils {
        export function uid(): number;

        export function hex2rgb(hex: number, out?: number[]): number[];

        export function hex2string(hex: number): string;

        export function rgb2hex(rgb: number[]): number;

        export function getResolutionOfUrl(url: string, defaultValue?: number): number;

        export function decomposeDataUri(dataUri: string): DecomposedDataUri | void;

        export function sayHello(type: string): void;

        export function skipHello(): void;

        export function isWebGLSupported(): boolean;

        export function sign(n: number): number;

        export function removeItems<T>(arr: T[], startIdx: number, removeCount: number): void;

        export function correctBlendMode(blendMode: number, premultiplied: boolean): number;

        export function premultiplyTint(tint: number, alpha: number): number;

        export function premultiplyRgba(rgb: Float32Array | number[], alpha: number, out?: Float32Array, premultiply?: boolean): Float32Array;

        export function premultiplyTintToRgba(tint: number, alpha: number, out?: Float32Array, premultiply?: boolean): Float32Array;

        export function clearTextureCache(): void;

        export function destroyTextureCache(): void;

        export const premultiplyBlendMode: number[][];
        export const TextureCache: any;
        export const BaseTextureCache: any;

        // https://github.com/kaimallea/isMobile
        export namespace isMobile {
            export const apple: {
                phone: boolean;
                ipod: boolean;
                tablet: boolean;
                device: boolean;
            };
            export const android: {
                phone: boolean;
                tablet: boolean;
                device: boolean;
            };
            export const amazon: {
                phone: boolean;
                tablet: boolean;
                device: boolean;
            };
            export const windows: {
                phone: boolean;
                tablet: boolean;
                device: boolean;
            };
            export const seven_inch: boolean;
            export const other: {
                blackberry10: boolean;
                blackberry: boolean;
                opera: boolean;
                firefox: boolean;
                chrome: boolean;
                device: boolean;
            };
            export const any: boolean;
            export const phone: boolean;
            export const tablet: boolean;
        }

        // https://github.com/primus/eventemitter3
        export class EventEmitter {

            static prefixed: string | boolean;

            static EventEmitter: {
                new(): EventEmitter;
                prefixed: string | boolean;
            };

            /**
             * Minimal EventEmitter interface that is molded against the Node.js
             * EventEmitter interface.
             *
             * @constructor
             * @api public
             */
            constructor();

            /**
             * Return an array listing the events for which the emitter has registered listeners.
             *
             * @returns {(string | symbol)[]}
             */
            eventNames(): Array<(string | symbol)>;

            /**
             * Return the listeners registered for a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @returns {Function[]}
             */
            //tslint:disable-next-line:ban-types forbidden-types
            listeners(event: string | symbol): Function[];

            /**
             * Check if there listeners for a given event.
             * If `exists` argument is not `true` lists listeners.
             *
             * @param {(string | symbol)} event The event name.
             * @param {boolean} exists Only check if there are listeners.
             * @returns {boolean}
             */
            listeners(event: string | symbol, exists: boolean): boolean;

            /**
             * Calls each of the listeners registered for a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @param {...*} args Arguments that are passed to registered listeners
             * @returns {boolean} `true` if the event had listeners, else `false`.
             */
            emit(event: string | symbol, ...args: any[]): boolean;

            /**
             * Add a listener for a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @param {Function} fn The listener function.
             * @param {*} [context=this] The context to invoke the listener with.
             * @returns {EventEmitter} `this`.
             */
            //tslint:disable-next-line:ban-types forbidden-types
            on(event: string | symbol, fn: Function, context?: any): this;

            /**
             * Add a one-time listener for a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @param {Function} fn The listener function.
             * @param {*} [context=this] The context to invoke the listener with.
             * @returns {EventEmitter} `this`.
             */
            //tslint:disable-next-line:ban-types forbidden-types
            once(event: string | symbol, fn: Function, context?: any): this;

            /**
             * Remove the listeners of a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @param {Function} fn Only remove the listeners that match this function.
             * @param {*} context Only remove the listeners that have this context.
             * @param {boolean} once Only remove one-time listeners.
             * @returns {EventEmitter} `this`.
             */
            //tslint:disable-next-line:ban-types forbidden-types
            removeListener(event: string | symbol, fn?: Function, context?: any, once?: boolean): this;

            /**
             * Remove all listeners, or those of the specified event.
             *
             * @param {(string | symbol)} event The event name.
             * @returns {EventEmitter} `this`.
             */
            removeAllListeners(event?: string | symbol): this;

            /**
             * Alias method for `removeListener`
             */
            //tslint:disable-next-line:ban-types forbidden-types
            off(event: string | symbol, fn?: Function, context?: any, once?: boolean): this;

            /**
             * Alias method for `on`
             */
            //tslint:disable-next-line:ban-types forbidden-types
            addListener(event: string | symbol, fn: Function, context?: any): this;

            /**
             * This function doesn't apply anymore.
             * @deprecated
             */
            setMaxListeners(): this;

        }

    }
}

//tslint:disable-next-line:no-single-declare-module
declare module "pixi.js" {
    export = PIXI;
}
