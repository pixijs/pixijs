import { Assets } from '~/assets';
import { type Container, FillGradient, SplitText, Text } from '~/scene';

import type { TestScene } from '../../../types';

export const scene: TestScene = {
    it: 'should render text with multiple gradient fills using split text',
    options: {
        width: 300,
        height: 140,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const warmHorizontal = new FillGradient({
            end: { x: 1, y: 0 },
            colorStops: [
                { offset: 0, color: 0xff0000 },
                { offset: 0.5, color: 0xff8800 },
                { offset: 1, color: 0xffff00 },
            ],
            textureSpace: 'local',
        });

        const coolVertical = new FillGradient({
            end: { x: 0, y: 1 },
            colorStops: [
                { offset: 0, color: 0x0000ff },
                { offset: 1, color: 0x00ffff },
            ],
            textureSpace: 'local',
        });

        const rainbowDiagonal = new FillGradient({
            end: { x: 1, y: 1 },
            colorStops: [
                { offset: 0, color: 0xff0000 },
                { offset: 0.2, color: 0xff8800 },
                { offset: 0.4, color: 0xffff00 },
                { offset: 0.6, color: 0x00ff00 },
                { offset: 0.8, color: 0x0000ff },
                { offset: 1, color: 0x8800ff },
            ],
            textureSpace: 'local',
        });

        const radialGradient = new FillGradient({
            type: 'radial',
            center: { x: 0.5, y: 0.5 },
            innerRadius: 0,
            outerRadius: 0.7,
            colorStops: [
                { offset: 0, color: 0xffffff },
                { offset: 1, color: 0x8800ff },
            ],
            textureSpace: 'local',
        });

        const globalGradient = new FillGradient({
            end: { x: 200, y: 0 },
            colorStops: [
                { offset: 0, color: 0xff0000 },
                { offset: 0.5, color: 0x00ff00 },
                { offset: 1, color: 0x0000ff },
            ],
            textureSpace: 'global',
        });

        const strokeGradient = new FillGradient({
            end: { x: 1, y: 0 },
            colorStops: [
                { offset: 0, color: 0x00ffff },
                { offset: 1, color: 0xff00ff },
            ],
            textureSpace: 'local',
        });

        const text1 = new Text({
            text: 'Warm',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: warmHorizontal },
            x: 5,
            y: 0,
        });

        const text2 = new Text({
            text: 'Cool',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: coolVertical },
            x: 70,
            y: 0,
        });

        const text3 = new Text({
            text: 'Rainbow',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: rainbowDiagonal },
            x: 130,
            y: 0,
        });

        const text4 = new Text({
            text: 'Linear',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: warmHorizontal },
            x: 5,
            y: 32,
        });

        const text5 = new Text({
            text: 'Radial',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: radialGradient },
            x: 100,
            y: 32,
        });

        const text6 = new Text({
            text: 'One Two Three',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: globalGradient },
            x: 5,
            y: 64,
        });

        const text7 = new Text({
            text: 'Both',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                fill: coolVertical,
                stroke: { fill: strokeGradient, width: 3 },
            },
            x: 5,
            y: 96,
        });

        scene.addChild(
            SplitText.from(text1, { x: 5, y: 0 }),
            SplitText.from(text2, { x: 70, y: 0 }),
            SplitText.from(text3, { x: 130, y: 0 }),
            SplitText.from(text4, { x: 5, y: 32 }),
            SplitText.from(text5, { x: 100, y: 32 }),
            SplitText.from(text6, { x: 5, y: 64 }),
            SplitText.from(text7, { x: 5, y: 96 }),
        );
    },
};
