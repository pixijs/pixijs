import { Assets } from '~/assets';
import { type Container, Graphics, type GraphicsContext } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render social media icon SVGs (tests fillRule fix for multi-path SVGs)',
    create: async (scene: Container) =>
    {
        // Load all social media icon SVGs
        const [
            googleIcon,
            twitterIcon,
            discordIcon,
            instagramIcon,
        ] = await Promise.all([
            Assets.load<GraphicsContext>({
                src: 'svg-icon-google.svg',
                data: { parseAsGraphicsContext: true }
            }),
            Assets.load<GraphicsContext>({
                src: 'svg-icon-twitter-x.svg',
                data: { parseAsGraphicsContext: true }
            }),
            Assets.load<GraphicsContext>({
                src: 'svg-icon-discord.svg',
                data: { parseAsGraphicsContext: true }
            }),
            Assets.load<GraphicsContext>({
                src: 'svg-icon-instagram.svg',
                data: { parseAsGraphicsContext: true }
            }),
        ]);

        // Create a 2x2 grid layout
        const createIcon = (context: GraphicsContext, x: number, y: number) =>
        {
            const graphics = new Graphics(context);

            graphics.scale.set(2.5);
            graphics.position.set(x, y);

            return graphics;
        };

        // Row 1: Google and Twitter/X
        scene.addChild(createIcon(googleIcon, 10, 10));
        scene.addChild(createIcon(twitterIcon, 70, 10));

        // Row 2: Discord and Instagram (the one with holes - tests the fix!)
        scene.addChild(createIcon(discordIcon, 10, 70));
        scene.addChild(createIcon(instagramIcon, 70, 70));
    },
};

