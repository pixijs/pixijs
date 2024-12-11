import { DOMAdapter } from '../../environment/adapter';
import { AbstractRenderer } from '../../rendering/renderers/shared/system/AbstractRenderer';

let _isWebGLSupported: boolean | undefined;

/**
 * Helper for checking for WebGL support.
 * @param failIfMajorPerformanceCaveat - whether to fail if there is a major performance caveat, defaults to false
 * @memberof utils
 * @function isWebGLSupported
 * @returns {boolean} Is WebGL supported.
 */
export function isWebGLSupported(
    failIfMajorPerformanceCaveat?: boolean
): boolean
{
    if (_isWebGLSupported !== undefined) return _isWebGLSupported;

    _isWebGLSupported = ((): boolean =>
    {
        const contextOptions = {
            stencil: true,
            failIfMajorPerformanceCaveat:
                failIfMajorPerformanceCaveat
                ?? AbstractRenderer.defaultOptions.failIfMajorPerformanceCaveat,
        };

        try
        {
            if (!DOMAdapter.get().getWebGLRenderingContext())
            {
                return false;
            }

            const canvas = DOMAdapter.get().createCanvas();
            let gl = canvas.getContext('webgl', contextOptions);

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
        catch (_e)
        {
            return false;
        }
    })();

    return _isWebGLSupported;
}
