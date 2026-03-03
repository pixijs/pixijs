import { Assets } from '~/assets';
import { type Container, FillGradient, Text } from '~/scene';

import type { TestScene } from '../../../types';

export const scene: TestScene = {
    it: 'should render tagged text with multiple different gradient fills',
    options: {
        width: 300,
        height: 140,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        // Linear gradients with different directions
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

        // Text 1: Multiple linear directions
        const text1 = new Text({
            text: '<warm>Warm</warm> <cool>Cool</cool> <rainbow>Rainbow</rainbow>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                tagStyles: {
                    warm: { fill: warmHorizontal },
                    cool: { fill: coolVertical },
                    rainbow: { fill: rainbowDiagonal },
                },
            },
            x: 5,
            y: 0,
        });

        // Text 2: Linear vs Radial
        const text2 = new Text({
            text: '<linear>Linear</linear> vs <radial>Radial</radial>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                tagStyles: {
                    linear: { fill: warmHorizontal },
                    radial: { fill: radialGradient },
                },
            },
            x: 5,
            y: 32,
        });

        // Text 3: Global space (shared gradient)
        const globalGradient = new FillGradient({
            end: { x: 200, y: 0 },
            colorStops: [
                { offset: 0, color: 0xff0000 },
                { offset: 0.5, color: 0x00ff00 },
                { offset: 1, color: 0x0000ff },
            ],
            textureSpace: 'global',
        });

        const text3 = new Text({
            text: '<g>One</g> <g>Two</g> <g>Three</g>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                tagStyles: {
                    g: { fill: globalGradient },
                },
            },
            x: 5,
            y: 64,
        });

        // Text 4: Fill + Stroke combinations
        const strokeGradient = new FillGradient({
            end: { x: 1, y: 0 },
            colorStops: [
                { offset: 0, color: 0x00ffff },
                { offset: 1, color: 0xff00ff },
            ],
            textureSpace: 'local',
        });

        const text4 = new Text({
            text: '<both>Both</both>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                tagStyles: {
                    both: {
                        fill: coolVertical,
                        stroke: { fill: strokeGradient, width: 3 },
                    },
                },
            },
            x: 5,
            y: 96,
        });

        scene.addChild(text1, text2, text3, text4);
    },
};
