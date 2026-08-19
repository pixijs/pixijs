import { Rectangle } from '~/maths';
import { Texture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a texture fill from a groupD8-rotated atlas sub-texture like a sprite',
    create: async (scene: Container) =>
    {
        // distinct, asymmetric logical image (48x32)
        const image = document.createElement('canvas');

        image.width = 48;
        image.height = 32;

        const imageCtx = image.getContext('2d');

        imageCtx.fillStyle = '#27ae60';
        imageCtx.fillRect(0, 0, 48, 32);
        imageCtx.fillStyle = '#c0392b';
        imageCtx.fillRect(0, 0, 16, 32);
        imageCtx.fillStyle = '#f1c40f';
        imageCtx.fillRect(2, 2, 10, 10);
        imageCtx.strokeStyle = '#ffffff';
        imageCtx.lineWidth = 3;
        imageCtx.beginPath();
        imageCtx.moveTo(0, 32);
        imageCtx.lineTo(48, 0);
        imageCtx.stroke();

        // an "atlas" storing the image rotated 90 degrees clockwise (groupD8 rotate: 2),
        // surrounded by noise so any mis-mapped sampling is visible
        const atlas = document.createElement('canvas');

        atlas.width = 96;
        atlas.height = 96;

        const atlasCtx = atlas.getContext('2d');

        atlasCtx.fillStyle = '#8e44ad';
        atlasCtx.fillRect(0, 0, 96, 96);
        atlasCtx.fillStyle = '#2c3e50';
        atlasCtx.fillRect(0, 0, 24, 96);
        atlasCtx.save();
        atlasCtx.translate(24 + 32, 16);
        atlasCtx.rotate(Math.PI / 2);
        atlasCtx.drawImage(image, 0, 0);
        atlasCtx.restore();

        const texture = new Texture({
            source: Texture.from(atlas).source,
            frame: new Rectangle(24, 16, 32, 48),
            orig: new Rectangle(0, 0, 48, 32),
            rotate: 2,
        });

        // reference: the original image, then the sub-texture as a sprite,
        // then a graphics texture fill - all three must look identical
        const original = new Sprite(Texture.from(image));

        original.position.set(40, 4);

        const sprite = new Sprite(texture);

        sprite.position.set(40, 46);

        const fill = new Graphics()
            .rect(0, 0, 48, 32)
            .fill({ texture, textureSpace: 'global' });

        fill.position.set(40, 88);

        scene.addChild(original, sprite, fill);
    },
};
