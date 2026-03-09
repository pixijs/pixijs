import { Assets } from '~/assets';
import { FillGradient, SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render style inheritance with tagged text correctly using split text',
    options: {
        width: 400,
        height: 450,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const baseGradient1 = new FillGradient({
            end: { x: 1, y: 1 },
            colorStops: [
                { offset: 0, color: 0xff0000 },
                { offset: 0.5, color: 0x00ff00 },
                { offset: 1, color: 0x0000ff },
            ],
            textureSpace: 'local',
        });

        const t1 = new Text({
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

        const s1 = SplitText.from(t1);

        s1.position.set(10, 10);
        scene.addChild(s1);

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

        const t2 = new Text({
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

        const s2 = SplitText.from(t2);

        s2.position.set(10, 150);
        scene.addChild(s2);

        const t3 = new Text({
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

        const s3 = SplitText.from(t3);

        s3.position.set(10, 290);
        scene.addChild(s3);

        const t4 = new Text({
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

        const s4 = SplitText.from(t4);

        s4.position.set(10, 380);
        scene.addChild(s4);
    },
};
