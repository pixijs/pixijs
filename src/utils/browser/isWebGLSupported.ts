import { DOMAdapter } from '../../environment/adapter';

let supported: boolean | undefined;

/**
 * Helper for checking for WebGL support.
 * @param failIfMajorPerformanceCaveat
 * @memberof utils
 * @function isWebGLSupported
 * @returns {boolean} Is WebGL supported.
 */
export function isWebGLSupported(failIfMajorPerformanceCaveat: boolean): boolean
{
    if (typeof supported === 'undefined')
    {
        supported = (function supported(): boolean
        {
            const contextOptions = {
                stencil: true,
                failIfMajorPerformanceCaveat,
            };

            try
            {
                if (!DOMAdapter.get().getWebGLRenderingContext())
                {
                    return false;
                }

                const canvas = DOMAdapter.get().createCanvas();
                let gl: WebGLRenderingContext = canvas.getContext('webgl2', contextOptions);

                const success = !!gl?.getContextAttributes()?.stencil;

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
