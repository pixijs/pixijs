import { Graphics } from '../../../src/rendering/graphics/shared/Graphics';
import { WebGLRenderer } from '../../../src/rendering/renderers/gl/WebGLRenderer';
import { ImageSource } from '../../../src/rendering/renderers/shared/texture/sources/ImageSource';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import { Container } from '../../../src/rendering/scene/Container';
import { Sprite } from '../../../src/rendering/sprite/shared/Sprite';

import type { Renderer } from '../../../src/rendering/renderers/types';

async function getRenderer(): Promise<Renderer>
{
    const renderer = new WebGLRenderer();

    await renderer.init({
        width: 100,
        height: 100,
    });

    return renderer;
}

function getTexture()
{
    const canvas = document.createElement('canvas');

    canvas.width = 20;
    canvas.height = 20;

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    // fill canvas with white
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const defaultTexture = new Texture({
        source: new ImageSource({
            resource: canvas
        })
    });

    defaultTexture.label = 'defaultTexture';

    return defaultTexture;
}

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

        renderer.render(container);

        sprite.destroy();

        expect(renderer.renderPipes.sprite['gpuSpriteHash'][sprite.uid]).toBeNull();
    });
});
