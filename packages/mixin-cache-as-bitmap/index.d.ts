import { CanvasRenderer } from '@pixi/canvas-renderer';
import { Container } from '@pixi/display';
import { IDestroyOptions } from '@pixi/display';
import { IPointData } from '@pixi/math';
import { MaskData } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { Renderer } from '@pixi/core';
import { Sprite } from '@pixi/sprite';

/**
 * @class
 * @ignore
 * @private
 */
export declare class CacheData {
    textureCacheId: string;
    originalRender: (renderer: Renderer) => void;
    originalRenderCanvas: (renderer: CanvasRenderer) => void;
    originalCalculateBounds: () => void;
    originalGetLocalBounds: (rect?: Rectangle) => Rectangle;
    originalUpdateTransform: () => void;
    originalDestroy: (options?: IDestroyOptions | boolean) => void;
    originalMask: Container | MaskData;
    originalFilterArea: Rectangle;
    originalContainsPoint: (point: IPointData) => boolean;
    sprite: Sprite;
    constructor();
}

export { }
