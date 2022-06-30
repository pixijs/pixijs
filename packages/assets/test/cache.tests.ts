import type { CacheParser } from '@pixi/assets';
import { Cache } from '@pixi/assets';

const testParser = {
    test: (asset: string) => typeof asset === 'string',
    getCacheableAssets: (keys: string[], asset: string) =>
    {
        const out: Record<string, string> = {};

        keys.forEach((key) =>
        {
            out[key] = `${asset}-${key}`;
        });

        return out;
    }
}as CacheParser<string>;

describe('Cache', () =>
{
    beforeEach(() =>
    {
        Cache.reset();
    });

    it('should add and remove a plugin', () =>
    {
        Cache.addParser(testParser);

        expect(Cache.parsers).toHaveLength(1);

        Cache.removeParser(testParser);

        expect(Cache.parsers).toHaveLength(0);
    });

    it('should process a custom parsers correctly', () =>
    {
        Cache.addParser(testParser);

        Cache.set('test', 'hello');

        const out = Cache.get('test');

        expect(out).toBe('hello-test');
    });

    it('should process multiple keys with a custom parser correctly', () =>
    {
        Cache.addParser(testParser);

        Cache.set(['test', 'chicken'], 'hello');

        const out = Cache.get('test');

        expect(out).toBe('hello-test');

        const chicken = Cache.get('chicken');

        expect(chicken).toBe('hello-chicken');
    });

    it('should remove keys with a custom parsers correctly', () =>
    {
        Cache.addParser(testParser);

        Cache.set('test', 'hello');

        Cache.remove('test');

        const out = Cache.get('test');

        expect(out).toBe(undefined);
    });

    it('should remove multiple keys with a custom parser correctly', () =>
    {
        Cache.addParser(testParser);

        Cache.set(['test', 'chicken'], 'hello');

        Cache.remove('test');

        const out = Cache.get('test');

        expect(out).toBe(undefined);

        const chicken = Cache.get('chicken');

        expect(chicken).toBe(undefined);
    });
});
