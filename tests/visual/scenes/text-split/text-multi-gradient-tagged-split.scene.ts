import { Assets } from '~/assets';
import { type Container, FillGradient, SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render tagged text with multiple different gradient fills using split text',
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

        const t1 = new Text({
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
        });

        const s1 = SplitText.from(t1);

        s1.position.set(5, 0);

        const t2 = new Text({
            text: '<linear>Linear</linear> vs <radial>Radial</radial>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                tagStyles: {
                    linear: { fill: warmHorizontal },
                    radial: { fill: radialGradient },
                },
            },
        });

        const s2 = SplitText.from(t2);

        s2.position.set(5, 32);

        const globalGradient = new FillGradient({
            end: { x: 200, y: 0 },
            colorStops: [
                { offset: 0, color: 0xff0000 },
                { offset: 0.5, color: 0x00ff00 },
                { offset: 1, color: 0x0000ff },
            ],
            textureSpace: 'global',
        });

        const t3 = new Text({
            text: '<g>One</g> <g>Two</g> <g>Three</g>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                tagStyles: {
                    g: { fill: globalGradient },
                },
            },
        });

        const s3 = SplitText.from(t3);

        s3.position.set(5, 64);

        const strokeGradient = new FillGradient({
            end: { x: 1, y: 0 },
            colorStops: [
                { offset: 0, color: 0x00ffff },
                { offset: 1, color: 0xff00ff },
            ],
            textureSpace: 'local',
        });

        const t4 = new Text({
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
        });

        const s4 = SplitText.from(t4);

        s4.position.set(5, 96);

        scene.addChild(s1, s2, s3, s4);
    },
};
