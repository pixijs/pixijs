import { type TestScene } from '../../../../types';
import { Assets } from '~/assets';
import { type BLEND_MODES, Texture } from '~/rendering';
import { Container, Graphics, Sprite } from '~/scene';

export const scene: TestScene = {
    it: 'should render cached containers mixed with non cached, with advanced blend mode correctly',
    options: { useBackBuffer: true },
    create: async (scene: Container) =>
    {
        const bunnyTexture = await Assets.load('bunny.png');
        const blendModes: BLEND_MODES[] = ['overlay', 'screen', 'exclusion'];
        const totalBunnies = 9;
        const columns = 3;
        const rows = Math.ceil(totalBunnies / columns);
        const spacing = 5;

        const horizontalSize = bunnyTexture.width * columns;
        const horizontalSpacing = spacing * (columns - 1);
        const verticalSize = bunnyTexture.height * rows;
        const verticalSpacing = spacing * (rows - 1);

        const startX = (128 - horizontalSize - horizontalSpacing) * 0.5;
        const startY = (128 - verticalSize - verticalSpacing) * 0.5;

        for (let i = 0; i < totalBunnies; i++)
        {
            const column = i % columns;
            const row = Math.floor(i / columns);

            const isRenderGroup = i % 2 === 0;
            const blendMode = blendModes[i % blendModes.length];
            const container = new Container({
                x: startX + (column * (bunnyTexture.width + spacing)),
                y: startY + (row * (bunnyTexture.height + spacing)),
                isRenderGroup
            });
            const bunny = new Sprite(bunnyTexture);

            const glow = new Graphics({ blendMode })
                .rect(0, 0, bunny.width, bunny.height)
                .fill(0xff0000 >> Math.floor(i / columns));

            const background = new Sprite({
                texture: Texture.WHITE,
                width: bunny.width,
                height: bunny.height,
            });

            container.addChild(background, bunny, glow);

            scene.addChild(container);
        }
    },
};
