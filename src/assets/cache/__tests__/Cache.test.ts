import { Cache } from '../Cache';

import type { CacheParser } from '../CacheParser';

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
} as CacheParser<string>;

describe('Cache', () =>
{
    beforeEach(() =>
    {
        Cache.reset();
        (Cache as any)['_parsers'] = [];
    });

    it('should process a custom parsers correctly', () =>
    {
        Cache['_parsers'].push(testParser);

        Cache.set('test', 'hello');

        const out = Cache.get('test');

        expect(out).toBe('hello-test');
    });

    it('should process multiple keys with a custom parser correctly', () =>
    {
        Cache['_parsers'].push(testParser);

        Cache.set(['test', 'chicken'], 'hello');

        const out = Cache.get('test');

        expect(out).toBe('hello-test');

        const chicken = Cache.get('chicken');

        expect(chicken).toBe('hello-chicken');
    });

    it('should remove keys with a custom parsers correctly', () =>
    {
        Cache['_parsers'].push(testParser);

        Cache.set('test', 'hello');

        Cache.remove('test');

        const out = Cache.get('test');

        expect(out).toBe(undefined);
    });

    it('should remove multiple keys with a custom parser correctly', () =>
    {
        Cache['_parsers'].push(testParser);

        Cache.set(['test', 'chicken'], 'hello');

        Cache.remove('test');

        const out = Cache.get('test');

        expect(out).toBe(undefined);

        const chicken = Cache.get('chicken');

        expect(chicken).toBe(undefined);
    });
});
