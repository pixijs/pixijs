import { ExtensionType } from '../../../extensions/Extensions';

import type { System } from '../shared/system/System';
import type { WebGLRenderer } from './WebGLRenderer';

const typeSymbol = Symbol.for('pixijs.GlColorMaskSystem');

/**
 * The system that handles color masking for the WebGL.
 * @category rendering
 * @advanced
 */
export class GlColorMaskSystem implements System
{
    /**
     * Type symbol used to identify instances of GlColorMaskSystem.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GlColorMaskSystem.
     * @param obj - The object to check.
     * @returns True if the object is a GlColorMaskSystem, false otherwise.
     */
    public static isGlColorMaskSystem(obj: any): obj is GlColorMaskSystem
    {
        return !!obj && !!obj[typeSymbol];
    }

    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'colorMask',
    } as const;

    private readonly _renderer: WebGLRenderer;
    private _colorMaskCache = 0b1111;

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    public setMask(colorMask: number)
    {
        if (this._colorMaskCache === colorMask) return;
        this._colorMaskCache = colorMask;

        this._renderer.gl.colorMask(
            !!(colorMask & 0b1000),
            !!(colorMask & 0b0100),
            !!(colorMask & 0b0010),
            !!(colorMask & 0b0001)
        );
    }

    public destroy?: () => void;
}
