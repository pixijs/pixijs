let supported;

/**
 * Helper for checking for WebGL support.
 *
 * @memberof PIXI.utils
 * @function isWebGLSupported
 * @return {boolean} Is WebGL supported.
 */
export function isWebGLSupported()
{
    if (typeof supported === 'undefined')
    {
        supported = (function supported()
        {
            const contextOptions = { stencil: true, failIfMajorPerformanceCaveat: true };

            try
            {
                if (!window.WebGLRenderingContext)
                {
                    return false;
                }

                const canvas = document.createElement('canvas');
                let gl = canvas.getContext('webgl', contextOptions)
                    || canvas.getContext('experimental-webgl', contextOptions);

                const success = !!(gl && gl.getContextAttributes().stencil);

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
