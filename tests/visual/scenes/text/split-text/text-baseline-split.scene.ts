import { Graphics, SplitText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with baseline using split text correctly',
    options: {
        width: 400,
        height: 30,
    },
    create: async (scene: Container) =>
    {
        const TEXT_Y = 0;
        const FONT_SIZE = 20;
        const style1 = new TextStyle({
            fontFamily: 'Times',
            textBaseline: 'alphabetic',
            fontSize: FONT_SIZE,
        });
        const text1 = new Text('alphabetic', style1);
        const split1 = SplitText.from(text1);

        split1.x = 10;
        split1.y = TEXT_Y;
        scene.addChild(split1);

        const style2 = new TextStyle({
            fontFamily: 'Times',
            textBaseline: 'bottom',
            fontSize: FONT_SIZE,
        });
        const text2 = new Text('bottom', style2);
        const split2 = SplitText.from(text2);

        split2.x = 150;
        split2.y = TEXT_Y;
        scene.addChild(split2);

        const style3 = new TextStyle({
            fontFamily: 'Times',
            textBaseline: 'middle',
            fontSize: FONT_SIZE,
        });
        const text3 = new Text('middle', style3);
        const split3 = SplitText.from(text3);

        split3.x = 300;
        split3.y = TEXT_Y;

        scene.addChild(split3);

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
