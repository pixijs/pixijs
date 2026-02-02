import { Text } from '../../../../../src/scene/text/Text';
import { Assets } from '~/assets';
import { type Container, FillGradient, type TextureSpace } from '~/scene';

import type { TestScene } from '../../../types';

export const scene: TestScene = {
    it: 'should render tagged text with gradient fills correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const createGradient = (type: TextureSpace) => new FillGradient({
            end: { x: type === 'local' ? 1 : 60, y: type === 'local' ? 1 : 30 },
            colorStops: [
                { offset: 0, color: 0xff0000 },
                { offset: 0.5, color: 0x00ff00 },
                { offset: 1, color: 0x0000ff },
            ],
            textureSpace: type,
        });

        // Test with fill gradient
        const textFillGlobal = new Text({
            text: '<gradient>Im Fill</gradient>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                tagStyles: {
                    gradient: { fill: createGradient('global') },
                },
            },
            x: 5,
            y: 0,
        });

        const textFillLocal = new Text({
            text: '<gradient>Im Fill</gradient>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                tagStyles: {
                    gradient: { fill: createGradient('local') },
                },
            },
            x: 5,
            y: 32,
        });

        // Test with stroke gradient
        const textStrokeGlobal = new Text({
            text: '<gradient>Im Stroke</gradient>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                fill: { color: 0xffffff, alpha: 0.5 },
                tagStyles: {
                    gradient: {
                        stroke: { fill: createGradient('global'), width: 5 },
                    },
                },
            },
            x: 5,
            y: 64,
        });

        const textStrokeLocal = new Text({
            text: '<gradient>Im Stroke</gradient>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                fill: { color: 0xffffff, alpha: 0.5 },
                tagStyles: {
                    gradient: {
                        stroke: { fill: createGradient('local'), width: 5 },
                    },
                },
            },
            x: 5,
            y: 96,
        });

        scene.addChild(textFillGlobal, textFillLocal, textStrokeGlobal, textStrokeLocal);
    },
};
