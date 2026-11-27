import { DOMAdapter } from '../../environment/adapter';
import { AbstractRenderer } from '../../rendering/renderers/shared/system/AbstractRenderer';

let _isWebGLSupported = false;

/**
 * Helper for checking for WebGL support in the current environment.
 *
 * A successful result is cached for better performance. A failed check is not cached, since the
 * failure can be temporary (for example, the browser couldn't create a context at that moment),
 * so calling it again checks again.
 * @example
 * ```ts
 * // Basic WebGL support check
 * if (isWebGLSupported()) {
 *     console.log('WebGL is available');
 * }
 * ```
 * @param failIfMajorPerformanceCaveat - Whether to fail if there is a major performance caveat
 * @returns True if WebGL is supported
 * @category utils
 * @standard
 */
export function isWebGLSupported(
    failIfMajorPerformanceCaveat?: boolean
): boolean
{
    if (_isWebGLSupported) return true;

    const supported = ((): boolean =>
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

    _isWebGLSupported = supported;

    return supported;
}
