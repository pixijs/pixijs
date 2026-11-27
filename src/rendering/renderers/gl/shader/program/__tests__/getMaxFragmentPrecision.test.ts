import { getMaxFragmentPrecision } from '../getMaxFragmentPrecision';
import { getTestContext } from '../getTestContext';

describe('getMaxFragmentPrecision', () =>
{
    it('should fall back to mediump when the context is lost', () =>
    {
        const gl = getTestContext();

        jest.spyOn(gl, 'getShaderPrecisionFormat').mockReturnValue(null);

        expect(getMaxFragmentPrecision()).toBe('mediump');
    });
});
