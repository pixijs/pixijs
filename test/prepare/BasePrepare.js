'use strict';

describe('PIXI.prepare.BasePrepare', function ()
{
    it('should create a new, empty, BasePrepare', function ()
    {
        const renderer = {};
        const prep = new PIXI.prepare.BasePrepare(renderer);

        expect(prep.renderer).to.equal(renderer);
        expect(prep.uploadHookHelper).to.be.null;
        expect(prep.queue).to.be.empty;
        expect(prep.addHooks).to.have.lengthOf(5);
        expect(prep.uploadHooks).to.have.lengthOf(2);
        expect(prep.completes).to.be.empty;

        prep.destroy();
    });

    it('should add hooks', function ()
    {
        function addHook() { /* empty */ }
        function uploadHook() { /* empty */ }
        const prep = new PIXI.prepare.BasePrepare();

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);

        expect(prep.addHooks).to.contain(addHook);
        expect(prep.addHooks).to.have.lengthOf(6);
        expect(prep.uploadHooks).to.contain(uploadHook);
        expect(prep.uploadHooks).to.have.lengthOf(3);

        prep.destroy();
    });

    it('should call hooks and complete', function ()
    {
        const prep = new PIXI.prepare.BasePrepare();
        const uploadItem = {};
        const uploadHelper = {};

        prep.uploadHookHelper = uploadHelper;

        const addHook = sinon.spy(function (item, queue)
        {
            expect(item).to.equal(uploadItem);
            expect(queue).to.equal(prep.queue);
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy(function (helper, item)
        {
            expect(helper).to.equal(uploadHelper);
            expect(item).to.equal(uploadItem);

            return true;
        });
        const complete = sinon.spy(function () { /* empty */ });

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        prep.upload(uploadItem, complete);

        expect(prep.queue).to.contain(uploadItem);

        prep.prepareItems();

        expect(addHook.calledOnce).to.be.true;
        expect(uploadHook.calledOnce).to.be.true;
        expect(complete.calledOnce).to.be.true;

        prep.destroy();
    });

    it('should call complete if no queue', function ()
    {
        const prep = new PIXI.prepare.BasePrepare();

        function addHook()
        {
            return false;
        }
        const complete = sinon.spy(function () { /* empty */ });

        prep.registerFindHook(addHook);
        prep.upload({}, complete);

        expect(complete.calledOnce).to.be.true;

        prep.destroy();
    });

    it('should remove un-preparable items from queue', function ()
    {
        const prep = new PIXI.prepare.BasePrepare();

        const addHook = sinon.spy(function (item, queue)
        {
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy(function ()
        {
            return false;
        });
        const complete = sinon.spy(function () { /* empty */ });

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        prep.upload({}, complete);

        expect(prep.queue).to.have.lengthOf(1);

        prep.prepareItems();

        expect(prep.queue).to.be.empty;
        expect(addHook.calledOnce).to.be.true;
        expect(uploadHook.calledOnce).to.be.true;
        expect(complete.calledOnce).to.be.true;

        prep.destroy();
    });

    it('should remove destroyed items from queue', function ()
    {
        const prep = new PIXI.prepare.BasePrepare();

        const addHook = sinon.spy(function (item, queue)
        {
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy(function ()
        {
            return false;
        });
        const complete = sinon.spy(function () { /* empty */ });

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        const item = {};

        prep.upload(item, complete);

        expect(prep.queue).to.have.lengthOf(1);

        item._destroyed = true;
        prep.prepareItems();

        expect(prep.queue).to.be.empty;
        expect(addHook.calledOnce).to.be.true;
        expect(uploadHook.called).to.be.false;
        expect(complete.calledOnce).to.be.true;

        prep.destroy();
    });

    it('should attach to SharedTicker', function (done)
    {
        const prep = new PIXI.prepare.BasePrepare();

        const addHook = sinon.spy(function (item, queue)
        {
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy(function ()
        {
            return true;
        });

        function complete()
        {
            expect(prep.queue).to.be.empty;
            expect(addHook.calledOnce).to.be.true;
            expect(uploadHook.calledOnce).to.be.true;

            prep.destroy();

            done();
        }

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        prep.upload({}, complete);

        expect(prep.queue).to.have.lengthOf(1);
        expect(addHook.called).to.be.true;
        expect(uploadHook.called).to.be.false;
        expect(complete.called).to.not.be.ok;
    });
});
