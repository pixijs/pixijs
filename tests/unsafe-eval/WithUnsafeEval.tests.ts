import { Application } from '../../src/app/Application';
import { disableUnsafeEval } from '../utils/disableUnsafeEval';
import { getApp } from '../utils/getApp';
import '../../src/unsafe-eval/init';

describe('WithUnsafeEval', () =>
{
    beforeAll(() =>
    {
        disableUnsafeEval();
    });

    it('should create Application with unsafe-eval', async () =>
    {
        await expect((async () =>
        {
            const app = await getApp();

            expect(app).toBeInstanceOf(Application);

            app.destroy();
        })()).resolves.not.toThrow();
    });
});
