import { MSAA_QUALITY } from '@pixi/constants';
import type { ISystem } from '../system/ISystem';
import type { Renderer } from '../Renderer';
import type { IRenderingContext } from '../IRenderer';
import type { ExtensionMetadata } from '@pixi/extensions';
import { extensions, ExtensionType } from '@pixi/extensions';

/**
 * System that manages the multisample property on the WebGL renderer
 * @memberof PIXI
 */
export class MultisampleSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: ExtensionType.RendererSystem,
        name: '_multisample',
    };

    /**
     * The number of msaa samples of the canvas.
     * @readonly
     */
    public multisample: MSAA_QUALITY;

    private renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    protected contextChange(gl: IRenderingContext): void
    {
        let samples;

        if (this.renderer.context.webGLVersion === 1)
        {
            const framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            samples = gl.getParameter(gl.SAMPLES);

            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        }
        else
        {
            const framebuffer = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);

            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

            samples = gl.getParameter(gl.SAMPLES);

            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer);
        }

        if (samples >= MSAA_QUALITY.HIGH)
        {
            this.multisample = MSAA_QUALITY.HIGH;
        }
        else if (samples >= MSAA_QUALITY.MEDIUM)
        {
            this.multisample = MSAA_QUALITY.MEDIUM;
        }
        else if (samples >= MSAA_QUALITY.LOW)
        {
            this.multisample = MSAA_QUALITY.LOW;
        }
        else
        {
            this.multisample = MSAA_QUALITY.NONE;
        }
    }

    destroy(): void
    {
        // ka boom!
    }
}

extensions.add(MultisampleSystem);
