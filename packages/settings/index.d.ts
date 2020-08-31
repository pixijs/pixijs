import type { isMobileResult } from 'ismobilejs';

export declare interface IRenderOptions {
    view: HTMLCanvasElement;
    antialias: boolean;
    autoDensity: boolean;
    transparent: boolean;
    backgroundColor: number;
    clearBeforeRender: boolean;
    preserveDrawingBuffer: boolean;
    width: number;
    height: number;
    legacy: boolean;
}

export declare interface ISettings {
    MIPMAP_TEXTURES: number;
    ANISOTROPIC_LEVEL: number;
    RESOLUTION: number;
    FILTER_RESOLUTION: number;
    SPRITE_MAX_TEXTURES: number;
    SPRITE_BATCH_SIZE: number;
    RENDER_OPTIONS: IRenderOptions;
    GC_MODE: number;
    GC_MAX_IDLE: number;
    GC_MAX_CHECK_COUNT: number;
    WRAP_MODE: number;
    SCALE_MODE: number;
    PRECISION_VERTEX: string;
    PRECISION_FRAGMENT: string;
    CAN_UPLOAD_SAME_BUFFER: boolean;
    CREATE_IMAGE_BITMAP: boolean;
    ROUND_PIXELS: boolean;
    RETINA_PREFIX?: RegExp;
    FAIL_IF_MAJOR_PERFORMANCE_CAVEAT?: boolean;
    UPLOADS_PER_FRAME?: number;
    SORTABLE_CHILDREN?: boolean;
    PREFER_ENV?: number;
    STRICT_TEXTURE_CACHE?: boolean;
    MESH_CANVAS_PADDING?: number;
    TARGET_FPMS?: number;
}

export declare const isMobile: isMobileResult;

/**
 * User's customizable globals for overriding the default PIXI settings, such
 * as a renderer's default resolution, framerate, float precision, etc.
 * @example
 * // Use the native window resolution as the default resolution
 * // will support high-density displays when rendering
 * PIXI.settings.RESOLUTION = window.devicePixelRatio;
 *
 * // Disable interpolation when scaling, will make texture be pixelated
 * PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
 * @namespace PIXI.settings
 */
export declare const settings: ISettings;

export { }
