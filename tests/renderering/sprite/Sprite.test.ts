import { Container } from '../../../src/scene/container/Container';
import { Graphics } from '../../../src/scene/graphics/shared/Graphics';
import { Sprite } from '../../../src/scene/sprite/Sprite';
import { getRenderer } from '../../utils/getRenderer';
import { getTexture } from '../../utils/getTexture';

describe('Sprite', () =>
{
    it('should not throw when destroyed', () =>
    {
        const sprite = new Graphics();

        expect(() => sprite.destroy()).not.toThrow();
    });

    it('should not throw when destroying it context', () =>
    {
        const sprite = new Graphics();

        expect(() => sprite.destroy(true)).not.toThrow();
    });

    it('should clean up correctly on the pipe and system when destroyed', async () =>
    {
        const renderer = await getRenderer();

        const container = new Container();

        const sprite = new Sprite(getTexture());

        container.addChild(sprite);

        renderer.render({ container });

        sprite.destroy();

        expect(renderer.renderPipes.sprite['_gpuSpriteHash'][sprite.uid]).toBeNull();
    });
});
