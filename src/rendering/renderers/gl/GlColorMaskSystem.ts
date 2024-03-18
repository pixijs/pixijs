import { ExtensionType } from '../../../extensions/Extensions';

import type { System } from '../shared/system/System';
import type { WebGLRenderer } from './WebGLRenderer';

/**
 * The system that handles color masking for the WebGL.
 * @memberof rendering
 */
export class GlColorMaskSystem implements System
{
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
