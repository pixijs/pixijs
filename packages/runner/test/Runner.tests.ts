import { Runner } from '@pixi/runner';

describe('Runner', () =>
{
    it('should should exist', () =>
    {
        expect(Runner).toBeDefined();
        expect(typeof Runner).toEqual('function');
    });

    it('should implement emit', () =>
    {
        const complete = new Runner('complete');

        expect(complete.name).toEqual('complete');
        const callback = jest.fn();

        complete.add({ complete: callback });
        complete.emit();
        expect(callback).toBeCalled();
        expect(callback).toBeCalledTimes(1);
        complete.emit();
        expect(callback).toBeCalledTimes(2);
        complete.emit();
        expect(callback).toBeCalledTimes(3);
        complete.destroy();
        expect(!complete.items).toBe(true);
        expect(!complete.name).toBe(true);
    });

    it('should implement emit with arguments', () =>
    {
        const update = new Runner('update');
        // eslint-disable-next-line func-names
        const callback = jest.fn(function (time, delta)
        {
            let len = 0;
            // Count the number of non-undefined arguments

            for (let i = 0; i < arguments.length; i++)
            {
                // eslint-disable-next-line prefer-rest-params
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
        expect(callback).toBeCalled();
        expect(callback).toBeCalledTimes(1);
    });

    it('should throw an error with too many arguments', () =>
    {
        const complete = new Runner('complete');

        complete.add({
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
            complete(_a: any, _b: any, _c: any, _d: any, _e: any, _f: any, _g: any, _h: any, _i: any) {},
        });
        try
        {
            // @ts-expect-error - testing to many arguments
            complete.emit(1, 2, 3, 4, 5, 6, 7, 8, 9);
            throw new Error('failed too many args');
        }
        catch (e)
        {
            expect(!!e).toBe(true);
            expect((e as Error).message).toEqual('max arguments reached');
        }
    });

    it('should implement multiple targets', () =>
    {
        const complete = new Runner('complete');
        const obj = { complete: jest.fn() };
        const obj2 = { complete: jest.fn() };

        expect(complete.empty).toBe(true);
        complete.add(obj);
        expect(complete.contains(obj)).toBe(true);
        complete.add(obj2);
        expect(complete.contains(obj2)).toBe(true);
        complete.emit();
        expect(!complete.empty).toBe(true);
        expect(complete.items.length).toEqual(2);
        expect(obj.complete).toBeCalled();
        expect(obj.complete).toBeCalledTimes(1);
        expect(obj2.complete).toBeCalled();
        expect(obj2.complete).toBeCalledTimes(1);
        complete.remove(obj);
        expect(complete.items.length).toEqual(1);
        complete.remove(obj2);
        expect(complete.items.length).toEqual(0);
        expect(complete.empty).toBe(true);
    });

    it('should implement removeAll', () =>
    {
        const complete = new Runner('complete');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const obj = { complete() {} };
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const obj2 = { complete() {} };
        const obj3 = {};

        complete
            .add(obj)
            .add(obj2)
            .add(obj3);

        expect(complete.items.length).toEqual(2);

        complete.removeAll();
        expect(complete.empty).toBe(true);
    });

    it('should not add items more than once', () =>
    {
        const complete = new Runner('complete');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const obj = { complete() {} };

        complete.add(obj).add(obj);
        expect(complete.items.length).toEqual(1);
    });

    it('should not not bug out is items are removed items whilst mid run', () =>
    {
        const complete = new Runner('complete');

        const objs = [];
        let tick = 0;

        for (let i = 0; i < 10; i++)
        {
            const obj = {
                id: 0,
                // eslint-disable-next-line no-loop-func
                complete()
                {
                    tick++;
                    complete.remove(obj);
                }
            };

            obj.id = i;
            objs.push(obj);

            complete.add(obj);
        }

        complete.emit();

        expect(complete.items.length).toEqual(0);
        expect(tick).toEqual(10);
    });
});
