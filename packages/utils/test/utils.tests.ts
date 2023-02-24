import * as utils from '@pixi/utils';

describe('utils', () =>
{
    describe('uid', () =>
    {
        it('should exist', () =>
        {
            expect(utils.uid).toBeInstanceOf(Function);
        });

        it('should return a number', () =>
        {
            expect(utils.uid()).toBeNumber();
        });
    });

    describe('getResolutionOfUrl', () =>
    {
        it('should exist', () =>
        {
            expect(utils.getResolutionOfUrl).toBeInstanceOf(Function);
        });

        // it('should return the correct resolution based on a URL');
    });

    describe('decomposeDataUri', () =>
    {
        it('should exist', () =>
        {
            expect(utils.decomposeDataUri).toBeInstanceOf(Function);
        });

        it('should decompose a data URI', () =>
        {
            const dataUri = utils.decomposeDataUri('data:image/png;base64,94Z9RWUN77ZW');

            expect(dataUri).toBeObject();
            expect(dataUri?.mediaType).toEqual('image');
            expect(dataUri?.subType).toEqual('png');
            expect(dataUri?.charset).toBeUndefined();
            expect(dataUri?.encoding).toEqual('base64');
            expect(dataUri?.data).toEqual('94Z9RWUN77ZW');
        });

        it('should decompose a data URI with charset', () =>
        {
            const dataUri = utils.decomposeDataUri('data:image/svg+xml;charset=utf8;base64,PGRpdiB4bWxucz0Pg==');

            expect(dataUri).toBeObject();
            expect(dataUri?.mediaType).toEqual('image');
            expect(dataUri?.subType).toEqual('svg+xml');
            expect(dataUri?.charset).toEqual('utf8');
            expect(dataUri?.encoding).toEqual('base64');
            expect(dataUri?.data).toEqual('PGRpdiB4bWxucz0Pg==');
        });

        it('should decompose a data URI with charset without encoding', () =>
        {
            const dataUri = utils.decomposeDataUri('data:image/svg+xml;charset=utf8,PGRpdiB4bWxucz0Pg==');

            expect(dataUri).toBeObject();
            expect(dataUri?.mediaType).toEqual('image');
            expect(dataUri?.subType).toEqual('svg+xml');
            expect(dataUri?.charset).toEqual('utf8');
            expect(dataUri?.encoding).toBeUndefined();
            expect(dataUri?.data).toEqual('PGRpdiB4bWxucz0Pg==');
        });

        it('should return undefined for anything else', () =>
        {
            const dataUri = utils.decomposeDataUri('foo');

            expect(dataUri).toBeUndefined();
        });
    });

    describe('sayHello', () =>
    {
        it('should exist', () =>
        {
            expect(utils.sayHello).toBeInstanceOf(Function);
        });
    });

    describe('isWebGLSupported', () =>
    {
        it('should exist', () =>
        {
            expect(utils.isWebGLSupported).toBeInstanceOf(Function);
        });
    });

    describe('sign', () =>
    {
        it('should return 0 for 0', () =>
        {
            expect(utils.sign(0)).toEqual(0);
        });

        it('should return -1 for negative numbers', () =>
        {
            for (let i = 0; i < 10; i += 1)
            {
                expect(utils.sign(-Math.random())).toEqual(-1);
            }
        });

        it('should return 1 for positive numbers', () =>
        {
            for (let i = 0; i < 10; i += 1)
            {
                expect(utils.sign(Math.random() + 0.000001)).toEqual(1);
            }
        });
    });

    describe('.removeItems', () =>
    {
        it('should exist', () =>
        {
            expect(utils.removeItems).toBeInstanceOf(Function);
        });

        it('should return if the start index is greater than or equal to the length of the array', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, arr.length + 1, 5);
            expect(arr.length).toEqual(10);
        });

        it('should return if the remove count is 0', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, 2, 0);
            expect(arr.length).toEqual(10);
        });

        it('should remove the number of elements specified from the array, starting from the start index', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, 3, 4);
            expect(arr).toEqual([1, 2, 3, 8, 9, 10]);
        });

        it('should remove other elements if delete count is > than the number of elements after start index', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, 7, 10);
            expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7]);
        });
    });

    describe('EventEmitter', () =>
    {
        it('should exist', () =>
        {
            expect(utils.EventEmitter).toBeInstanceOf(Function);
        });
    });

    describe('isMobile', () =>
    {
        it('should exist', () =>
        {
            expect(utils.isMobile).toBeObject();
        });

        it('should return a boolean for .any', () =>
        {
            expect(utils.isMobile.any).toBeBoolean();
        });
    });

    describe('earcut', () =>
    {
        it('should exist', () =>
        {
            expect(utils.earcut).toBeInstanceOf(Function);
        });
    });

    describe('premultiplyTintToRgba', () =>
    {
        it('should successfully premultiply alpha float', () =>
        {
            const [r, g, b, a] = utils.premultiplyTintToRgba(0xffffff, 0.5);

            expect(a).toBe(0.5);
            expect(r).toBe(0.5);
            expect(g).toBe(0.5);
            expect(b).toBe(0.5);
        });

        it('should successfully premultiply alpha 0', () =>
        {
            const [r, g, b, a] = utils.premultiplyTintToRgba(0xffffff, 0);

            expect(a).toBe(0);
            expect(r).toBe(0);
            expect(g).toBe(0);
            expect(b).toBe(0);
        });

        it('should successfully premultiply alpha 1', () =>
        {
            const [r, g, b, a] = utils.premultiplyTintToRgba(0xffffff, 1);

            expect(a).toBe(1);
            expect(r).toBe(1);
            expect(g).toBe(1);
            expect(b).toBe(1);
        });
    });

    describe('premultiplyTint', () =>
    {
        it('should successfully premultiply alpha float', () =>
        {
            const tint = utils.premultiplyTint(0xffffff, 0.5);

            expect(tint).toBe(0x7f808080);
        });

        it('should successfully premultiply alpha 0', () =>
        {
            const tint = utils.premultiplyTint(0xffffff, 0);

            expect(tint).toBe(0);
        });

        it('should successfully premultiply alpha 1', () =>
        {
            const tint = utils.premultiplyTint(0xffffff, 1);

            expect(tint).toBe(-1);
        });
    });

    describe('premultiplyRgba', () =>
    {
        it('should successfully premultiply alpha float', () =>
        {
            const [r, g, b, a] = utils.premultiplyRgba([0.5, 0.5, 0.5, 1], 0.5);

            expect(r).toBe(0.25);
            expect(g).toBe(0.25);
            expect(b).toBe(0.25);
            expect(a).toBe(0.5);
        });

        it('should successfully premultiply alpha 0', () =>
        {
            const [r, g, b, a] = utils.premultiplyRgba([0.5, 0.5, 0.5, 1], 0);

            expect(r).toBe(0);
            expect(g).toBe(0);
            expect(b).toBe(0);
            expect(a).toBe(0);
        });

        it('should successfully premultiply alpha 1', () =>
        {
            const [r, g, b, a] = utils.premultiplyRgba([0.5, 0.5, 0.5, 1], 1);

            expect(r).toBe(0.5);
            expect(g).toBe(0.5);
            expect(b).toBe(0.5);
            expect(a).toBe(1);
        });
    });
});
