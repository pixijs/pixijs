import { Matrix, Rectangle } from '~/maths';
import { Texture } from '~/rendering';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a local texture fill from a texture with a non-zero frame origin',
    create: async (scene: Container) =>
    {
        // an "atlas" where the target frame sits at an odd offset,
        // with distinct content so any shift/wrap would be visible
        const canvas = document.createElement('canvas');

        canvas.width = 128;
        canvas.height = 128;

        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#555555';
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(40, 24, 48, 48);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(42, 26, 44, 44);
        ctx.strokeStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(40, 72);
        ctx.lineTo(88, 24);
        ctx.stroke();

        const source = Texture.from(canvas).source;
        const texture = new Texture({ source, frame: new Rectangle(40, 24, 48, 48) });

        // maps the shape's local space onto the frame's UV region of the source
        const matrix = new Matrix(
            texture.frame.width / source.width,
            0,
            0,
            texture.frame.height / source.height,
            texture.frame.x / source.width,
            texture.frame.y / source.height,
        ).invert();

        const g = new Graphics()
            .rect(4, 4, 120, 120)
            .fill({ texture, textureSpace: 'local', matrix });

        scene.addChild(g);
    },
};
