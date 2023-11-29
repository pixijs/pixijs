import { PrepareSystem } from '../../src/prepare/PrepareSystem';
import { TextureSource } from '../../src/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';
import { Container } from '../../src/scene/container/Container';
import { Graphics } from '../../src/scene/graphics/shared/Graphics';
import { Sprite } from '../../src/scene/sprite/Sprite';
import { getRenderer } from '../utils/getRenderer';

describe.skip('PrepareSystem', () =>
{
    const setup = async () =>
    {
        const renderer = await getRenderer();
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

        it('should add nat add container to the queue', async () =>
        {
            const { prepare } = await setup();
            const container = new Container();

            prepare.add(container);

            expect(prepare.getQueue()).toEqual([]);
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

        // todo: test upload behavior:
        // - upload a texture source
        // - upload a text view
        // - check that maximum number of uploads is respected per frame
        // - resolves when all uploads done
        // - resolves when all uploads done, even if more added
    });
});
