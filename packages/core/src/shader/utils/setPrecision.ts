import { PRECISION } from '@pixi/constants';

/**
 * Sets the float precision on the shader, ensuring the device supports the request precision.
 * If the precision is already present, it just ensures that the device is able to handle it.
 *
 * @private
 * @param {string} src - The shader source
 * @param {string} requestedPrecision - The request float precision of the shader. Options are 'lowp', 'mediump' or 'highp'.
 * @param {string} maxSupportedPrecision - The maximum precision the shader supports.
 *
 * @return {string} modified shader source
 */
export function setPrecision(src: string, requestedPrecision: string, maxSupportedPrecision: string): string
{
    if (src.substring(0, 9) !== 'precision')
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
    else if (maxSupportedPrecision !== PRECISION.HIGH && src.substring(0, 15) === 'precision highp')
    {
        // precision was supplied, but at a level this device does not support, so downgrading to mediump.
        return src.replace('precision highp', 'precision mediump');
    }

    return src;
}
