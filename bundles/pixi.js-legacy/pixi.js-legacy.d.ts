///<reference types="pixi.js"/>

//tslint:disable-next-line:no-single-declare-module
declare module "pixi.js-legacy" {
    export = PIXI;
}

//////////////////////////////////////////////////////////////////////////////
/////////////////////////////CANVAS///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
declare namespace PIXI {
    export function autoDetectRenderer(width: number, height: number, options?: PIXI.RendererOptions, forceCanvas?: boolean): PIXI.Renderer | PIXI.CanvasRenderer;
    export function autoDetectRenderer(options?: PIXI.RendererOptions): PIXI.Renderer | PIXI.CanvasRenderer;

    export namespace settings {
        export let MESH_CANVAS_PADDING: number;
    }

    export interface DisplayObject {
        renderCanvas(renderer: CanvasRenderer): void;
        _renderCachedCanvas(renderer: CanvasRenderer): void;
        _initCachedDisplayObjectCanvas(renderer: CanvasRenderer): void;
    }

    export interface Container {
        _renderCanvas(renderer: CanvasRenderer): void;
    }

    export interface Graphics {
        generateCanvasTexture(scaleMode?: number, resolution?: number): Texture;
    }

    export class CanvasSpriteRenderer extends ObjectRenderer {

        constructor(renderer: Renderer);

        render(sprite: Sprite): void;
        destroy(): void;

    }
    export class CanvasGraphicsRenderer {

        constructor(renderer: SystemRenderer);
        render(graphics: Graphics): void;
        updateGraphicsTint(graphics: Graphics): void;
        renderPolygon(points: Point[], close: boolean, context: CanvasRenderingContext2D): void;
        destroy(): void;

    }
    export namespace CanvasTinter {

        export function getTintedTexture(sprite: Sprite, color: number): HTMLCanvasElement;
        export function tintWithMultiply(texture: Texture, color: number, canvas: HTMLCanvasElement): void;
        export function tintWithOverlay(texture: Texture, color: number, canvas: HTMLCanvasElement): void;
        export function tintWithPerPixel(texture: Texture, color: number, canvas: HTMLCanvasElement): void;
        export function roundColor(color: number): number;

        export let cacheStepsPerColorChannel: number;
        export let convertTintToImage: boolean;
        export let canUseMultiply: boolean;
        export let tintMethod: number;

    }

    export interface Mesh {
        canvasPadding: number;
        _canvasPadding: number;
    }

    export class CanvasMeshRenderer {
        constructor(renderer: CanvasRenderer);

        renderer: CanvasRenderer;

        render(mesh: Mesh): void;
        protected _renderTriangleMesh(mesh: Mesh): void;
        protected _renderTriangles(mesh: Mesh): void;
        protected _renderDrawTriangle(mesh: Mesh, index0: number, index1: number, index2: number): void;
        protected renderMeshFlat(mesh: Mesh): void;

        destroy(): void;
    }

    export interface NineSlicePlane {
        drawSegment(context: CanvasRenderingContext2D | WebGLRenderingContext, textureSource: any, w: number, h: number, x1: number, y1: number, x2: number, y2: number): void;
    }

    interface DefaultCanvasRendererPlugins {
        extract: extract.CanvasExtract;
        prepare: prepare.CanvasPrepare;
    }
    export interface CanvasRendererPlugins extends DefaultCanvasRendererPlugins, RendererPlugins {
    }
    export class CanvasRenderer extends SystemRenderer {

        // plugintarget mixin start
        static __plugins: { [pluginName: string]: { new(renderer: CanvasRenderer): any; } };
        static registerPlugin(pluginName: string, ctor: { new(renderer: CanvasRenderer): any; }): void;
        plugins: CanvasRendererPlugins;
        initPlugins(): void;
        destroyPlugins(): void;
        // plugintarget mixin end

        constructor(options?: RendererOptions);
        constructor(screenWidth?: number, screenHeight?: number, options?: RendererOptions);

        protected _activeBlendMode: number;
        rootContext: CanvasRenderingContext2D;
        rootResolution?: number;
        refresh: boolean;
        maskManager: CanvasMaskManager;
        smoothProperty: string;
        extract: extract.CanvasExtract;

        context: CanvasRenderingContext2D | null;

        render(displayObject: PIXI.DisplayObject, renderTexture?: PIXI.RenderTexture, clear?: boolean, transform?: PIXI.Transform, skipUpdateTransform?: boolean): void
        setBlendMode(blendMode: number): void;
        destroy(removeView?: boolean): void;
        clear(clearColor?: string): void;
        invalidateBlendMode(): void;

        on(event: "prerender" | "postrender", fn: () => void, context?: any): this;
        once(event: "prerender" | "postrender", fn: () => void, context?: any): this;
        removeListener(event: "prerender" | "postrender", fn?: () => void, context?: any): this;
        removeAllListeners(event?: "prerender" | "postrender"): this;
        off(event: "prerender" | "postrender", fn?: () => void, context?: any): this;
        addListener(event: "prerender" | "postrender", fn: () => void, context?: any): this;

    }
    export class CanvasMaskManager {

        constructor(renderer: CanvasRenderer);

        pushMask(maskData: any): void;
        protected renderGraphicsShape(graphics: Graphics): void;
        popMask(renderer: Renderer | CanvasRenderer): void;
        destroy(): void;

    }
    export class CanvasRenderTarget {

        constructor(width: number, height: number, resolution: number);

        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        resolution: number;

        width: number;
        height: number;

        clear(): void;
        resize(width: number, height: number): void;
        destroy(): void;

    }

    export namespace prepare {
        export class CanvasPrepare extends BasePrepare<CanvasPrepare> {

            constructor(renderer: CanvasRenderer);

            protected canvas: HTMLCanvasElement;
            protected ctx: CanvasRenderingContext2D;

        }
    }

    export namespace extract  {
        export class CanvasExtract {

            protected renderer: CanvasRenderer;

            constructor(renderer: CanvasRenderer);

            image(target?: DisplayObject | RenderTexture): HTMLImageElement;
            base64(target?: DisplayObject | RenderTexture): string;
            canvas(target?: DisplayObject | RenderTexture): HTMLCanvasElement;
            pixels(renderTexture?: DisplayObject | RenderTexture): Uint8ClampedArray;

            destroy(): void;

        }
    }
}
