import { CubeResource, BaseTexture } from '@pixi/core';
import path from 'path';
import { expect } from 'chai';

describe('CubeResource', () =>
{
    let baseTexUrl: string;

    before(() =>
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
        }).to.throw(Error, /invalid length/i);
    });
    it('should be created through BaseTexture.from()', () =>
    {
        const path1 = baseTexUrl;
        const baseTex = BaseTexture.from([path1, path1, path1, path1, path1, path1]);

        expect(baseTex.resource).to.be.instanceof(CubeResource);
    });
});
