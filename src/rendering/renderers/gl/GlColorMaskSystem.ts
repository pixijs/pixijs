import { ExtensionType } from '../../../extensions/Extensions';

import type { System } from '../shared/system/System';
import type { WebGLRenderer } from './WebGLRenderer';

export class GlColorMaskSystem implements System
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'colorMask',
    } as const;

    private renderer: WebGLRenderer;
    private colorMaskCache = 0b1111;

    constructor(renderer: WebGLRenderer)
    {
        this.renderer = renderer;
    }

    setMask(colorMask: number)
    {
        if (this.colorMaskCache === colorMask) return;
        this.colorMaskCache = colorMask;

        this.renderer.gl.colorMask(
            !!(colorMask & 0b1000),
            !!(colorMask & 0b0100),
            !!(colorMask & 0b0010),
            !!(colorMask & 0b0001)
        );
    }

    destroy()
    {
        // boom
    }
}
