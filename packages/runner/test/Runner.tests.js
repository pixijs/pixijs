const { Runner } = require('../');

describe('PIXI.Runner', function ()
{
    it('should should exist', function ()
    {
        expect(Runner).to.be.defined;
        expect(typeof Runner).to.equal('function');
    });

    it('should implement emit', function ()
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

    it('should implement emit with arguments', function ()
    {
        const update = new Runner('update');
        const callback = sinon.spy(function (time, delta)
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
            expect(len).to.equal(2);
            expect(time).to.equal(1);
            expect(delta).to.equal(2);
        });

        update.add({ update: callback });
        update.emit(1, 2);
        expect(callback.called).to.be.true;
        expect(callback.calledOnce).to.be.true;
    });

    it('should throw an error with too many arguments', function ()
    {
        const complete = new Runner('complete');

        complete.add({
            // eslint-disable-next-line no-unused-vars, no-empty-function
            complete(a, b, c, d, e, f, g, h, i) {},
        });
        try
        {
            complete.emit(1, 2, 3, 4, 5, 6, 7, 8, 9);
            throw new Error('failed too many args');
        }
        catch (e)
        {
            expect(!!e).to.equal.true;
            expect(e.message).to.equal('max arguments reached');
        }
    });

    it('should implement multiple targets', function ()
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

    it('should implement removeAll', function ()
    {
        const complete = new Runner('complete');
        // eslint-disable-next-line no-empty-function
        const obj = { complete() {} };
        // eslint-disable-next-line no-empty-function
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

    it('should not add items more than once', function ()
    {
        const complete = new Runner('complete');
        // eslint-disable-next-line no-empty-function
        const obj = { complete() {} };

        complete.add(obj).add(obj);
        expect(complete.items.length).to.equal(1);
    });

    it('should not not bug out is items are removed items whilst mid run', function ()
    {
        const complete = new Runner('complete');

        const objs = [];
        let tick = 0;

        for (let i = 0; i < 10; i++)
        {
            // eslint-disable-next-line no-loop-func
            const obj = { complete()
            {
                tick++;
                complete.remove(obj);
            } };

            obj.id = i;
            objs.push(obj);

            complete.add(obj);
        }

        complete.run();

        expect(complete.items.length).to.equal(0);
        expect(tick).to.equal(10);
    });
});
