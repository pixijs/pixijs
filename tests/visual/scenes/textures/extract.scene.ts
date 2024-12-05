import { Assets } from '~/assets';
import { DOMAdapter } from '~/environment';
import { CanvasSource, ImageSource, Texture } from '~/rendering';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

const cellSize = 35;

type PoseOptions = {
    x: number;
    y: number;
    scale: number;
};

function addSprite(sprite: Sprite, scene: Container, opts: Partial<PoseOptions> = {})
{
    const { x = 0, y = 0, scale = 0.25 } = opts;

    sprite.position.set(x, y);
    sprite.scale.set(scale, scale);

    scene.addChild(sprite);

    return sprite;
}

export const scene: TestScene = {
    it: 'should extract textures',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const texture = await Assets.load('profile-abel@0.5x.jpg');
        const container = new Sprite(texture);

        // should generate canvas from Container
        const canvas = renderer.extract.canvas(container);
        const asCanvas = new Sprite(new Texture(new CanvasSource({ resource: canvas })));

        addSprite(asCanvas, scene, { x: 0, y: 0 });

        // should generate image from Container (also tests base64 conversion, used by extract.image())
        const image = await renderer.extract.image(container);
        const asImage = new Sprite(new Texture(new ImageSource({ resource: image })));

        addSprite(asImage, scene, { x: cellSize, y: 0 });

        // should generate pixels from Container
        const { pixels, width, height } = renderer.extract.pixels(container);
        const tempCanvas = DOMAdapter.get().createCanvas(width, height);
        const context = tempCanvas.getContext('2d');

        // create image data from UInt array and draw to canvas
        const imageData = context.createImageData(width, height);

        imageData.data.set(pixels);
        context.putImageData(imageData, 0, 0);

        const asCanvasFromPixels = new Sprite(new Texture(new CanvasSource({ resource: tempCanvas })));

        addSprite(asCanvasFromPixels, scene, { x: cellSize * 2, y: 0 });

        // should generate texture from Container
        const asTexture = new Sprite(renderer.extract.texture(container));

        addSprite(asTexture, scene, { x: 0, y: cellSize });
    },
};
