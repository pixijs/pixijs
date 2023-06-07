import type { PRECISION } from '../const';

/**
 * Sets the float precision on the shader, ensuring the device supports the request precision.
 * If the precision is already present, it just ensures that the device is able to handle it.
 * @param src
 * @param root0
 * @param root0.requestedPrecision
 * @param root0.maxSupportedPrecision
 */
export function ensurePrecision(
    src: string,
    { requestedPrecision, maxSupportedPrecision }: {requestedPrecision: PRECISION, maxSupportedPrecision: PRECISION}
): string
{
    if (src.substring(0, 9) !== 'precision')
    {
        // no precision supplied, so PixiJS will add the requested level.
        let precision = requestedPrecision;

        // If highp is requested but not supported, downgrade precision to a level all devices support.
        if (requestedPrecision === 'highp' && maxSupportedPrecision !== 'highp')
        {
            precision = 'mediump';
        }

        if (src.substring(0, 8) !== '#version')
        {
            return `precision ${precision} float;\n${src}`;
        }

        // get the first line break in the src
        const firstLineBreak = src.indexOf('\n');

        // insert the precision statement after the first line
        return `${src.substring(0, firstLineBreak + 1)}precision ${precision} float;\n${src.substring(firstLineBreak + 1)}`;
    }
    else if (maxSupportedPrecision !== 'highp' && src.substring(0, 15) === 'precision highp')
    {
        // precision was supplied, but at a level this device does not support, so downgrading to mediump.
        return src.replace('precision highp', 'precision mediump');
    }

    return src;
}
