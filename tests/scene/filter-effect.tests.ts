import { NoiseFilter } from '../../src/filters/defaults/noise/NoiseFilter';
import { Container } from '../../src/scene/container/Container';

import type { Filter } from '../../src/filters/Filter';

describe('Filter effect', () =>
{
    it('should set filter effects correctly', async () =>
    {
        const container = new Container();

        expect(container.effects.length).toBe(0);

        expect(container.filters).toBe(undefined);

        container.filters = [];

        expect(container.effects.length).toBe(0);

        expect(container.filters).toEqual([]);

        container.filters = [new NoiseFilter()];

        expect(container.effects.length).toBe(1);

        container.filters = [];

        expect(container.effects.length).toBe(0);

        container.filters = null;

        expect(container.effects.length).toBe(0);

        container.filters = undefined;

        expect(container.effects.length).toBe(0);
    });

    it('should not trigger a rebuild if the filters arrays are the same', async () =>
    {
        const container = new Container();
        const spy = jest.spyOn(container, 'addEffect');

        const filters = [new NoiseFilter()];

        container.filters = filters;

        expect(spy).toHaveBeenCalledTimes(1);

        container.filters = filters;

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should set filter effects correctly if a modifed array is passed in', async () =>
    {
        const container = new Container();

        const filters: Filter[] = [];

        container.filters = filters;

        expect(container.effects.length).toBe(1);

        filters.push(new NoiseFilter());

        container.filters = filters;

        expect(container.effects.length).toBe(1);
    });
});
