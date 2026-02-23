import { Assets } from '~/assets';
import { FillGradient, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render style inheritance with tagged text correctly',
    options: {
        width: 400,
        height: 450,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        // Test 1: Base style with gradient fill; tags override to solid colors
        const baseGradient1 = new FillGradient({
            end: { x: 1, y: 1 },
            colorStops: [
                { offset: 0, color: 0xff0000 },
                { offset: 0.5, color: 0x00ff00 },
                { offset: 1, color: 0x0000ff },
            ],
            textureSpace: 'local',
        });

        const text1 = new Text({
            text: 'Base gradient <red>solid red</red> <blue>solid blue</blue> back to gradient',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                fill: baseGradient1,
                wordWrap: true,
                wordWrapWidth: 350,
                tagStyles: {
                    red: { fill: 'red' },
                    blue: { fill: 'blue' },
                },
            },
        });

        text1.x = 10;
        text1.y = 10;
        scene.addChild(text1);

        // Test 2: Base style solid; tags use per-tag gradients
        const tagGradient1 = new FillGradient({
            end: { x: 1, y: 0 },
            colorStops: [
                { offset: 0, color: 0xff00ff },
                { offset: 1, color: 0xffff00 },
            ],
            textureSpace: 'local',
        });

        const tagGradient2 = new FillGradient({
            end: { x: 0, y: 1 },
            colorStops: [
                { offset: 0, color: 0x00ffff },
                { offset: 1, color: 0xff00ff },
            ],
            textureSpace: 'local',
        });

        const text2 = new Text({
            text: 'Solid white <grad1>gradient 1</grad1> <grad2>gradient 2</grad2> white again',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                fill: 'white',
                wordWrap: true,
                wordWrapWidth: 350,
                tagStyles: {
                    grad1: { fill: tagGradient1 },
                    grad2: { fill: tagGradient2 },
                },
            },
        });

        text2.x = 10;
        text2.y = 150;
        scene.addChild(text2);

        // Test 3: Nested tag inheritance demonstration
        const text3 = new Text({
            text: '<outer>Outer yellow <inner>inner red</inner> outer yellow again</outer>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                fill: 'white',
                wordWrap: true,
                wordWrapWidth: 350,
                tagStyles: {
                    outer: { fill: 'yellow' },
                    inner: { fill: 'red' },
                },
            },
        });

        text3.x = 10;
        text3.y = 290;
        scene.addChild(text3);

        // Test 4: Complex inheritance with multiple properties
        const text4 = new Text({
            text: 'Base <bold>bold <italic>bold+italic</italic> bold</bold> base',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                fill: 'white',
                tagStyles: {
                    bold: { fill: 'cyan', fontWeight: 'bold' },
                    italic: { fill: 'magenta', fontStyle: 'italic' },
                },
            },
        });

        text4.x = 10;
        text4.y = 380;
        scene.addChild(text4);
    },
};
