import { DOMAdapter } from '~/environment/adapter';
import { Rectangle } from '~/maths';
import { ImageSource, Texture } from '~/rendering';
import { TilingSprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should keep translucent texture colors when tiling',
    create: async (scene: Container) =>
    {
        const size = 12;
        const border = 2;
        const canvas = DOMAdapter.get().createCanvas(size + (border * 2), size + (border * 2));
        const ctx = canvas.getContext('2d');

        // Opaque green border outside the frame; it must never show
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(border, border, size, size);

        // Quadrants: 50% red, transparent, opaque white, 50% black
        const half = size / 2;

        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(border, border, half, half);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(border + half, border + half, half, half);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(border, border + half, half, half);

        const texture = new Texture({
            source: new ImageSource({ resource: canvas, scaleMode: 'nearest' }),
            frame: new Rectangle(border, border, size, size),
        });

        scene.addChild(new TilingSprite({
            texture,
            width: 128,
            height: 128,
            tileScale: { x: 2, y: 2 },
            tilePosition: { x: 6, y: 6 },
        }));
    },
};
