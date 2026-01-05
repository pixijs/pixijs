import { Assets } from '~/assets';
import { BitmapText, Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

const CONFIG = {
    BOX: { x: 16, y: 16, width: 96, height: 96 },
    FONT: {
        family: 'Roboto-Regular',
        size: 28,
        lineHeight: 32,
    },
    COLORS: {
        box: 0xffffff,
        bounds: 0x00ff00,
        crosshair: 0xff0000,
        text: 'white',
    },
    CROSSHAIR_SIZE: 40,
} as const;

function createBoundsVisualization(text: BitmapText): Graphics
{
    const bounds = text.getBounds();
    const graphics = new Graphics();

    // Draw bounds rectangle
    graphics.rect(bounds.x, bounds.y, bounds.width, bounds.height)
        .stroke({ width: 1, color: CONFIG.COLORS.bounds });

    // Draw crosshair at text position
    const { x, y } = text;
    const size = CONFIG.CROSSHAIR_SIZE;

    graphics.moveTo(x - size, y).lineTo(x + size, y)
        .stroke({ width: 1, color: CONFIG.COLORS.crosshair });
    graphics.moveTo(x, y - size).lineTo(x, y + size)
        .stroke({ width: 1, color: CONFIG.COLORS.crosshair });

    return graphics;
}

export const scene: TestScene = {
    it: 'should vertically center with anchor 0.5 using correct baseline',
    id: 'bitmap-text-baseline-anchor',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/msdf/Roboto-Regular.fnt');

        // Create container box
        const boxGraphics = new Graphics();

        boxGraphics.rect(CONFIG.BOX.x, CONFIG.BOX.y, CONFIG.BOX.width, CONFIG.BOX.height)
            .stroke({ width: 1, color: CONFIG.COLORS.box });
        scene.addChild(boxGraphics);

        // Create centered text with anchor
        const text = new BitmapText({
            text: 'Mya',
            style: {
                fontFamily: CONFIG.FONT.family,
                fontSize: CONFIG.FONT.size,
                lineHeight: CONFIG.FONT.lineHeight,
                textBaseline: 'alphabetic',
                fill: CONFIG.COLORS.text,
            },
            anchor: 0.5,
            x: CONFIG.BOX.x + (CONFIG.BOX.width / 2),
            y: CONFIG.BOX.y + (CONFIG.BOX.height / 2),
        });

        scene.addChild(text);

        // Add bounds visualization
        const boundsGraphics = createBoundsVisualization(text);

        scene.addChild(boundsGraphics);
    },
};

