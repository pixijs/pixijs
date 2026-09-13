import { Graphics } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render svg radial gradients (issue #12136)',
    create: async (scene: Container) =>
    {
        const radialGradients = `
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- Percentage coordinates, the way design tools write them -->
                <radialGradient id="percentages" cx="50%" cy="50%" r="50%">
                    <stop offset="0" stop-color="white"/>
                    <stop offset="1" stop-color="#001a00"/>
                </radialGradient>

                <!-- SVG defaults, no geometry given -->
                <radialGradient id="defaults">
                    <stop offset="0" stop-color="yellow"/>
                    <stop offset="1" stop-color="red"/>
                </radialGradient>

                <!-- Offset focal point -->
                <radialGradient id="focal" cx="0.5" cy="0.5" r="0.5" fx="0.25" fy="0.25">
                    <stop offset="0" stop-color="cyan"/>
                    <stop offset="1" stop-color="blue"/>
                </radialGradient>

                <!-- User space coordinates -->
                <radialGradient id="userSpace" cx="290" cy="290" r="70" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="magenta"/>
                    <stop offset="1" stop-color="purple"/>
                </radialGradient>
            </defs>

            <rect x="20" y="20" width="150" height="150" fill="url(#percentages)"/>
            <rect x="220" y="20" width="150" height="150" fill="url(#defaults)"/>
            <rect x="20" y="220" width="150" height="150" fill="url(#focal)"/>
            <rect x="220" y="220" width="150" height="150" fill="url(#userSpace)"/>
        </svg>`;

        const svg = new Graphics().svg(radialGradients);

        svg.setSize(118, 118);

        scene.addChild(svg);
    },
};
