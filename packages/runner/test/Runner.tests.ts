import { Runner } from '@pixi/runner';
import sinon from 'sinon';
import { expect } from 'chai';

describe('Runner', () =>
{
    it('should should exist', () =>
    {
        expect(Runner).to.be.not.undefined;
        expect(typeof Runner).to.equal('function');
    });

    it('should implement emit', () =>
    {
        const complete = new Runner('complete');

        expect(complete.name).to.equal('complete');
        const callback = sinon.spy();

        complete.add({ complete: callback });
        complete.emit();
        expect(callback.called).to.be.true;
        expect(callback.calledOnce).to.be.true;
        complete.emit();
        expect(callback.calledTwice).to.be.true;
        complete.emit();
        expect(callback.calledThrice).to.be.true;
        complete.destroy();
        expect(!complete.items).to.be.true;
        expect(!complete.name).to.be.true;
    });

    it('should implement emit with arguments', () =>
    {
        const update = new Runner('update');
        // eslint-disable-next-line func-names
        const callback = sinon.spy(function (time, delta)
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
            expect(len).to.equal(2);
            expect(time).to.equal(1);
            expect(delta).to.equal(2);
        });

        update.add({ update: callback });
        update.emit(1, 2);
        expect(callback.called).to.be.true;
        expect(callback.calledOnce).to.be.true;
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
            expect(!!e).to.be.true;
            expect((e as Error).message).to.equal('max arguments reached');
        }
    });

    it('should implement multiple targets', () =>
    {
        const complete = new Runner('complete');
        const obj = { complete: sinon.spy() };
        const obj2 = { complete: sinon.spy() };

        expect(complete.empty).to.be.true;
        complete.add(obj);
        expect(complete.contains(obj)).to.be.true;
        complete.add(obj2);
        expect(complete.contains(obj2)).to.be.true;
        complete.emit();
        expect(!complete.empty).to.be.true;
        expect(complete.items.length).to.equal(2);
        expect(obj.complete.called).to.be.true;
        expect(obj.complete.calledOnce).to.be.true;
        expect(obj2.complete.called).to.be.true;
        expect(obj2.complete.calledOnce).to.be.true;
        complete.remove(obj);
        expect(complete.items.length).to.equal(1);
        complete.remove(obj2);
        expect(complete.items.length).to.equal(0);
        expect(complete.empty).to.be.true;
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

        expect(complete.items.length).to.equal(2);

        complete.removeAll();
        expect(complete.empty).to.be.true;
    });

    it('should not add items more than once', () =>
    {
        const complete = new Runner('complete');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const obj = { complete() {} };

        complete.add(obj).add(obj);
        expect(complete.items.length).to.equal(1);
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

        expect(complete.items.length).to.equal(0);
        expect(tick).to.equal(10);
    });
});
