import { Assets } from '~/assets';
import { type Container, FillGradient, Text } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render regular text with multiple gradient fills (baseline for tagged comparison)',
    options: {
        width: 300,
        height: 140,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        // Same gradients as tagged test for comparison
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

        // Row 1: Warm horizontal
        const text1 = new Text({
            text: 'Warm',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: warmHorizontal },
            x: 5,
            y: 0,
        });

        // Row 1: Cool vertical
        const text2 = new Text({
            text: 'Cool',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: coolVertical },
            x: 70,
            y: 0,
        });

        // Row 1: Rainbow diagonal
        const text3 = new Text({
            text: 'Rainbow',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: rainbowDiagonal },
            x: 130,
            y: 0,
        });

        // Row 2: Linear (warm)
        const text4 = new Text({
            text: 'Linear',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: warmHorizontal },
            x: 5,
            y: 32,
        });

        // Row 2: Radial
        const text5 = new Text({
            text: 'Radial',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: radialGradient },
            x: 100,
            y: 32,
        });

        // Row 3: Global gradient across words
        const text6 = new Text({
            text: 'One Two Three',
            style: { fontFamily: 'Outfit', fontSize: 24, fill: globalGradient },
            x: 5,
            y: 64,
        });

        // Row 4: Fill + Stroke gradients
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

        scene.addChild(text1, text2, text3, text4, text5, text6, text7);
    },
};
