import { expect } from 'chai';
import { floatEqual } from '@pixi/math-extras';

describe('floatEqual', function ()
{
    it('should return true if the difference between values is less than epsilon',
        function ()
        {
            // 0.1 + 0.2 = 0.3 is the common floating point pitfall.
            expect(floatEqual(0.1 + 0.2, 0.3)).to.equal(true);

            // now let's make it false
            expect(floatEqual(0.1 + 0.2 + 0.00001, 0.3)).to.equal(false);
        });
});
