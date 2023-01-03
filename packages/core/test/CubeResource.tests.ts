import path from 'path';
import { BaseTexture, CubeResource } from '@pixi/core';

describe('CubeResource', () =>
{
    let baseTexUrl: string;

    beforeAll(() =>
    {
        baseTexUrl = path.resolve(__dirname, 'resources', 'slug.png');
    });

    it('should create invalid length resource', () =>
    {
        expect(() =>
        {
            // @ts-expect-error - using an invalid length
            // eslint-disable-next-line no-new
            new CubeResource([null, null, null, null, null, null, null, null]);
        }).toThrowWithMessage(Error, 'Invalid length. Got 8, expected 6');
    });
    it('should be created through BaseTexture.from()', () =>
    {
        const path1 = baseTexUrl;
        const baseTex = BaseTexture.from([path1, path1, path1, path1, path1, path1]);

        expect(baseTex.resource).toBeInstanceOf(CubeResource);
    });
});
