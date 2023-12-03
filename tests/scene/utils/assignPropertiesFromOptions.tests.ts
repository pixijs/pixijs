import { assignPropertiesFromOptions } from '../../../src/scene/container/utils/assignPropertiesFromOptions';

describe('assignPropertiesFromOptions', () =>
{
    it('should assign all properties props', async () =>
    {
        const target = {};
        const options = {
            a: 1,
            b: 2,
            c: 3,
        };

        assignPropertiesFromOptions(target, options);

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

        assignPropertiesFromOptions(target, options, ignore);

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

        assignPropertiesFromOptions(target, options);

        expect(target).toEqual({
            a: 1,
            b: 2,
        });
    });
});
