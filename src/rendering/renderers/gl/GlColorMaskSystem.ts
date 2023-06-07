import { ExtensionType } from '../../../extensions/Extensions';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { ISystem } from '../shared/system/ISystem';
import type { WebGLRenderer } from './WebGLRenderer';

export class GlColorMaskSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererSystem,
        ],
        name: 'colorMask',
    };

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
