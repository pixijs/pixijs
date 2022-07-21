import type { IResourceMetadata } from '@pixi/loaders';
import type { SinonFakeXMLHttpRequest, SinonFakeXMLHttpRequestStatic, SinonFakeTimers } from 'sinon';
import { LoaderResource } from '@pixi/loaders';
import sinon from 'sinon';
import { fixtureData } from './fixtures/data';

describe('LoaderResource', () =>
{
    let request: SinonFakeXMLHttpRequest;
    let res: LoaderResource;
    let xhr: SinonFakeXMLHttpRequestStatic;
    let clock: SinonFakeTimers;
    const name = 'test-resource';

    beforeAll(() =>
    {
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (req) =>
        {
            request = req;
        };
        clock = sinon.useFakeTimers();
    });

    afterAll(() =>
    {
        xhr.restore();
        clock.restore();
    });

    beforeEach(() =>
    {
        res = new LoaderResource(name, fixtureData.url);
        request = undefined;
    });

    it('should construct properly with only a URL passed', () =>
    {
        expect(res).toHaveProperty('name', name);
        expect(res).toHaveProperty('type', LoaderResource.TYPE.UNKNOWN);
        expect(res).toHaveProperty('url', fixtureData.url);
        expect(res).toHaveProperty('data', null);
        expect(res).toHaveProperty('crossOrigin', undefined);
        expect(res).toHaveProperty('loadType', LoaderResource.LOAD_TYPE.IMAGE);
        expect(res).toHaveProperty('xhrType', undefined);
        expect(res).toHaveProperty('metadata');
        expect(res.metadata).toEqual({});
        expect(res).toHaveProperty('error', null);
        expect(res).toHaveProperty('xhr', null);

        expect(res).toHaveProperty('isDataUrl', false);
        expect(res).toHaveProperty('isComplete', false);
        expect(res).toHaveProperty('isLoading', false);
    });

    it('should construct properly with options passed', () =>
    {
        const meta = { some: 'thing' };
        const res = new LoaderResource(name, fixtureData.url, {
            crossOrigin: true,
            loadType: LoaderResource.LOAD_TYPE.IMAGE,
            xhrType: LoaderResource.XHR_RESPONSE_TYPE.BLOB,
            metadata: meta as IResourceMetadata,
        });

        expect(res).toHaveProperty('name', name);
        expect(res).toHaveProperty('type', LoaderResource.TYPE.UNKNOWN);
        expect(res).toHaveProperty('url', fixtureData.url);
        expect(res).toHaveProperty('data', null);
        expect(res).toHaveProperty('crossOrigin', 'anonymous');
        expect(res).toHaveProperty('loadType', LoaderResource.LOAD_TYPE.IMAGE);
        expect(res).toHaveProperty('xhrType', LoaderResource.XHR_RESPONSE_TYPE.BLOB);
        expect(res).toHaveProperty('metadata', meta);
        expect(res).toHaveProperty('error', null);
        expect(res).toHaveProperty('xhr', null);

        expect(res).toHaveProperty('isDataUrl', false);
        expect(res).toHaveProperty('isComplete', false);
        expect(res).toHaveProperty('isLoading', false);
    });

    describe('#complete', () =>
    {
        it('should emit the `complete` event', () =>
        {
            const spy = jest.fn();

            res.onComplete.add(spy);

            res.complete();

            expect(spy).toHaveBeenCalledWith(res);
        });

        it('should remove events from the data element', () =>
        {
            const data = {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            };

            jest.spyOn(data, 'removeEventListener');

            res.data = data;
            res.complete();

            expect(data.removeEventListener.mock.calls[0][0]).toEqual('error');
            expect(data.removeEventListener.mock.calls[1][0]).toEqual('load');
            expect(data.removeEventListener.mock.calls[2][0]).toEqual('progress');
            expect(data.removeEventListener.mock.calls[3][0]).toEqual('canplaythrough');

            jest.clearAllMocks();
        });

        it('should remove events from the xhr element', () =>
        {
            const data = {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            };

            jest.spyOn(data, 'removeEventListener');

            (res as any).xhr = data;
            res.complete();

            expect(data.removeEventListener.mock.calls[0][0]).toEqual('error');
            expect(data.removeEventListener.mock.calls[1][0]).toEqual('timeout');
            expect(data.removeEventListener.mock.calls[2][0]).toEqual('abort');
            expect(data.removeEventListener.mock.calls[3][0]).toEqual('progress');
            expect(data.removeEventListener.mock.calls[4][0]).toEqual('load');

            jest.clearAllMocks();
        });
    });

    describe('#abort', () =>
    {
        it('should abort in-flight XHR requests', () =>
        {
            res.load();

            (res as any).xhr = {
                abort: jest.fn(),
            };

            res.abort(undefined);

            expect(res.xhr.abort).toHaveBeenCalledOnce();
        });

        it('should abort in-flight Image requests', () =>
        {
            res.data = new Image();
            res.data.src = fixtureData.url;

            expect(res.data.src).toEqual(fixtureData.url);

            res.abort(undefined);

            expect(res.data.src).toEqual(LoaderResource.EMPTY_GIF);
        });

        it('should abort in-flight Video requests', () =>
        {
            res.data = document.createElement('video');
            res.data.appendChild(document.createElement('source'));

            expect(res.data.firstChild).toBeDefined();

            res.abort(undefined);

            expect(res.data.firstChild).toBeNull();
        });

        it('should abort in-flight Audio requests', () =>
        {
            res.data = document.createElement('audio');
            res.data.appendChild(document.createElement('source'));

            expect(res.data.firstChild).toBeDefined();

            res.abort(undefined);

            expect(res.data.firstChild).toBeNull();
        });
    });

    describe('#load', () =>
    {
        it('should emit the start event', () =>
        {
            const res = new LoaderResource(name, fixtureData.baseUrl);

            const spy = jest.fn();

            res.onStart.add(spy);

            res.load();

            expect(request).toBeDefined();
            expect(spy).toHaveBeenCalledWith(res);
        });

        it('should emit the complete event', () =>
        {
            const res = new LoaderResource(name, fixtureData.baseUrl);

            const spy = jest.fn();

            res.onComplete.add(spy);

            res.load();

            request.respond(200, fixtureData.dataJsonHeaders, fixtureData.dataJson);

            expect(request).toBeDefined();
            expect(spy).toHaveBeenCalledWith(res);
        });

        it('should not load and emit a complete event if complete is called before load', () =>
        {
            const spy = jest.fn();

            res.onComplete.add(spy);

            res.complete();
            res.load();

            expect(request).toBeUndefined();
            expect(spy).toHaveBeenCalledWith(res);
        });

        it('should throw an error if complete is called twice', () =>
        {
            function fn()
            {
                res.complete();
            }

            expect(fn).not.toThrow(Error);
            expect(fn).toThrow(Error);
        });

        it('should load using a data url', (done) =>
        {
            const res = new LoaderResource(name, fixtureData.dataUrlGif);

            res.onComplete.add(() =>
            {
                expect(res).toHaveProperty('data');
                expect(res.data).toBeInstanceOf(Image);
                expect(res.data).toBeInstanceOf(HTMLImageElement);
                expect(res.data).toHaveProperty('src');
                expect(res.data.src).toEqual(fixtureData.dataUrlGif);

                done();
            });

            res.load();
        });

        it('should load using a svg data url', (done) =>
        {
            const res = new LoaderResource(name, fixtureData.dataUrlSvg);

            res.onComplete.add(() =>
            {
                expect(res).toHaveProperty('data');
                expect(res.data).toBeInstanceOf(Image);
                expect(res.data).toBeInstanceOf(HTMLImageElement);
                expect(res.data).toHaveProperty('src');
                expect(res.data.src).toEqual(fixtureData.dataUrlSvg);

                done();
            });

            res.load();
        });

        it('should load using XHR', (done) =>
        {
            const res = new LoaderResource(name, fixtureData.baseUrl);

            res.onComplete.add(() =>
            {
                expect(res).toHaveProperty('data');
                expect(res.data).toEqual(fixtureData.dataJson);
                done();
            });

            res.load();

            expect(request).toBeDefined();

            request.respond(200, fixtureData.dataJsonHeaders, fixtureData.dataJson);
        });

        it('should load using Image', () =>
        {
            const res = new LoaderResource(name, fixtureData.url, { loadType: LoaderResource.LOAD_TYPE.IMAGE });

            res.load();

            expect(request).toBeUndefined();

            expect(res).toHaveProperty('data');
            expect(res.data).toBeInstanceOf(Image);
            expect(res.data).toBeInstanceOf(HTMLImageElement);
            expect(res.data).toHaveProperty('src');
            expect(res.data.src).toEqual(fixtureData.url);
        });

        it('should load using Audio', () =>
        {
            const res = new LoaderResource(name, fixtureData.url, { loadType: LoaderResource.LOAD_TYPE.AUDIO });

            res.load();

            expect(request).toBeUndefined();

            expect(res).toHaveProperty('data');
            expect(res.data).toBeInstanceOf(HTMLAudioElement);

            expect(res.data.children).toHaveLength(1);
            expect(res.data.children[0]).toHaveProperty('src', fixtureData.url);
        });

        it('should load using Video', () =>
        {
            const res = new LoaderResource(name, fixtureData.url, { loadType: LoaderResource.LOAD_TYPE.VIDEO });

            res.load();

            expect(request).toBeUndefined();

            expect(res).toHaveProperty('data');
            expect(res.data).toBeInstanceOf(HTMLVideoElement);

            expect(res.data.children).toHaveLength(1);
            expect(res.data.children[0]).toHaveProperty('src', fixtureData.url);
        });

        it('should used the passed element for loading', () =>
        {
            const img = new Image();
            const spy = jest.spyOn(img, 'addEventListener');
            const res = new LoaderResource(name, fixtureData.url, {
                loadType: LoaderResource.LOAD_TYPE.IMAGE,
                metadata: { loadElement: img },
            });

            res.load();

            expect(spy).toHaveBeenCalledTimes(3);
            expect(img).toHaveProperty('src', fixtureData.url);

            jest.resetAllMocks();
        });

        it('should used the passed element for loading, and skip assigning src', () =>
        {
            const img = new Image();
            const spy = jest.spyOn(img, 'addEventListener');
            const res = new LoaderResource(name, fixtureData.url, {
                loadType: LoaderResource.LOAD_TYPE.IMAGE,
                metadata: { loadElement: img, skipSource: true },
            });

            res.load();

            expect(spy).toHaveBeenCalledTimes(3);
            expect(img).toHaveProperty('src', '');

            jest.resetAllMocks();
        });

        it('should set withCredentials for XHR when crossOrigin specified', () =>
        {
            const res = new LoaderResource(name, fixtureData.url, {
                loadType: LoaderResource.LOAD_TYPE.XHR,
            });

            res.crossOrigin = 'use-credentials';

            res.load();

            expect(request.withCredentials).toEqual(true);
        });
    });

    describe('#load with timeout', () =>
    {
        it('should abort XHR loads', (done) =>
        {
            const res = new LoaderResource(name, fixtureData.url, { loadType: LoaderResource.LOAD_TYPE.XHR, timeout: 100 });

            res.onComplete.add(() =>
            {
                expect(res).toHaveProperty('error');
                expect(res.error).toBeInstanceOf(Error);
                expect(res).toHaveProperty('data');
                expect(res.data).toEqual(null);
                done();
            });

            res.load();

            expect(request).toBeDefined();

            clock.tick(200);
        });

        it('should abort Image loads', (done) =>
        {
            const res = new LoaderResource(name, fixtureData.url,
                { loadType: LoaderResource.LOAD_TYPE.IMAGE, timeout: 1000 });

            res.onComplete.add(() =>
            {
                expect(res).toHaveProperty('error');
                expect(res.error).toBeInstanceOf(Error);

                expect(res).toHaveProperty('data');
                expect(res.data).toBeInstanceOf(Image);
                expect(res.data).toBeInstanceOf(HTMLImageElement);
                expect(res.data).toHaveProperty('src');
                expect(res.data.src).toEqual(LoaderResource.EMPTY_GIF);

                done();
            });

            res.load();

            expect(request).toBeUndefined();

            expect(res).toHaveProperty('data');
            expect(res.data).toBeInstanceOf(Image);
            expect(res.data).toBeInstanceOf(HTMLImageElement);
            expect(res.data).toHaveProperty('src');
            expect(res.data.src).toEqual(fixtureData.url);

            clock.tick(1100);
        });

        it('should abort Audio loads', (done) =>
        {
            const res = new LoaderResource(name, fixtureData.url,
                { loadType: LoaderResource.LOAD_TYPE.AUDIO, timeout: 1000 });

            res.onComplete.add(() =>
            {
                expect(res).toHaveProperty('error');
                expect(res.error).toBeInstanceOf(Error);
                expect(res.data.children).toHaveLength(0);
                done();
            });

            res.load();

            expect(request).toBeUndefined();

            expect(res).toHaveProperty('data');
            expect(res.data).toBeInstanceOf(HTMLAudioElement);
            expect(res.data.children).toHaveLength(1);
            expect(res.data.children[0]).toHaveProperty('src', fixtureData.url);

            clock.tick(1100);
        });

        it('should abort Video loads', (done) =>
        {
            const res = new LoaderResource(name, fixtureData.url,
                { loadType: LoaderResource.LOAD_TYPE.VIDEO, timeout: 1000 });

            res.onComplete.add(() =>
            {
                expect(res).toHaveProperty('error');
                expect(res.error).toBeInstanceOf(Error);
                expect(res.data.children).toHaveLength(0);
                done();
            });

            res.load();

            expect(request).toBeUndefined();

            expect(res).toHaveProperty('data');
            expect(res.data).toBeInstanceOf(HTMLVideoElement);
            expect(res.data.children).toHaveLength(1);
            expect(res.data.children[0]).toHaveProperty('src');
            expect(res.data.children[0].src).toEqual(fixtureData.url);

            clock.tick(1100);
        });
    });

    describe('#load inside cordova', () =>
    {
        beforeEach(() =>
        {
            (xhr as any).status = 0;
        });

        it('should load resource even if the status is 0', () =>
        {
            (xhr as any).responseText = 'I am loaded resource';

            res.xhr = xhr as any;
            res['_xhrOnLoad']();

            expect(res.isComplete).toEqual(true);
        });

        it('should load resource with array buffer data', () =>
        {
            (xhr as any).responseType = LoaderResource.XHR_RESPONSE_TYPE.BUFFER;

            res.xhr = xhr as any;
            res['_xhrOnLoad']();

            expect(res.isComplete).toEqual(true);
        });
    });

    describe('#_determineCrossOrigin', () =>
    {
        it('should properly detect same-origin requests (#1)', () =>
        {
            expect(res._determineCrossOrigin(
                'https://google.com',
                { hostname: 'google.com', port: '', protocol: 'https:' }
            )).toEqual('');
        });

        it('should properly detect same-origin requests (#2)', () =>
        {
            expect(res._determineCrossOrigin(
                'https://google.com:443',
                { hostname: 'google.com', port: '', protocol: 'https:' }
            )).toEqual('');
        });

        it('should properly detect same-origin requests (#3)', () =>
        {
            expect(res._determineCrossOrigin(
                'http://www.google.com:5678',
                { hostname: 'www.google.com', port: '5678', protocol: 'http:' }
            )).toEqual('');
        });

        it('should properly detect cross-origin requests (#1)', () =>
        {
            expect(res._determineCrossOrigin(
                'https://google.com',
                { hostname: 'google.com', port: '123', protocol: 'https:' }
            )).toEqual('anonymous');
        });

        it('should properly detect cross-origin requests (#2)', () =>
        {
            expect(res._determineCrossOrigin(
                'https://google.com',
                { hostname: 'google.com', port: '', protocol: 'http:' }
            )).toEqual('anonymous');
        });

        it('should properly detect cross-origin requests (#3)', () =>
        {
            expect(res._determineCrossOrigin(
                'https://google.com',
                { hostname: 'googles.com', port: '', protocol: 'https:' }
            )).toEqual('anonymous');
        });

        it('should properly detect cross-origin requests (#4)', () =>
        {
            expect(res._determineCrossOrigin(
                'https://google.com',
                { hostname: 'www.google.com', port: '123', protocol: 'https:' }
            )).toEqual('anonymous');
        });
        it('should properly detect cross-origin requests (#5) - sandboxed iframe', () =>
        {
            const originalOrigin = window.origin;

            // Set origin to 'null' to simulate sandboxed iframe without 'allow-same-origin' attribute
            (window as any).origin = 'null';
            expect(res._determineCrossOrigin(
                'http://www.google.com:5678',
                { hostname: 'www.google.com', port: '5678', protocol: 'http:' }
            )).toEqual('anonymous');
            // Restore origin to prevent test leakage.
            (window as any).origin = originalOrigin;
        });
    });

    describe('#_getExtension', () =>
    {
        it('should return the proper extension', () =>
        {
            let res;

            res = new LoaderResource(name, 'http://www.google.com/image.png');
            expect(res['_getExtension']()).toEqual('png');

            res = new LoaderResource(name, 'http://domain.net/really/deep/path/that/goes/for/a/while/movie.wmv');
            expect(res['_getExtension']()).toEqual('wmv');

            res = new LoaderResource(name, 'http://somewhere.io/path.with.dots/and_a-bunch_of.symbols/data.txt');
            expect(res['_getExtension']()).toEqual('txt');

            res = new LoaderResource(name, 'http://nowhere.me/image.jpg?query=true&string=false&name=real');
            expect(res['_getExtension']()).toEqual('jpg');

            res = new LoaderResource(name, 'http://nowhere.me/image.jpeg?query=movie.wmv&file=data.json');
            expect(res['_getExtension']()).toEqual('jpeg');

            res = new LoaderResource(name, 'http://nowhere.me/image.jpeg?query=movie.wmv&file=data.json');
            expect(res['_getExtension']()).toEqual('jpeg');

            res = new LoaderResource(name, 'http://nowhere.me/image.jpeg?query=movie.wmv&file=data.json#/derp.mp3');
            expect(res['_getExtension']()).toEqual('jpeg');

            res = new LoaderResource(name, 'http://nowhere.me/image.jpeg?query=movie.wmv&file=data.json#/derp.mp3&?me=two');
            expect(res['_getExtension']()).toEqual('jpeg');

            res = new LoaderResource(name, 'http://nowhere.me/image.jpeg#nothing-to-see-here?query=movie.wmv&file=data.json#/derp.mp3&?me=two'); // eslint-disable-line max-len
            expect(res['_getExtension']()).toEqual('jpeg');

            res['_setFlag'](LoaderResource.STATUS_FLAGS.DATA_URL, true);
            res = new LoaderResource(name, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII='); // eslint-disable-line max-len
            expect(res['_getExtension']()).toEqual('png');
        });
    });

    describe('#_createSource', () =>
    {
        it('Should return the correct src url', () =>
        {
            let res;

            res = new LoaderResource(name, 'http://www.google.com/audio.mp3');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('src', res.url);

            res = new LoaderResource(name, 'http://domain.net/really/deep/path/that/goes/for/a/while/movie.wmv');
            expect(res['_createSource']('video', res.url, '')).toHaveProperty('src', res.url);

            res = new LoaderResource(name, 'http://somewhere.io/path.with.dots/and_a-bunch_of.symbols/audio.mp3');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('src', res.url);

            res = new LoaderResource(name, 'http://nowhere.me/audio.mp3?query=true&string=false&name=real');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('src', res.url);

            res = new LoaderResource(name, 'http://nowhere.me/audio.mp3?query=movie.wmv&file=data.json');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('src', res.url);

            res = new LoaderResource(name, 'http://nowhere.me/audio.mp3?query=movie.wmv&file=data.json');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('src', res.url);

            res = new LoaderResource(name, 'http://nowhere.me/audio.mp3?query=movie.wmv&file=data.json#/derp.mp3&?me=two');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('src', res.url);

            res = new LoaderResource(name, 'http://nowhere.me/audio.mp3#nothing-to-see-here?query=movie.wmv&file=data.json#/derp.mp3&?me=two'); // eslint-disable-line max-len
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('src', res.url);

            res['_setFlag'](LoaderResource.STATUS_FLAGS.DATA_URL, true);
            res = new LoaderResource(name, 'data:audio/wave;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='); // eslint-disable-line max-len
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('src', res.url);
        });

        it('Should correctly auto-detect the mime type', () =>
        {
            let res;

            res = new LoaderResource(name, 'http://www.google.com/audio.mp3');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('type', 'audio/mp3');

            res = new LoaderResource(name, 'http://domain.net/really/deep/path/that/goes/for/a/while/movie.wmv');
            expect(res['_createSource']('video', res.url, '')).toHaveProperty('type', 'video/wmv');

            res = new LoaderResource(name, 'http://somewhere.io/path.with.dots/and_a-bunch_of.symbols/audio.mp3');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('type', 'audio/mp3');

            res = new LoaderResource(name, 'http://nowhere.me/audio.mp3?query=true&string=false&name=real');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('type', 'audio/mp3');

            res = new LoaderResource(name, 'http://nowhere.me/audio.mp3?query=movie.wmv&file=data.json');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('type', 'audio/mp3');

            res = new LoaderResource(name, 'http://nowhere.me/audio.mp3?query=movie.wmv&file=data.json');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('type', 'audio/mp3');

            res = new LoaderResource(name, 'http://nowhere.me/audio.mp3?query=movie.wmv&file=data.json#/derp.mp3&?me=two');
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('type', 'audio/mp3');

            res = new LoaderResource(name, 'http://nowhere.me/audio.mp3#nothing-to-see-here?query=movie.wmv&file=data.json#/derp.mp3&?me=two'); // eslint-disable-line max-len
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('type', 'audio/mp3');

            res['_setFlag'](LoaderResource.STATUS_FLAGS.DATA_URL, true);
            res = new LoaderResource(name, 'data:audio/wave;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='); // eslint-disable-line max-len
            expect(res['_createSource']('audio', res.url, '')).toHaveProperty('type', 'audio/wave');
        });
    });
});
