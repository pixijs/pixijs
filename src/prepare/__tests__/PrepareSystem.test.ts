import '~/scene/text/init';
import '~/scene/text-bitmap/init';
import '~/scene/text-html/init';
import { PrepareSystem } from '../PrepareSystem';
import { getWebGLRenderer } from '@test-utils';
import { Texture, TextureSource } from '~/rendering';
import { Container, Graphics, Sprite, Text } from '~/scene';

describe('PrepareSystem', () =>
{
    const setup = async () =>
    {
        const renderer = await getWebGLRenderer();
        const prepare = new PrepareSystem(renderer);

        return { renderer, prepare };
    };

    describe('Adding to the queue', () =>
    {
        it('should add a texture source to the queue', async () =>
        {
            const { prepare } = await setup();
            const textureSource = new TextureSource();

            prepare.add(textureSource);
            expect(prepare.getQueue()).toEqual([textureSource]);
        });

        it('should add a container to the queue', async () =>
        {
            const { prepare } = await setup();
            const container = new Graphics();

            prepare.add(container);

            expect(prepare.getQueue()).toEqual([container.context]);
        });

        it('should add a container and all its children to the queue', async () =>
        {
            const { prepare } = await setup();
            const container = new Container();
            const child1 = new Sprite();
            const child2 = new Graphics();

            container.addChild(child1, child2);
            prepare.add(container);

            expect(prepare.getQueue()).toEqual([child1.texture.source, child2.context]);
        });

        it('should add a texture to the queue', async () =>
        {
            const { prepare } = await setup();
            const texture = new Texture();

            prepare.add(texture);
            expect(prepare.getQueue()).toEqual([texture.source]);
        });

        it('should add a graphics context to the queue', async () =>
        {
            const { prepare } = await setup();
            const graphics = new Graphics();

            prepare.add(graphics);
            expect(prepare.getQueue()).toEqual([graphics.context]);
        });
    });

    describe('Uploading the queue', () =>
    {
        it('should dedupe the queue', async () =>
        {
            const { prepare } = await setup();
            const textureSource = new TextureSource();

            prepare.add(textureSource);
            prepare.add(textureSource);

            expect(prepare.getQueue()).toHaveLength(2);

            prepare.dedupeQueue();

            expect(prepare.getQueue()).toHaveLength(1);
        });

        it('should upload a texture source', async () =>
        {
            const { prepare } = await setup();
            const textureSource = new TextureSource();

            const spy = jest.spyOn(prepare as any, 'uploadTextureSource');

            await prepare.upload(textureSource);

            expect(prepare.getQueue()).toHaveLength(0);
            expect(spy).toHaveBeenCalledWith(textureSource);
        });

        it('should upload a text view', async () =>
        {
            const { prepare } = await setup();
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
            const { prepare } = await setup();

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
            const { prepare } = await setup();

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
            const { prepare } = await setup();

            const uploadCount = 10;
            const promises = [];

            for (let i = 0; i < uploadCount; i++)
            {
                const textureSource = new TextureSource();

                promises.push(prepare.upload(textureSource));
            }

            expect(prepare.getQueue()).toHaveLength(uploadCount);

            void Promise.all(promises).then(() =>
            {
                expect(prepare.getQueue()).toHaveLength(0);
            });
        });
    });
});
