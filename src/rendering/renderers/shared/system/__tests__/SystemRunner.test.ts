import { SystemRunner } from '../SystemRunner';

describe('Runner', () =>
{
    it('should should exist', () =>
    {
        expect(SystemRunner).toBeDefined();
        expect(typeof SystemRunner).toEqual('function');
    });

    it('should implement emit', () =>
    {
        const complete = new SystemRunner('complete');

        expect(complete.name).toEqual('complete');
        const callback = jest.fn();

        complete.add({ complete: callback });
        complete.emit();
        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledTimes(1);
        complete.emit();
        expect(callback).toHaveBeenCalledTimes(2);
        complete.emit();
        expect(callback).toHaveBeenCalledTimes(3);
        complete.destroy();
        expect(!complete.items).toBe(true);
        expect(!complete.name).toBe(true);
    });

    it('should implement emit with arguments', () =>
    {
        const update = new SystemRunner('update');
        // eslint-disable-next-line func-names
        const callback = jest.fn(function (time, delta)
        {
            let len = 0;
            // Count the number of non-undefined arguments

            for (let i = 0; i < arguments.length; i++)
            {
                if (arguments[i] !== undefined)
                {
                    len++;
                }
            }
            expect(len).toEqual(2);
            expect(time).toEqual(1);
            expect(delta).toEqual(2);
        });

        update.add({ update: callback });
        update.emit(1, 2);
        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should implement multiple targets', () =>
    {
        const complete = new SystemRunner('complete');
        const obj = { complete: jest.fn() };
        const obj2 = { complete: jest.fn() };

        expect(complete.empty).toBe(true);
        complete.add(obj);
        expect(complete.contains(obj)).toBe(true);
        complete.add(obj2);
        expect(complete.contains(obj2)).toBe(true);
        complete.emit();
        expect(!complete.empty).toBe(true);
        expect(complete.items).toHaveLength(2);
        expect(obj.complete).toHaveBeenCalled();
        expect(obj.complete).toHaveBeenCalledTimes(1);
        expect(obj2.complete).toHaveBeenCalled();
        expect(obj2.complete).toHaveBeenCalledTimes(1);
        complete.remove(obj);
        expect(complete.items).toHaveLength(1);
        complete.remove(obj2);
        expect(complete.items).toHaveLength(0);
        expect(complete.empty).toBe(true);
    });

    it('should implement removeAll', () =>
    {
        const complete = new SystemRunner('complete');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const obj = { complete() { } };
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const obj2 = { complete() { } };
        const obj3 = {};

        complete
            .add(obj)
            .add(obj2)
            .add(obj3);

        expect(complete.items).toHaveLength(2);

        complete.removeAll();
        expect(complete.empty).toBe(true);
    });

    it('should not add items more than once', () =>
    {
        const complete = new SystemRunner('complete');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const obj = { complete() { } };

        complete.add(obj).add(obj);
        expect(complete.items).toHaveLength(1);
    });
});
