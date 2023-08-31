import { getTestContext } from './getTestContext';

import type { PRECISION } from '../const';

let maxFragmentPrecision: PRECISION;

export function getMaxFragmentPrecision(): PRECISION
{
    if (!maxFragmentPrecision)
    {
        maxFragmentPrecision = 'mediump';
        const gl = getTestContext();

        if (gl)
        {
            if (gl.getShaderPrecisionFormat)
            {
                const shaderFragment = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);

                maxFragmentPrecision = shaderFragment.precision ? 'highp' : 'mediump';
            }
        }
    }

    return maxFragmentPrecision;
}
