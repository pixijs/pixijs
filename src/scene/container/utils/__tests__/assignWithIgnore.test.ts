import { assignWithIgnore } from '../assignWithIgnore';

describe('assignWithIgnore', () =>
{
    it('should assign all properties props', async () =>
    {
        const target = {};
        const options = {
            a: 1,
            b: 2,
            c: 3,
        };

        assignWithIgnore(target, options);

        expect(target).toEqual(options);
    });

    it('should assign only properties that are not ignored', async () =>
    {
        const target = {};
        const options = {
            a: 1,
            b: 2,
            c: 3,
        };
        const ignore = {
            b: true,
        };

        assignWithIgnore(target, options, ignore);

        expect(target).toEqual({
            a: 1,
            c: 3,
        });
    });

    it('should ignore properties that are undefined', async () =>
    {
        const target = {};
        const options: {
            a: number;
            b: number;
            c?: number;
        } = {
            a: 1,
            b: 2,
            c: undefined,
        };

        assignWithIgnore(target, options);

        expect(target).toEqual({
            a: 1,
            b: 2,
        });
    });
});
