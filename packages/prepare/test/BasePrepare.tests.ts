import { BasePrepare } from '@pixi/prepare';

import type { IRenderer } from '@pixi/core';
import type { DisplayObject } from '@pixi/display';

describe('BasePrepare', () =>
{
    it('should create a new, empty, BasePrepare', () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        expect(prep['renderer']).toEqual(renderer);
        expect(prep['uploadHookHelper']).toBeNull();
        expect(prep['queue']).toBeEmpty();
        expect(prep.addHooks).toHaveLength(5);
        expect(prep.uploadHooks).toHaveLength(2);
        expect(prep.completes).toBeEmpty();

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

        expect(prep.addHooks).toEqual(expect.arrayContaining([addHook]));
        expect(prep.addHooks).toHaveLength(6);
        expect(prep.uploadHooks).toEqual(expect.arrayContaining([uploadHook]));
        expect(prep.uploadHooks).toHaveLength(3);

        prep.destroy();
    });

    it('should call hooks and complete', () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);
        const uploadItem = {} as DisplayObject;
        const uploadHelper = {};

        prep['uploadHookHelper'] = uploadHelper;

        const addHook = jest.fn((item, queue) =>
        {
            expect(item).toEqual(uploadItem);
            expect(queue).toEqual(prep['queue']);
            queue.push(item);

            return true;
        });
        const uploadHook = jest.fn((helper, item) =>
        {
            expect(helper).toEqual(uploadHelper);
            expect(item).toEqual(uploadItem);

            return true;
        });

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        prep.upload(uploadItem);

        expect(prep['queue']).toEqual(expect.arrayContaining([uploadItem]));

        prep.prepareItems();

        expect(addHook).toBeCalledTimes(1);
        expect(uploadHook).toBeCalledTimes(1);

        prep.destroy();
    });

    it('should call complete if no queue', async () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        function addHook()
        {
            return false;
        }
        const complete = jest.fn(() => { /* empty */ });

        prep.registerFindHook(addHook);
        await prep.upload({} as DisplayObject).then(complete);

        expect(complete).toBeCalledTimes(1);

        prep.destroy();
    });

    it('should remove un-preparable items from queue', () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        const addHook = jest.fn((item, queue) =>
        {
            queue.push(item);

            return true;
        });
        const uploadHook = jest.fn(() =>
            false);

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        prep.upload({} as DisplayObject);

        expect(prep['queue']).toHaveLength(1);

        prep.prepareItems();

        expect(prep['queue']).toBeEmpty();
        expect(addHook).toBeCalledTimes(1);
        expect(uploadHook).toBeCalledTimes(1);

        prep.destroy();
    });

    it('should remove destroyed items from queue', () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        const addHook = jest.fn((item, queue) =>
        {
            queue.push(item);

            return true;
        });
        const uploadHook = jest.fn(() =>
            false);

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        const item = {} as DisplayObject;

        prep.upload(item);

        expect(prep['queue']).toHaveLength(1);

        item['_destroyed'] = true;
        prep.prepareItems();

        expect(prep['queue']).toBeEmpty();
        expect(addHook).toBeCalledTimes(1);
        expect(uploadHook).not.toHaveBeenCalled();

        prep.destroy();
    });

    it('should attach to the system ticker', async () =>
    {
        const renderer = {} as IRenderer;
        const prep = new BasePrepare(renderer);

        const addHook = jest.fn((item, queue) =>
        {
            queue.push(item);

            return true;
        });
        const uploadHook = jest.fn(() => true);

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        await prep.upload({} as DisplayObject);

        expect(prep['queue']).toBeEmpty();
        expect(addHook).toBeCalledTimes(1);
        expect(uploadHook).toBeCalledTimes(1);

        prep.destroy();
    });
});
