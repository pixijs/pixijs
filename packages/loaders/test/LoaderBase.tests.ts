/* eslint-disable @typescript-eslint/no-unused-expressions */

import { Loader, LoaderResource } from '@pixi/loaders';

import { fixtureData } from './fixtures/data';
import { spritesheetMiddleware } from './fixtures/spritesheet';
import { Dict } from '@pixi/utils/src';
import { createServer } from './resources';
import { Server } from 'http';

describe('Loader', () =>
{
    let server: Server;

    beforeAll(() =>
    {
        server = createServer(8126);
    });

    afterAll(() =>
    {
        server.close();
        server = null;
    });

    let loader: Loader = null;

    beforeEach(() =>
    {
        loader = new Loader(fixtureData.baseUrl);
        loader['_beforeMiddleware'] = [];
        loader['_afterMiddleware'] = [];
    });

    it('should have correct properties', () =>
    {
        expect(loader).toHaveProperty('baseUrl', fixtureData.baseUrl);
        expect(loader).toHaveProperty('progress', 0);
    });

    it('should have correct public methods', () =>
    {
        expect(loader).toHaveProperty('add');
        expect(loader['add']).toBeInstanceOf(Function);
        expect(loader).toHaveProperty('pre');
        expect(loader['pre']).toBeInstanceOf(Function);
        expect(loader).toHaveProperty('use');
        expect(loader['use']).toBeInstanceOf(Function);
        expect(loader).toHaveProperty('reset');
        expect(loader['reset']).toBeInstanceOf(Function);
        expect(loader).toHaveProperty('load');
        expect(loader['load']).toBeInstanceOf(Function);
    });

    describe('#add', () =>
    {
        const name = 'test-resource';
        const options = {
            crossOrigin: true,
            loadType: LoaderResource.LOAD_TYPE.IMAGE,
            xhrType: LoaderResource.XHR_RESPONSE_TYPE.DOCUMENT,
        };

        function callback() { /* empty */ }

        it('creates a resource using all arguments', () =>
        {
            loader.add(name, fixtureData.url, options, callback);

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', name);
            expect(res).toHaveProperty('url', fixtureData.url);
            expect(res).toHaveProperty('crossOrigin', options.crossOrigin ? 'anonymous' : null);
            expect(res).toHaveProperty('loadType', options.loadType);
            expect(res).toHaveProperty('xhrType', options.xhrType);

            expect(res.onAfterMiddleware.handlers()).not.toHaveLength(0);
            expect(res.onAfterMiddleware.handlers()[0]['_fn']).toEqual(callback);
        });

        it('creates a resource with just name, url, and options', () =>
        {
            loader.add(name, fixtureData.url, options);

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', name);
            expect(res).toHaveProperty('url', fixtureData.url);
            expect(res).toHaveProperty('crossOrigin', options.crossOrigin ? 'anonymous' : null);
            expect(res).toHaveProperty('loadType', options.loadType);
            expect(res).toHaveProperty('xhrType', options.xhrType);
        });

        it('creates a resource with just name, url, and a callback', () =>
        {
            loader.add(name, fixtureData.url, callback);

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', name);
            expect(res).toHaveProperty('url', fixtureData.url);

            expect(res.onAfterMiddleware.handlers()).not.toHaveLength(0);
            expect(res.onAfterMiddleware.handlers()[0]['_fn']).toEqual(callback);
        });

        it('creates a resource with just name and url', () =>
        {
            loader.add(name, fixtureData.url);

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', name);
            expect(res).toHaveProperty('url', fixtureData.url);
        });

        it('creates a resource with just url, options, and a callback', () =>
        {
            loader.add(fixtureData.url, options, callback);

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', fixtureData.url);
            expect(res).toHaveProperty('url', fixtureData.url);
            expect(res).toHaveProperty('crossOrigin', options.crossOrigin ? 'anonymous' : null);
            expect(res).toHaveProperty('loadType', options.loadType);
            expect(res).toHaveProperty('xhrType', options.xhrType);

            expect(res.onAfterMiddleware.handlers()).not.toHaveLength(0);
            expect(res.onAfterMiddleware.handlers()[0]['_fn']).toEqual(callback);
        });

        it('creates a resource with just url and options', () =>
        {
            loader.add(fixtureData.url, options);

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', fixtureData.url);
            expect(res).toHaveProperty('url', fixtureData.url);
            expect(res).toHaveProperty('crossOrigin', options.crossOrigin ? 'anonymous' : null);
            expect(res).toHaveProperty('loadType', options.loadType);
            expect(res).toHaveProperty('xhrType', options.xhrType);
        });

        it('creates a resource with just url and a callback', () =>
        {
            loader.add(fixtureData.url, callback);

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', fixtureData.url);
            expect(res).toHaveProperty('url', fixtureData.url);

            expect(res.onAfterMiddleware.handlers()).not.toHaveLength(0);
            expect(res.onAfterMiddleware.handlers()[0]['_fn']).toEqual(callback);
        });

        it('creates a resource with just url', () =>
        {
            loader.add(fixtureData.url);

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', fixtureData.url);
            expect(res).toHaveProperty('url', fixtureData.url);
        });

        it('creates a resource with just an object (name/url keys) and callback param', () =>
        {
            loader.add({ name, url: fixtureData.url }, callback);

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', name);
            expect(res).toHaveProperty('url', fixtureData.url);

            expect(res.onAfterMiddleware.handlers()).not.toHaveLength(0);
            expect(res.onAfterMiddleware.handlers()[0]['_fn']).toEqual(callback);
        });

        it('creates a resource with just an object (name/url/callback keys)', () =>
        {
            loader.add({ name, url: fixtureData.url, onComplete: callback });

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', name);
            expect(res).toHaveProperty('url', fixtureData.url);

            expect(res.onAfterMiddleware.handlers()).not.toHaveLength(0);
            expect(res.onAfterMiddleware.handlers()[0]['_fn']).toEqual(callback);
        });

        it('creates a resource with just an object (url/callback keys)', () =>
        {
            loader.add({ url: fixtureData.url, onComplete: callback });

            expect(loader['_queue'].length()).toEqual(1);

            const res = loader['_queue']._tasks[0].data;

            expect(res).toBeInstanceOf(LoaderResource);
            expect(res).toHaveProperty('name', fixtureData.url);
            expect(res).toHaveProperty('url', fixtureData.url);

            expect(res.onAfterMiddleware.handlers()).not.toHaveLength(0);
            expect(res.onAfterMiddleware.handlers()[0]['_fn']).toEqual(callback);
        });

        it('throws an error if url isn\'t passed', () =>
        {
            expect(loader.add).toThrow(Error);
            expect(() => loader.add(options)).toThrow(Error);
            expect(() => loader.add(callback as any)).toThrow(Error);
            expect(() => loader.add(options, callback)).toThrow(Error);
        });

        it('throws an error if we are already loading and you have no parent resource', () =>
        {
            loader.add(fixtureData.url);

            loader.load();

            expect(() => loader.add(fixtureData.dataUrlGif)).toThrow(Error);
        });
    });

    describe('#pre', () =>
    {
        it('should add a middleware that runs before loading a resource', () =>
        {
            loader.pre(() => { /* empty */ });

            expect(loader['_beforeMiddleware']).toHaveLength(1);
        });
    });

    describe('#use', () =>
    {
        it('should add a middleware that runs after loading a resource', () =>
        {
            loader.use(() => { /* empty */ });

            expect(loader['_afterMiddleware']).toHaveLength(1);
        });
    });

    describe('#reset', () =>
    {
        it('should reset the loading state of the loader', () =>
        {
            loader.loading = true;
            expect(loader.loading).toEqual(true);

            loader.reset();
            expect(loader.loading).toEqual(false);
        });

        it('should reset the progress of the loader', () =>
        {
            loader.progress = 100;
            expect(loader.progress).toEqual(100);

            loader.reset();
            expect(loader.progress).toEqual(0);
        });

        it('should reset the queue/buffer of the loader', () =>
        {
            loader['_queue'].push('me');
            expect(loader['_queue'].length()).toEqual(1);
            expect(loader['_queue'].started).toEqual(true);

            loader.reset();
            expect(loader['_queue'].length()).toEqual(0);
            expect(loader['_queue'].started).toEqual(false);
        });

        it('should reset the resources of the loader', () =>
        {
            loader.add(fixtureData.url);
            expect(loader.resources).not.toBeEmpty();

            loader.reset();
            expect(loader.resources).toBeEmpty();
        });

        it('with unloaded items continues to work', (done: () => void) =>
        {
            const loader = new Loader(fixtureData.baseUrl, 2);

            loader.add(['hud.png', 'hud2.png', 'hud.json']).load();

            setTimeout(() =>
            {
                const spy = jest.fn();

                loader.reset();
                loader.add('hud2.json', spy).load(() =>
                {
                    expect(spy).toHaveBeenCalledOnce();
                    done();
                });
            }, 0);
        });
    });

    describe('#load', () =>
    {
        it('should call start/complete when add was not called', (done: () => void) =>
        {
            const spy = jest.fn();
            const spy2 = jest.fn();

            loader.onStart.add(spy);
            loader.onComplete.add(spy2);

            loader.load(() =>
            {
                expect(spy).toHaveBeenCalledOnce();
                expect(spy2).toHaveBeenCalledOnce();
                done();
            });
        });

        it('should call start/complete when given an empty set of resources', (done: () => void) =>
        {
            const spy = jest.fn();
            const spy2 = jest.fn();

            loader.onStart.add(spy);
            loader.onComplete.add(spy2);

            loader.add([]).load(() =>
            {
                expect(spy).toHaveBeenCalledOnce();
                expect(spy2).toHaveBeenCalledOnce();
                done();
            });
        });

        it('should run the `before` middleware, before loading a resource', (done: () => void) =>
        {
            const spy = jest.fn((_res: any, next: any) => next());
            const spy2 = jest.fn((_res: any, next: any) => next());

            loader.pre(spy);
            loader.pre(spy2);

            loader.add(fixtureData.dataUrlGif);

            loader.load(() =>
            {
                expect(spy).toHaveBeenCalledOnce();
                expect(spy2).toHaveBeenCalledOnce();
                done();
            });
        });

        it('should stop running the `before` middleware when one calls complete()', (done: () => void) =>
        {
            const spy = jest.fn((res: any, next: any) =>
            {
                res.complete();
                next();
            });
            const spy2 = jest.fn((_res: any, next: any) => next());

            loader.pre(spy);
            loader.pre(spy2);

            loader.add(fixtureData.dataUrlGif);

            loader.load(() =>
            {
                expect(spy).toHaveBeenCalledOnce();
                expect(spy2).not.toHaveBeenCalled();
                done();
            });
        });

        it('should run the `after` middleware, after loading a resource', (done: () => void) =>
        {
            const spy = jest.fn((_res: any, next: any) => next());
            const spy2 = jest.fn((_res: any, next: any) => next());

            loader.use(spy);
            loader.use(spy2);

            loader.add(fixtureData.dataUrlGif);

            loader.load(() =>
            {
                expect(spy).toHaveBeenCalledOnce();
                expect(spy2).toHaveBeenCalledOnce();
                done();
            });
        });

        it('should run `after` middleware for resources that have been completed in `before` middleware',
            (done: () => void) =>
            {
                const spy = jest.fn((_res: any, next: any) => next());

                loader
                    .pre((res, next) =>
                    {
                        res.complete();
                        next();
                    })
                    .use(spy)
                    .add(fixtureData.dataUrlGif)
                    .add(fixtureData.url)
                    .load(() =>
                    {
                        expect(spy).toBeCalledTimes(2);
                        done();
                    });
            });

        it('should properly load the resource', (done: () => void) =>
        {
            const spy = jest.fn((loader: Loader, resources: Dict<LoaderResource>) =>
            {
                expect(spy).toHaveBeenCalledOnce();
                expect(loader.progress).toEqual(100);
                expect(loader.loading).toEqual(false);
                expect(loader.resources).toEqual(resources);

                expect(resources).not.toBeEmpty();
                expect(resources.res).toBeTruthy();
                expect(resources.res.isComplete).toBe(true);

                done();
            });

            loader.add('res', fixtureData.dataUrlGif);

            loader.load(spy);
        });
    });

    describe('#_prepareUrl', () =>
    {
        it('should return the url as-is for absolute urls', () =>
        {
            const u1 = 'http://domain.com/image.png';
            const u2 = 'https://domain.com';
            const u3 = '//myshare/image.png';
            const u4 = '//myshare/image.png?v=1#me';

            expect(loader['_prepareUrl'](u1)).toEqual(u1);
            expect(loader['_prepareUrl'](u2)).toEqual(u2);
            expect(loader['_prepareUrl'](u3)).toEqual(u3);
            expect(loader['_prepareUrl'](u4)).toEqual(u4);
        });

        it('should add the baseUrl for relative urls (no trailing slash on baseUrl)', () =>
        {
            const b = fixtureData.baseUrl;
            const u1 = 'image.png';
            const u2 = '/image.png';
            const u3 = 'image.png?v=1';
            const u4 = '/image.png?v=1#me';

            expect(loader['_prepareUrl'](u1)).toEqual(`${b}/${u1}`);
            expect(loader['_prepareUrl'](u2)).toEqual(`${b}${u2}`);
            expect(loader['_prepareUrl'](u3)).toEqual(`${b}/${u3}`);
            expect(loader['_prepareUrl'](u4)).toEqual(`${b}${u4}`);
        });

        it('should add the baseUrl for relative urls (yes trailing slash on baseUrl)', () =>
        {
            const b = loader.baseUrl = '/base/';
            const u1 = 'image.png';
            const u2 = '/image.png';
            const u3 = 'image.png?v=1';
            const u4 = '/image.png?v=1#me';

            expect(loader['_prepareUrl'](u1)).toEqual(`${b}${u1}`);
            expect(loader['_prepareUrl'](u2)).toEqual(`${b}${u2}`);
            expect(loader['_prepareUrl'](u3)).toEqual(`${b}${u3}`);
            expect(loader['_prepareUrl'](u4)).toEqual(`${b}${u4}`);
        });

        it('should add the queryString when set', () =>
        {
            const b = fixtureData.baseUrl;
            const u1 = 'image.png';
            const u2 = '/image.png';

            loader.defaultQueryString = 'u=me&p=secret';

            expect(loader['_prepareUrl'](u1))
                .toEqual(`${b}/${u1}?${loader.defaultQueryString}`);

            expect(loader['_prepareUrl'](u2))
                .toEqual(`${b}${u2}?${loader.defaultQueryString}`);
        });

        it('should add the defaultQueryString when set', () =>
        {
            const b = fixtureData.baseUrl;
            const u1 = 'image.png';
            const u2 = '/image.png';

            loader.defaultQueryString = 'u=me&p=secret';

            expect(loader['_prepareUrl'](u1))
                .toEqual(`${b}/${u1}?${loader.defaultQueryString}`);

            expect(loader['_prepareUrl'](u2))
                .toEqual(`${b}${u2}?${loader.defaultQueryString}`);
        });

        it('should add the defaultQueryString when if querystring already exists', () =>
        {
            const b = fixtureData.baseUrl;
            const u1 = 'image.png?v=1';

            loader.defaultQueryString = 'u=me&p=secret';

            expect(loader['_prepareUrl'](u1))
                .toEqual(`${b}/${u1}&${loader.defaultQueryString}`);
        });

        it('should add the defaultQueryString when hash exists', () =>
        {
            const b = fixtureData.baseUrl;

            loader.defaultQueryString = 'u=me&p=secret';

            expect(loader['_prepareUrl']('/image.png#me'))
                .toEqual(`${b}/image.png?${loader.defaultQueryString}#me`);
        });

        it('should add the defaultQueryString when querystring and hash exists', () =>
        {
            const b = fixtureData.baseUrl;

            loader.defaultQueryString = 'u=me&p=secret';

            expect(loader['_prepareUrl']('/image.png?v=1#me'))
                .toEqual(`${b}/image.png?v=1&${loader.defaultQueryString}#me`);
        });
    });

    describe('#_loadLoaderResource', () =>
    {
        it('should run the before middleware before loading the resource', (done: () => void) =>
        {
            const spy = jest.fn();
            const res = {} as LoaderResource;

            loader.pre(spy);

            loader['_loadResource'](res, null);

            setTimeout(() =>
            {
                expect(spy).toBeCalledTimes(1);
                expect(spy.mock.calls[0][0]).toBe(res);

                done();
            }, 16);
        });

        it('should load a resource passed into it', () =>
        {
            const res = new LoaderResource('mock', fixtureData.url);

            res.load = jest.fn();

            loader['_loadResource'](res, null);

            expect(res.load).toHaveBeenCalledOnce();
        });
    });

    describe('#_onStart', () =>
    {
        it('should emit the `start` event', (done: () => void) =>
        {
            loader.onStart.add((_l) =>
            {
                expect(_l).toEqual(loader);

                done();
            });

            loader['_onStart']();
        });
    });

    describe('#_onComplete', () =>
    {
        it('should emit the `complete` event', (done: () => void) =>
        {
            loader.onComplete.add((_l, resources) =>
            {
                expect(_l).toEqual(loader);
                expect(resources).toEqual(loader.resources);

                done();
            });

            loader['_onComplete']();
        });
    });

    describe('#_onLoad', () =>
    {
        it('should emit the `progress` event', () =>
        {
            const res = new LoaderResource('mock', fixtureData.url);
            const spy = jest.fn();

            res._dequeue = jest.fn();

            loader.onProgress.once(spy);

            loader['_onLoad'](res);

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should emit the `error` event when the resource has an error', () =>
        {
            const res = new LoaderResource('mock', fixtureData.url);
            const spy = jest.fn();

            res._dequeue = jest.fn();

            res.error = new Error('mock error');

            loader.onError.once(spy);

            loader['_onLoad'](res);

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should emit the `load` event when the resource loads successfully', () =>
        {
            const res = new LoaderResource('mock', fixtureData.url);
            const spy = jest.fn();

            res._dequeue = jest.fn();

            loader.onLoad.once(spy);

            loader['_onLoad'](res);

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should run the after middleware', (done: () => void) =>
        {
            const spy = jest.fn();
            const res: any = {};

            res._dequeue = jest.fn();

            loader.use(spy);

            loader['_onLoad'](res);

            setTimeout(() =>
            {
                expect(spy).toBeCalledTimes(1);
                expect(spy.mock.calls[0][0]).toBe(res);

                done();
            }, 16);
        });
    });

    describe('events', () =>
    {
        describe('with no additional subresources', () =>
        {
            it('should call progress for each loaded asset', (done: () => void) =>
            {
                loader.add([
                    { name: 'hud', url: 'hud.png' },
                    { name: 'hud2', url: 'hud2.png' },
                ]);

                const spy = jest.fn();

                loader.onProgress.add(spy);

                loader.load(() =>
                {
                    expect(spy).toBeCalledTimes(2);
                    done();
                });
            });

            it('should call progress for each loaded asset, even with low concurrency', (done: () => void) =>
            {
                const loader = new Loader(fixtureData.baseUrl, 1);

                loader.add([
                    { name: 'hud', url: 'hud.png' },
                    { name: 'hud2', url: 'hud2.png' },
                ]);

                const spy = jest.fn();

                loader.onProgress.add(spy);

                loader.load(() =>
                {
                    expect(spy).toBeCalledTimes(2);
                    done();
                });
            });

            it('should never have an invalid progress value', (done: () => void) =>
            {
                const total = 7;
                let i = 0;

                for (; i < total; i++)
                {
                    loader.add([
                        { name: `hud_${i}`, url: 'hud.png' },
                    ]);
                }
                i = 0;
                loader.onProgress.add((loader) =>
                {
                    i++;
                    expect(loader.progress).toBeGreaterThan(0);
                    if (i === total)
                    {
                        expect(loader.progress).toBeLessThanOrEqual(100);
                    }
                    else
                    {
                        expect(loader.progress).toBeLessThan(100);
                    }
                });

                loader.load(() =>
                {
                    expect(loader).toHaveProperty('progress', 100);
                    done();
                });
            });

            it('progress should be 100% on complete', (done: () => void) =>
            {
                loader.add([
                    { name: 'hud', url: 'hud.png' },
                    { name: 'hud2', url: 'hud2.png' },
                ]);

                loader.load(() =>
                {
                    expect(loader).toHaveProperty('progress', 100);
                    done();
                });
            });
        });

        describe('with one additional subresource', () =>
        {
            it('should call progress for each loaded asset', (done: () => void) =>
            {
                loader.add([
                    { name: 'hud2', url: 'hud2.png' },
                    { name: 'hud_atlas', url: 'hud.json' },
                ]);

                loader.use(spritesheetMiddleware());

                const spy = jest.fn();

                loader.onProgress.add(spy);

                loader.load(() =>
                {
                    expect(spy).toBeCalledTimes(3);
                    done();
                });
            });

            it('should call progress for each loaded asset, even with low concurrency', (done: () => void) =>
            {
                const loader = new Loader(fixtureData.baseUrl, 1);

                loader.add([
                    { name: 'hud2', url: 'hud2.png' },
                    { name: 'hud_atlas', url: 'hud.json' },
                ]);

                loader.use(spritesheetMiddleware());

                const spy = jest.fn();

                loader.onProgress.add(spy);

                loader.load(() =>
                {
                    expect(spy).toBeCalledTimes(3);
                    done();
                });
            });

            it('should never have an invalid progress value', (done: () => void) =>
            {
                loader.add([
                    { name: 'hud2', url: 'hud2.png' },
                    { name: 'hud_atlas', url: 'hud.json' },
                ]);

                loader.use(spritesheetMiddleware());

                const expectedProgressValues = [50, 75, 100];
                let i = 0;

                loader.onProgress.add((loader) =>
                {
                    expect(loader).toHaveProperty('progress', expectedProgressValues[i++]);
                });

                loader.load(() =>
                {
                    expect(loader).toHaveProperty('progress', 100);
                    done();
                });
            });

            it('progress should be 100% on complete', (done: () => void) =>
            {
                loader.add([
                    { name: 'hud2', url: 'hud2.png' },
                    { name: 'hud_atlas', url: 'hud.json' },
                ]);

                loader.use(spritesheetMiddleware());

                loader.load(() =>
                {
                    expect(loader).toHaveProperty('progress', 100);
                    done();
                });
            });
        });

        describe('with multiple additional subresources', () =>
        {
            it('should call progress for each loaded asset', (done: () => void) =>
            {
                loader.add([
                    { name: 'hud2', url: 'hud2.json' },
                    { name: 'hud_atlas', url: 'hud.json' },
                ]);

                loader.use(spritesheetMiddleware());

                const spy = jest.fn();

                loader.onProgress.add(spy);

                loader.load(() =>
                {
                    expect(spy).toBeCalledTimes(4);
                    done();
                });
            });

            it('should never have an invalid progress value', (done: () => void) =>
            {
                loader.add([
                    { name: 'hud2', url: 'hud2.json' },
                    { name: 'hud_atlas', url: 'hud.json' },
                ]);

                loader.use(spritesheetMiddleware());

                const expectedProgressValues = [25, 50, 75, 100];
                let i = 0;

                loader.onProgress.add((loader) =>
                {
                    expect(loader).toHaveProperty('progress', expectedProgressValues[i++]);
                });

                loader.load(() =>
                {
                    expect(loader).toHaveProperty('progress', 100);
                    done();
                });
            });

            it('progress should be 100% on complete', (done: () => void) =>
            {
                loader.add([
                    { name: 'hud2', url: 'hud2.json' },
                    { name: 'hud_atlas', url: 'hud.json' },
                ]);

                loader.use(spritesheetMiddleware());

                loader.load(() =>
                {
                    expect(loader).toHaveProperty('progress', 100);
                    done();
                });
            });
        });
    });
});
