import { BasePrepare } from '@pixi/prepare';
import sinon from 'sinon';
import { expect } from 'chai';
import { DisplayObject } from '@pixi/display';
import { IRenderer } from '@pixi/core';

describe('BasePrepare', () =>
{
    it('should create a new, empty, BasePrepare', () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        expect(prep['renderer']).to.equal(renderer);
        expect(prep['uploadHookHelper']).to.be.null;
        expect(prep['queue']).to.be.empty;
        expect(prep.addHooks).to.have.lengthOf(5);
        expect(prep.uploadHooks).to.have.lengthOf(2);
        expect(prep.completes).to.be.empty;

        prep.destroy();
    });

    it('should add hooks', () =>
    {
        function addHook() { return true; }
        function uploadHook() { return true; }
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);

        expect(prep.addHooks).to.contain(addHook);
        expect(prep.addHooks).to.have.lengthOf(6);
        expect(prep.uploadHooks).to.contain(uploadHook);
        expect(prep.uploadHooks).to.have.lengthOf(3);

        prep.destroy();
    });

    it('should call hooks and complete', () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);
        const uploadItem = {} as DisplayObject;
        const uploadHelper = {};

        prep['uploadHookHelper'] = uploadHelper;

        const addHook = sinon.spy((item, queue) =>
        {
            expect(item).to.equal(uploadItem);
            expect(queue).to.equal(prep['queue']);
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy((helper, item) =>
        {
            expect(helper).to.equal(uploadHelper);
            expect(item).to.equal(uploadItem);

            return true;
        });
        const complete = sinon.spy(() => { /* empty */ });

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        prep.upload(uploadItem, complete);

        expect(prep['queue']).to.contain(uploadItem);

        prep.prepareItems();

        expect(addHook.calledOnce).to.be.true;
        expect(uploadHook.calledOnce).to.be.true;
        expect(complete.calledOnce).to.be.true;

        prep.destroy();
    });

    it('should call complete if no queue', () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        function addHook()
        {
            return false;
        }
        const complete = sinon.spy(() => { /* empty */ });

        prep.registerFindHook(addHook);
        prep.upload({} as DisplayObject, complete);

        expect(complete.calledOnce).to.be.true;

        prep.destroy();
    });

    it('should remove un-preparable items from queue', () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        const addHook = sinon.spy((item, queue) =>
        {
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy(() =>
            false);
        const complete = sinon.spy(() => { /* empty */ });

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        prep.upload({} as DisplayObject, complete);

        expect(prep['queue']).to.have.lengthOf(1);

        prep.prepareItems();

        expect(prep['queue']).to.be.empty;
        expect(addHook.calledOnce).to.be.true;
        expect(uploadHook.calledOnce).to.be.true;
        expect(complete.calledOnce).to.be.true;

        prep.destroy();
    });

    it('should remove destroyed items from queue', () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        const addHook = sinon.spy((item, queue) =>
        {
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy(() =>
            false);
        const complete = sinon.spy(() => { /* empty */ });

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        const item = {} as DisplayObject;

        prep.upload(item, complete);

        expect(prep['queue']).to.have.lengthOf(1);

        item['_destroyed'] = true;
        prep.prepareItems();

        expect(prep['queue']).to.be.empty;
        expect(addHook.calledOnce).to.be.true;
        expect(uploadHook.called).to.be.false;
        expect(complete.calledOnce).to.be.true;

        prep.destroy();
    });

    it('should attach to the system ticker', (done) =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        const addHook = sinon.spy((item, queue) =>
        {
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy(() => true);

        const complete = sinon.spy(() =>
        {
            expect(prep['queue']).to.be.empty;
            expect(addHook.calledOnce).to.be.true;
            expect(uploadHook.calledOnce).to.be.true;

            prep.destroy();

            done();
        });

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        prep.upload({} as DisplayObject, complete);

        expect(prep['queue']).to.have.lengthOf(1);
        expect(addHook.called).to.be.true;
        expect(uploadHook.called).to.be.false;
        expect(complete.called).to.not.be.ok;
    });
});
