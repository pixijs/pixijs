import { AlphaFilter } from '../../src/filters/defaults/alpha/AlphaFilter';
import { NoiseFilter } from '../../src/filters/defaults/noise/NoiseFilter';
import { Container } from '../../src/scene/container/Container';

import type { FilterEffect } from '../../src/filters/FilterEffect';

describe('Filter effect', () =>
{
    it('should set filter effects correctly', async () =>
    {
        const container = new Container();

        expect(container.effects.length).toBe(0);

        expect(container.filters).toBe(undefined);

        //

        const noiseFilter = new NoiseFilter();
        const alphaFilter = new AlphaFilter();

        container.filters = [noiseFilter];

        expect(container.effects.length).toBe(1);

        expect(container.filters).toEqual([noiseFilter]);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        expect(() => container.filters.push(alphaFilter)).toThrow();

        //

        container.filters = [];

        expect(container.effects.length).toBe(0);

        expect(container.filters).toEqual([]);

        //

        container.filters = null;

        expect(container.effects.length).toBe(0);

        expect(container.filters).toEqual(null);

        //

        container.filters = undefined;

        expect(container.effects.length).toBe(0);

        expect(container.filters).toEqual(undefined);
    });

    it('should allow for a single filter to be set', async () =>
    {
        const container = new Container();

        const noiseFilter = new NoiseFilter();

        container.filters = noiseFilter;

        expect(container.filters).toEqual([noiseFilter]);
    });

    it('should only update effects if filters change from on to off', async () =>
    {
        const container = new Container();
        const noiseFilter = new NoiseFilter();

        const spyAdd = jest.spyOn(container, 'addEffect');
        const spyRemove = jest.spyOn(container, 'removeEffect');

        container.filters = [noiseFilter];

        expect(spyAdd).toHaveBeenCalledTimes(1);
        expect(spyRemove).toHaveBeenCalledTimes(0);

        container.filters = [noiseFilter, noiseFilter];

        expect(spyAdd).toHaveBeenCalledTimes(1);
        expect(spyRemove).toHaveBeenCalledTimes(0);

        container.filters = [];

        expect(spyAdd).toHaveBeenCalledTimes(1);
        expect(spyRemove).toHaveBeenCalledTimes(1);

        container.filters = null;

        expect(spyAdd).toHaveBeenCalledTimes(1);
        expect(spyRemove).toHaveBeenCalledTimes(1);

        container.filters = [noiseFilter];

        expect(spyAdd).toHaveBeenCalledTimes(2);
        expect(spyRemove).toHaveBeenCalledTimes(1);
    });

    it('should set filter correctly if filters are swapped', async () =>
    {
        const container = new Container();
        const noiseFilter = new NoiseFilter();
        const alphaFilter = new AlphaFilter();

        container.filters = [noiseFilter];

        expect(container.effects.length).toBe(1);
        expect((container.effects[0] as FilterEffect).filters).toEqual([noiseFilter]);

        container.filters = [alphaFilter];

        expect(container.effects.length).toBe(1);
        expect((container.effects[0] as FilterEffect).filters).toEqual([alphaFilter]);
    });
});
