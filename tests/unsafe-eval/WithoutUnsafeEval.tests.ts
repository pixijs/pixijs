import { disableUnsafeEval } from '../utils/disableUnsafeEval';
import { getApp } from '../utils/getApp';

describe('WithoutUnsafeEval', () =>
{
    beforeAll(() =>
    {
        disableUnsafeEval();
    });

    it('should not create Application without unsafe-eval', async () =>
    {
        await expect(getApp()).rejects.toThrow(
            'Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.'
        );
    });
});
