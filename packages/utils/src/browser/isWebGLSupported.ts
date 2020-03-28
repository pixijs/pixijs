import { settings } from '../settings';

let supported: boolean|undefined;

/**
 * Helper for checking for WebGL support.
 * Also sets some props in settings related to WebGL
 *
 * @memberof PIXI.utils
 * @function isWebGLSupported
 * @return {boolean} Is WebGL supported.
 */
export function isWebGLSupported(): boolean
{
    if (typeof supported === 'undefined')
    {
        supported = (function supported(): boolean
        {
            const contextOptions = {
                stencil: true,
                antialias: true,
                failIfMajorPerformanceCaveat: settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT,
            };

            try
            {
                if (!window.WebGLRenderingContext)
                {
                    return false;
                }

                const canvas = document.createElement('canvas');
                let gl = (
                    canvas.getContext('webgl', contextOptions)
                    || canvas.getContext('experimental-webgl', contextOptions)
                ) as WebGLRenderingContext;

                gl = canvas.getContext('webgl', contextOptions) as WebGLRenderingContext;

                if (!gl)
                {
                    // Hello, windows XP mozilla!

                    contextOptions.antialias = false;
                    contextOptions.stencil = true;

                    gl = canvas.getContext('webgl', contextOptions) as WebGLRenderingContext;
                }

                if (!gl)
                {
                    contextOptions.antialias = false;
                    contextOptions.stencil = false;

                    gl = canvas.getContext('webgl', contextOptions) as WebGLRenderingContext;
                }

                if (!gl)
                {
                    contextOptions.antialias = true;
                    contextOptions.stencil = false;

                    gl = canvas.getContext('webgl', contextOptions) as WebGLRenderingContext;
                }

                if (!gl)
                {
                    contextOptions.antialias = true;
                    contextOptions.stencil = true;

                    gl = canvas.getContext('experimental-webgl', contextOptions) as WebGLRenderingContext;
                }

                if (!gl)
                {
                    gl = null;
                }
                else
                {
                    settings.WEBGL_DISABLE_ANTIALIAS = !contextOptions.antialias;
                    settings.WEBGL_DISABLE_STENCIL = !contextOptions.stencil;
                }

                const success = !!gl;

                if (gl)
                {
                    const loseContext = gl.getExtension('WEBGL_lose_context');

                    if (loseContext)
                    {
                        loseContext.loseContext();
                    }
                }

                gl = null;

                return success;
            }
            catch (e)
            {
                return false;
            }
        })();
    }

    return supported;
}
