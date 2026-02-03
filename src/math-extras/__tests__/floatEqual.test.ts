import { floatEqual } from '../util';

describe('floatEqual', () =>
{
    it('should return true if the difference between values is less than epsilon',
        () =>
        {
            // 0.1 + 0.2 = 0.3 is the common floating point pitfall.
            expect(floatEqual(0.1 + 0.2, 0.3)).toEqual(true);

            // now let's make it false
            expect(floatEqual(0.1 + 0.2 + 0.00001, 0.3)).toEqual(false);
        });
});
