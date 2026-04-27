import { Assets } from '~/assets';
import { Text } from '~/scene';
import { CanvasTextMetrics } from '~/scene/text/canvas/CanvasTextMetrics';
import { TextStyle } from '~/scene/text/TextStyle';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should not wrap text that fits within wordWrapWidth',
    options: {
        width: 300,
        height: 128,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const content = 'p jdk f svzmrq';
        const style = new TextStyle({
            fontFamily: 'Outfit',
            fontSize: 24,
        });

        const metrics = CanvasTextMetrics.measureText(content, style, undefined, false);

        // Text with wordWrapWidth set to measured width + 1 should stay on one line
        const text = new Text({
            text: content,
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                fill: 'black',
                wordWrap: true,
                wordWrapWidth: Math.ceil(metrics.width) + 1,
            },
        });

        text.x = 10;
        text.y = 10;
        scene.addChild(text);

        // Same text without word wrap for comparison
        const textNoWrap = new Text({
            text: content,
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                fill: 'black',
            },
        });

        textNoWrap.x = 10;
        textNoWrap.y = 50;
        scene.addChild(textNoWrap);
    },
};
