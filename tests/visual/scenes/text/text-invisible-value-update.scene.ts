import { BitmapText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render two text correctly with the same style and value',
    create: async (scene: Container, renderer) =>
    {
        const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial', fill: 'black', lineHeight: 24 });
        const bText1 = new BitmapText({ text: 'BText 0', style });
        const bText2 = new BitmapText({ text: 'BText 0', style, y: 24 });
        const text1 = new Text({ text: 'Text 0', style, y: 48 });
        const text2 = new Text({ text: 'Text 0', style, y: 72 });

        scene.addChild(bText1);
        scene.addChild(bText2);
        scene.addChild(text1);
        scene.addChild(text2);

        const delay = () => new Promise((resolve) => setTimeout(resolve, 200));
        const setText = (text: string) =>
        {
            bText1.text = `B${text}`;
            bText2.text = `B${text}`;

            text1.text = text;
            text2.text = text;
        };

        renderer.render(scene);

        await delay();
        bText1.visible = text1.visible = false;
        renderer.render(scene);

        await delay();
        setText('Text 1');
        renderer.render(scene);

        await delay();
        setText('Text 2');
        renderer.render(scene);

        await delay();
        setText('Text 3');
        renderer.render(scene);

        await delay();
        bText1.visible = text1.visible = true;
        renderer.render(scene);
    },
};
