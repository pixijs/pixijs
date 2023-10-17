import { settings } from '../../settings/settings';

let _isWebGLSupported: boolean | undefined;

/**
 * Helper for checking for WebGL support.
 * @memberof utils
 * @function isWebGLSupported
 * @returns {boolean} Is WebGL supported.
 */
export function isWebGLSupported(): boolean
{
    if (_isWebGLSupported !== undefined) return _isWebGLSupported;

    _isWebGLSupported = ((): boolean =>
    {
        const contextOptions = {
            stencil: true,
            failIfMajorPerformanceCaveat: settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT,
        };

        try
        {
            if (!settings.ADAPTER.getWebGLRenderingContext())
            {
                return false;
            }

            const canvas = settings.ADAPTER.createCanvas();
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

    return _isWebGLSupported;
}
