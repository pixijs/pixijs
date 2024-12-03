import { Graphics } from '~/scene/graphics/shared/Graphics';
import { Text } from '~/scene/text/Text';
import { TextStyle } from '~/scene/text/TextStyle';

import type { TestScene } from '../../types';
import type { Container } from '~/scene/container/Container';

export const scene: TestScene = {
    it: 'should render text with baseline correctly',
    options: {
        width: 400,
        height: 30,
    },
    create: async (scene: Container) =>
    {
        const TEXT_Y = 0;
        const FONT_SIZE = 20;
        const style1 = new TextStyle({
            fontFamily: 'Academico',
            textBaseline: 'alphabetic',
            fontSize: FONT_SIZE,
        });
        const text1 = new Text('alphabetic', style1);

        text1.x = 10;
        text1.y = TEXT_Y;
        scene.addChild(text1);

        const style2 = new TextStyle({
            fontFamily: 'Academico',
            textBaseline: 'bottom',
            fontSize: FONT_SIZE,
        });
        const text2 = new Text('bottom', style2);

        text2.x = 150;
        text2.y = TEXT_Y;
        scene.addChild(text2);

        const style3 = new TextStyle({
            fontFamily: 'Academico',
            textBaseline: 'middle',
            fontSize: FONT_SIZE,
        });
        const text3 = new Text('middle', style3);

        text3.x = 300;
        text3.y = TEXT_Y;

        scene.addChild(text3);

        const graphics = new Graphics();

        graphics.setStrokeStyle({ width: 2, color: 0xfeeb77 });
        graphics.beginPath();
        graphics.lineTo(400, 0);
        graphics.closePath();
        graphics.stroke();
        graphics.x = 0;
        graphics.y = TEXT_Y + FONT_SIZE;
        scene.addChild(graphics);
    },
};
