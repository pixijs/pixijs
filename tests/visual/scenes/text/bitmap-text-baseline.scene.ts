import { Assets } from '~/assets';
import { BitmapText, Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Bounds, Container } from '~/scene';

const CONFIG = {
    FONT: {
        family: 'Roboto-Regular',
        size: 16,
        lineHeight: 18,
    },
    LAYOUT: {
        startX: 8,
        startY: 12,
        labelWidth: 60,
        rowGap: 36,
    },
    COLORS: {
        text: 'white',
        bounds: 0x00ff00,
    },
    TEST_TEXT: 'Mya',
    BASELINES: [
        'alphabetic',
        'top',
        'middle',
        'bottom',
        'ideographic',
        'hanging',
    ] as const,
} as const;

type TextBaseline = typeof CONFIG.BASELINES[number];

/**
 * Creates a baseline test row with label, text, and visualization
 * @param baseline
 * @param rowIndex
 * @param scene
 */
function createBaselineTestRow(
    baseline: TextBaseline,
    rowIndex: number,
    scene: Container
): void
{
    const { startX, startY, labelWidth, rowGap } = CONFIG.LAYOUT;
    const y = startY + (rowIndex * rowGap);
    const textX = startX + labelWidth;

    // Create label showing first letter of baseline type
    const label = new BitmapText({
        text: baseline[0].toUpperCase(),
        style: {
            fontFamily: CONFIG.FONT.family,
            fontSize: CONFIG.FONT.size,
            lineHeight: CONFIG.FONT.lineHeight,
            fill: CONFIG.COLORS.text,
        },
        x: startX,
        y,
    });

    // Create test text with specific baseline
    const testText = new BitmapText({
        text: CONFIG.TEST_TEXT,
        style: {
            fontFamily: CONFIG.FONT.family,
            fontSize: CONFIG.FONT.size,
            lineHeight: CONFIG.FONT.lineHeight,
            textBaseline: baseline,
            fill: CONFIG.COLORS.text,
        },
        x: textX,
        y,
    });

    // Create visualization graphics
    const graphics = createRowVisualization(testText);

    scene.addChild(label);
    scene.addChild(testText);
    scene.addChild(graphics);
}

function createRowVisualization(
    text: BitmapText,
): Graphics
{
    const graphics = new Graphics();
    const bounds = text.getBounds();

    // Draw bounds rectangle
    drawBounds(graphics, bounds);

    return graphics;
}

function drawBounds(graphics: Graphics, bounds: Bounds): Graphics
{
    return graphics.rect(bounds.x, bounds.y, bounds.width, bounds.height)
        .stroke({ width: 1, color: CONFIG.COLORS.bounds });
}

export const scene: TestScene = {
    it: 'should align baselines correctly across textBaseline variants (MSDF)',
    id: 'bitmap-text-baseline',
    options: { height: 256 },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/msdf/Roboto-Regular.fnt');

        // Create test rows for each baseline variant
        CONFIG.BASELINES.forEach((baseline, index) =>
        {
            createBaselineTestRow(baseline, index, scene);
        });
    },
};

