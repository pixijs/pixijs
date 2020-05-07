import { settings } from '../../settings';
import { ENV } from '@pixi/constants';

const unknownContext = {};

/**
 * Helper class to expose getTestContext for modification
 *
 * @class
 */
class TestContext
{
    private context: WebGLRenderingContext | WebGL2RenderingContext = unknownContext as any;
    /**
     * returns a little WebGL context to use for program inspection.
     *
     * @static
     * @returns {WebGLRenderingContext} a gl context to test with
     */
    public getTestContext(): WebGLRenderingContext | WebGL2RenderingContext
    {
        if (this.context === unknownContext || (this.context && this.context.isContextLost()))
        {
            const canvas = document.createElement('canvas');

            let gl: WebGLRenderingContext | WebGL2RenderingContext;

            if (settings.PREFER_ENV >= ENV.WEBGL2)
            {
                gl = canvas.getContext('webgl2', {});
            }

            if (!gl)
            {
                gl = canvas.getContext('webgl', {})
                    || (canvas.getContext('experimental-webgl', {}) as WebGLRenderingContext);

                if (!gl)
                {
                    // fail, not able to get a context
                    gl = null;
                }
                else
                {
                    // for shader testing..
                    gl.getExtension('WEBGL_draw_buffers');
                }
            }

            this.context = gl;
        }

        return this.context;
    }
}

const testContext = new TestContext();

export {
    testContext,
};
