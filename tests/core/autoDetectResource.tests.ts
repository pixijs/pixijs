// import {
//     autoDetectResource,
//     CanvasResource,
//     ImageResource,
//     INSTALLED,
//     SVGResource,
//     VideoResource,
// } from '@pixi/core';

import { CanvasSource } from '../../src/rendering/renderers/shared/texture/sources/CanvasSource';
import { ImageSource } from '../../src/rendering/renderers/shared/texture/sources/ImageSource';
import { autoDetectSource } from '../../src/rendering/renderers/shared/texture/sources/resourceToTexture';
import { VideoSource } from '../../src/rendering/renderers/shared/texture/sources/VideoSource';
import { getApp } from '../utils/getApp';

// note: now Texture.from? = autoDetectSource

describe('autoDetectResource', () =>
{
    beforeAll(async () => await getApp());

    it('should have api', () =>
    {
        expect(autoDetectSource).toBeInstanceOf(Function);
    });

    // note: sources only accept objects not strings
    // it.skip('should have installed resources', () =>
    // {
    //     expect(INSTALLED).toBeArray();
    //     expect(INSTALLED.length).toEqual(8);
    // });

    it('should auto-detect canvas element', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 200;
        canvas.height = 100;

        const source = autoDetectSource({ resource: canvas });

        expect(source).toBeInstanceOf(CanvasSource);
        expect(source.width).toEqual(200);
        expect(source.height).toEqual(100);
    });

    it('should auto-detect video element', () =>
    {
        const video = document.createElement('video');
        const source = autoDetectSource({ resource: video });

        expect(source).toBeInstanceOf(VideoSource);
    });

    it('should auto-detect image element', () =>
    {
        const img = new Image();
        const source = autoDetectSource({ resource: img });

        expect(source).toBeInstanceOf(ImageSource);
    });

    // note: sources only accept objects not strings
    // it.skip('should auto-detect image string', () =>
    // {
    //     const img = 'foo.png';
    //     const resource = autoDetectSource({ resource: img });

    //     expect(resource).toBeInstanceOf(ImageSource);
    // });

    // note: sources only accept objects not strings
    // it.skip('should auto-detect svg string', () =>
    // {
    //     const svg = 'foo.svg';
    //     const resource = autoDetectSource(svg);

    //     expect(resource).toBeInstanceOf(SVGResource);
    // });

    // note: sources only accept objects not strings
    // it.skip('should auto-detect video Url', () =>
    // {
    //     const video = 'foo.mp4';
    //     const resource = autoDetectSource(video);

    //     expect(resource).toBeInstanceOf(VideoResource);
    // });

    // note: sources only accept objects not null, and changing return type to null is a breaking change
    // it.skip('should pass null', () =>
    // {
    //     const resource = autoDetectSource(null);

    //     expect(resource).toEqual(null);
    // });

    it('should throw for unknown types', () =>
    {
        expect(() => autoDetectSource({})).toThrow();
        expect(() => autoDetectSource({ resource: document.createElement('input') as any })).toThrow();
        // expect(() => autoDetectSource(2)).toThrow();
        // expect(() => autoDetectSource(true)).toThrow();
    });
});
