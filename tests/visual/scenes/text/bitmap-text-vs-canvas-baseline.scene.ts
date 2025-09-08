import { Assets } from '~/assets';
import { BitmapText, Graphics, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Bounds, Container } from '~/scene';

const CONFIG = {
    FONT: {
        family: 'Outfit',
        size: 24,
        baseline: 'alphabetic' as const,
    },
    LAYOUT: {
        x: 8,
        canvasY: 64,
        spacing: 28,
        guideWidth: 128,
    },
    COLORS: {
        text: 'white',
        canvasBounds: 0x00ff00,
        bitmapBounds: 0x00ffff,
        baseline: 0xff0000,
    },
    TEST_TEXT: 'Baseline',
} as const;

function createSharedStyle(): TextStyle
{
    return new TextStyle({
        fontFamily: CONFIG.FONT.family,
        fontSize: CONFIG.FONT.size,
        textBaseline: CONFIG.FONT.baseline,
        fill: CONFIG.COLORS.text,
    });
}

function drawBounds(graphics: Graphics, bounds: Bounds, color: number): Graphics
{
    return graphics.rect(bounds.x, bounds.y, bounds.width, bounds.height)
        .stroke({ width: 1, color });
}

function drawBaselineGuide(graphics: Graphics, y: number, width: number = CONFIG.LAYOUT.guideWidth): Graphics
{
    return graphics.moveTo(0, y).lineTo(width, y)
        .stroke({ width: 1, color: CONFIG.COLORS.baseline });
}

export const scene: TestScene = {
    it: 'should align BitmapText baseline with Text (Canvas) for same style',
    id: 'bitmap-text-vs-canvas-baseline',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const sharedStyle = createSharedStyle();
        const { x, canvasY, spacing } = CONFIG.LAYOUT;
        const bitmapY = canvasY + spacing;

        // Create Canvas Text
        const canvasText = new Text({
            text: CONFIG.TEST_TEXT,
            style: sharedStyle,
            x,
            y: canvasY,
        });

        // Create Bitmap Text with equivalent style
        const bitmapText = new BitmapText({
            text: CONFIG.TEST_TEXT,
            style: {
                fontFamily: CONFIG.FONT.family,
                fontSize: CONFIG.FONT.size,
                textBaseline: CONFIG.FONT.baseline,
                fill: CONFIG.COLORS.text,
            },
            x,
            y: bitmapY, // Position below Canvas Text for visual comparison
        });

        scene.addChild(canvasText);
        scene.addChild(bitmapText);

        // Create visualization graphics
        const graphics = new Graphics();

        // Draw bounds for both text objects
        const canvasBounds = canvasText.getBounds();
        const bitmapBounds = bitmapText.getBounds();

        drawBounds(graphics, canvasBounds, CONFIG.COLORS.canvasBounds);
        drawBounds(graphics, bitmapBounds, CONFIG.COLORS.bitmapBounds);

        // Draw baseline guides for both rows
        drawBaselineGuide(graphics, canvasY + canvasBounds.height);
        drawBaselineGuide(graphics, bitmapY + bitmapBounds.height);

        scene.addChild(graphics);
    },
};
