import { PRECISION } from '@pixi/constants';

/**
 * Sets the float precision on the shader, ensuring the device supports the request precision.
 * If the precision is already present, it just ensures that the device is able to handle it.
 *
 * @private
 * @param {string} src - The shader source
 * @param {PIXI.PRECISION} requestedPrecision - The request float precision of the shader.
 * @param {PIXI.PRECISION} maxSupportedPrecision - The maximum precision the shader supports.
 *
 * @return {string} modified shader source
 */
export function setPrecision(src: string, requestedPrecision: PRECISION, maxSupportedPrecision: PRECISION): string
{
    if (!(/^\s*precision\s+(lowp|mediump|highp)\s+float\s*;/m).test(src))
    {
        // no precision supplied, so PixiJS will add the requested level.
        let precision = requestedPrecision;

        // If highp is requested but not supported, downgrade precision to a level all devices support.
        if (requestedPrecision === PRECISION.HIGH && maxSupportedPrecision !== PRECISION.HIGH)
        {
            precision = PRECISION.MEDIUM;
        }

        return `precision ${precision} float;\n${src}`;
    }
    else if (maxSupportedPrecision !== PRECISION.HIGH)
    {
        // precision was supplied, but at a level this device does not support, so downgrading to mediump.
        return src.replace(/^\s*precision\s+highp\s+float\s*;/mg, 'precision mediump float;');
    }

    return src;
}
