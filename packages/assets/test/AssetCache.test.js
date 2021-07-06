const { AssetCache } = require('../');
const chai = require('chai');

describe('AssetCache', function ()
{
    it('should get correct asset src', function ()
    {
        const assetCache = new AssetCache();

        assetCache.prefer({
            resolution: [1],
            format: ['png'],
            priority: ['resolution', 'format']
        });

        assetCache.add('test', [
            {
                resolution: 1,
                format: 'png',
                src: 'my-image.png'
            },
            {
                resolution: 2,
                format: 'png',
                src: 'my-image@2x.png'
            },
            {
                resolution: 1,
                format: 'webp',
                src: 'my-image.webp'
            },
            {
                resolution: 2,
                format: 'webp',
                src: 'my-image@2x.webp'
            },
        ]);

        const assetSrc = assetCache.getSrc('test');

        chai.expect(assetSrc).to.deep.equal({
            resolution: 1,
            format: 'png',
            src: 'my-image.png'
        });

        // change asset preferences...

        assetCache.prefer({
            resolution: [2, 1],
            format: ['png'],
            priority: ['resolution', 'format']
        });

        const assetSrc2 = assetCache.getSrc('test');

        chai.expect(assetSrc2).to.deep.equal({
            resolution: 2,
            format: 'png',
            src: 'my-image@2x.png'
        });

        const assetSrc3 = assetCache.getSrc('test');

        // change asset preferences...
        assetCache.prefer({
            resolution: [3, 2, 1],
            format: ['png'],
            priority: ['resolution', 'format']
        });

        chai.expect(assetSrc3).to.deep.equal({
            resolution: 2,
            format: 'png',
            src: 'my-image@2x.png'
        });

        assetCache.prefer({
            resolution: [2, 1],
            format: ['webp', 'png'],
            priority: ['resolution', 'format']
        });

        const assetSrc4 = assetCache.getSrc('test');

        chai.expect(assetSrc4).to.deep.equal({
            resolution: 2,
            format: 'webp',
            src: 'my-image@2x.webp'
        });
    });

    it('getSrc should get return null src if no matching key found', function ()
    {
        const assetCache = new AssetCache();

        assetCache.add('test', [
            {
                resolution: 1,
                format: 'png',
                src: 'my-image.png'
            }
        ]);

        const assetSrc = assetCache.getSrc('test2');

        chai.expect(assetSrc).to.be.null;
    });
});
