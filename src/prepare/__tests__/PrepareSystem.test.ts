import '~/scene/graphics/init';
import '~/scene/text/init';
import '~/scene/text-bitmap/init';
import '~/scene/text-html/init';
import { PrepareSystem } from '../PrepareSystem';
import { getWebGLRenderer } from '@test-utils';
import { type Renderer, Texture, TextureSource } from '~/rendering';
import { Container, Graphics, Sprite, Text } from '~/scene';

let renderer: Renderer;
let prepare: PrepareSystem;

beforeEach(async () =>
{
    renderer = await getWebGLRenderer();
    prepare = new PrepareSystem(renderer);
});

afterEach(() =>
{
    prepare.destroy();
    renderer.destroy();
});

describe('PrepareSystem', () =>
{
    describe('Adding to the queue', () =>
    {
        it('should add a texture source to the queue', () =>
        {
            const textureSource = new TextureSource();

            prepare.add(textureSource);
            expect(prepare.getQueue()).toEqual([textureSource]);
        });

        it('should add a container to the queue', () =>
        {
            const container = new Graphics();

            prepare.add(container);

            expect(prepare.getQueue()).toEqual([container.context]);
        });

        it('should add a container and all its children to the queue', () =>
        {
            const container = new Container();
            const child1 = new Sprite();
            const child2 = new Graphics();

            container.addChild(child1, child2);
            prepare.add(container);

            expect(prepare.getQueue()).toEqual([child1.texture.source, child2.context]);
        });

        it('should add a texture to the queue', () =>
        {
            const texture = new Texture();

            prepare.add(texture);
            expect(prepare.getQueue()).toEqual([texture.source]);
        });

        it('should add a graphics context to the queue', () =>
        {
            const graphics = new Graphics();

            prepare.add(graphics);
            expect(prepare.getQueue()).toEqual([graphics.context]);
        });
    });

    describe('Uploading the queue', () =>
    {
        it('should dedupe the queue', () =>
        {
            const textureSource = new TextureSource();

            prepare.add(textureSource);
            prepare.add(textureSource);

            expect(prepare.getQueue()).toHaveLength(2);

            prepare.dedupeQueue();

            expect(prepare.getQueue()).toHaveLength(1);
        });

        it('should upload a graphics correctly', async () =>
        {
            const graphics = new Graphics();
            const spy = jest.spyOn(prepare as any, 'uploadGraphicsContext');

            await prepare.upload(graphics);

            expect(prepare.getQueue()).toHaveLength(0);
            expect(spy).toHaveBeenCalledWith(graphics.context);
        });

        it('should upload a texture source', async () =>
        {
            const textureSource = new TextureSource();

            const spy = jest.spyOn(prepare as any, 'uploadTextureSource');

            await prepare.upload(textureSource);

            expect(prepare.getQueue()).toHaveLength(0);
            expect(spy).toHaveBeenCalledWith(textureSource);
        });

        it('should upload a text view', async () =>
        {
            const text = new Text({
                text: 'foo'
            });

            const spy = jest.spyOn(prepare as any, 'uploadText');

            await prepare.upload(text);

            expect(prepare.getQueue()).toHaveLength(0);
            expect(spy).toHaveBeenCalledWith(text);
        });

        it('should respected maximum number of uploads per frame', async () =>
        {
            const uploadSpy = jest.spyOn(prepare as any, 'uploadTextureSource');
            const tickSpy = jest.spyOn(prepare as any, '_tick');

            const batches = 3;
            const maxCalls = PrepareSystem.uploadsPerFrame * batches;

            for (let i = 0; i < maxCalls; i++)
            {
                const textureSource = new TextureSource();

                prepare.add(textureSource);
            }

            await prepare.upload();

            expect(uploadSpy).toHaveBeenCalledTimes(maxCalls); // 12 expected uploads
            expect(tickSpy).toHaveBeenCalledTimes(batches); // 3 expected ticks broken into 4 uploads per tick
        });

        it('should resolve when all uploads done', async () =>
        {
            const uploadSpy = jest.spyOn(prepare as any, 'uploadTextureSource');

            const batches = 3;
            const maxCalls = PrepareSystem.uploadsPerFrame * batches;

            for (let i = 0; i < maxCalls; i++)
            {
                const textureSource = new TextureSource();

                prepare.add(textureSource);
            }

            expect(prepare.getQueue()).toHaveLength(maxCalls);
            expect(uploadSpy).toHaveBeenCalledTimes(0);

            await prepare.upload();

            expect(uploadSpy).toHaveBeenCalledTimes(maxCalls);
            expect(prepare.getQueue()).toHaveLength(0);
        });

        it('should resolve when all uploads done even if more added', async () =>
        {
            const uploadCount = 10;
            const promises = [];

            for (let i = 0; i < uploadCount; i++)
            {
                const textureSource = new TextureSource();

                promises.push(prepare.upload(textureSource));
            }

            expect(prepare.getQueue()).toHaveLength(uploadCount);

            await Promise.all(promises).then(() =>
            {
                expect(prepare.getQueue()).toHaveLength(0);
            });
        });
    });

    it('should not throw when destroying prepared but not rendered text', async () =>
    {
        const text = new Text({ text: 'text' });

        await prepare.upload(text);

        expect(() => text.destroy()).not.toThrow();
    });

    // https://github.com/pixijs/pixijs/issues/12181
    it('should not clobber a rendered Text batchable when prepare.upload races with render', async () =>
    {
        const text = new Text({ text: 'race' });
        const mask = new Graphics().rect(0, 0, 50, 50).fill(0xffffff);
        const masked = new Graphics().circle(25, 25, 20).fill(0xff0000);

        masked.mask = mask;

        const stage = new Container();

        // Text must be collected before the masked object so an undefined-texture
        // batch element is present when StencilMaskPipe asks the batcher to break.
        stage.addChild(text, mask, masked);

        const uploadPromise = prepare.upload(text);

        renderer.render(stage);

        const gpuTextAfterRender = text._gpuData[renderer.uid];

        expect(text._didTextUpdate).toBe(false);
        expect(gpuTextAfterRender.texture).toBeDefined();

        await uploadPromise;

        const gpuTextAfterPrepare = text._gpuData[renderer.uid];

        expect(gpuTextAfterPrepare === gpuTextAfterRender).toBe(true);
        expect(gpuTextAfterPrepare.texture?._source).toBeDefined();
        expect(text._didTextUpdate).toBe(false);

        // Force an instruction rebuild so the batcher picks up current GPU data.
        stage.addChild(new Container());

        expect(() => renderer.render(stage)).not.toThrow();
    });
});
