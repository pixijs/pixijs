import { PRECISION } from '@pixi/constants';
import { getTestContext } from './getTestContext';

let maxFragmentPrecision: PRECISION;

export function getMaxFragmentPrecision(): PRECISION
{
    if (!maxFragmentPrecision)
    {
        maxFragmentPrecision = PRECISION.MEDIUM;
        const gl = getTestContext();

        if (gl)
        {
            if (gl.getShaderPrecisionFormat)
            {
                const shaderFragment = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);

                if (shaderFragment)
                {
                    maxFragmentPrecision = shaderFragment.precision ? PRECISION.HIGH : PRECISION.MEDIUM;
                }
            }
        }
    }

    return maxFragmentPrecision;
}
