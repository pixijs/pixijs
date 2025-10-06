import { Assets } from '~/assets';
import { BitmapText, Graphics } from '~/scene';
import { BitmapFontManager } from '~/scene/text-bitmap/BitmapFontManager';

import type { TestScene } from '../../types';
import type { Bounds, Container } from '~/scene';

const CONFIG = {
    FONT: {
        family: 'Roboto-Regular',
        size: 16,
        lineHeight: 18,
        baseline: 'alphabetic' as const,
    },
    LAYOUT: {
        startX: 8,
        startY: 10,
        labelWidth: 60,
        rowGap: 36,
        guideWidth: 60,
    },
    COLORS: {
        text: 'white',
        bounds: 0x00ff00,
        baseline: 0xff0000,
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

function drawBounds(graphics: Graphics, bounds: Bounds): Graphics
{
    return graphics.rect(bounds.x, bounds.y, bounds.width, bounds.height)
        .stroke({ width: 1, color: CONFIG.COLORS.bounds });
}

function drawBaselineGuide(graphics: Graphics, y: number, x: number, width: number): Graphics
{
    return graphics.moveTo(x, y).lineTo(x + width, y)
        .stroke({ width: 1, color: CONFIG.COLORS.baseline });
}

export const scene: TestScene = {
    it: 'should draw baseline guides for all baselines while text uses alphabetic',
    id: 'bitmap-text-baseline-lines',
    options: { height: 256 },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/msdf/Roboto-Regular.fnt');

        const { startX, startY, labelWidth, rowGap, guideWidth } = CONFIG.LAYOUT;

        // Base style for text: always alphabetic baseline
        const baseStyle = {
            fontFamily: CONFIG.FONT.family,
            fontSize: CONFIG.FONT.size,
            lineHeight: CONFIG.FONT.lineHeight,
            textBaseline: CONFIG.FONT.baseline,
            fill: CONFIG.COLORS.text,
        } as const;

        // Create a proper BitmapText to get the layout and font info
        const tempText = new BitmapText({
            text: CONFIG.TEST_TEXT,
            style: baseStyle,
        });

        // Get the layout and font from the temporary text
        const layout = BitmapFontManager.getLayout(CONFIG.TEST_TEXT, tempText.style, true);
        const scale = layout.scale;
        const font = BitmapFontManager.getFont(CONFIG.TEST_TEXT, tempText.style);
        const lineHeightUnits = baseStyle.lineHeight
            ? baseStyle.lineHeight / scale
            : font.lineHeight;

        // Pixel offset of alphabetic baseline from line top
        const alphabeticUnits = BitmapFontManager.getBaselineOffset(tempText.text, tempText.style, lineHeightUnits);
        const alphabeticPixels = alphabeticUnits * scale;

        CONFIG.BASELINES.forEach((baseline, index) =>
        {
            const lineTopY = startY + (index * rowGap) + alphabeticPixels;
            const textX = startX + labelWidth;

            // Render label for row
            const label = new BitmapText({
                text: baseline[0].toUpperCase(),
                style: baseStyle,
                x: startX,
                y: lineTopY,
            });

            // Text rendered with alphabetic baseline at the alphabetic baseline line
            const text = new BitmapText({
                text: CONFIG.TEST_TEXT,
                style: baseStyle,
                x: textX,
                y: lineTopY,
            });

            scene.addChild(label);
            scene.addChild(text);

            // Compute the guide position for the requested baseline variant
            const variantText = new BitmapText({
                text: CONFIG.TEST_TEXT,
                style: { ...baseStyle, textBaseline: baseline },
            });
            const baselineUnits = BitmapFontManager.getBaselineOffset(variantText.text, variantText.style, lineHeightUnits);
            const baselinePixels = baselineUnits * scale;

            const g = new Graphics();
            // Draw bounds of the text
            const b = text.getBounds();

            drawBounds(g, b);
            // Draw baseline guide for this variant
            drawBaselineGuide(g, lineTopY + baselinePixels, textX - 6, guideWidth);
            scene.addChild(g);
        });
    },
};

