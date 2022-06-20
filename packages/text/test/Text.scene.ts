import { Container } from '@pixi/display';
import { Text, TextStyle } from '@pixi/text';
import type { TestScene } from '../../../test/renderTests';

export const scene: TestScene = {
    it: 'should render several instances of text with different styles',
    options: {
        width: 800
    },
    create: async (scene: Container) =>
    {
        const basicText = new Text('Basic text in pixi');

        basicText.x = 50;
        basicText.y = 20;

        scene.addChild(basicText);

        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
            lineJoin: 'round',
        });

        const richText = new Text('Rich text with a lot of options and across multiple lines', style);

        richText.x = 50;
        richText.y = 100;

        scene.addChild(richText);

        const skewStyle = new TextStyle({
            fontFamily: 'Arial',
            dropShadow: true,
            dropShadowAlpha: 0.8,
            dropShadowAngle: 2.1,
            dropShadowBlur: 4,
            dropShadowColor: '0x111111',
            dropShadowDistance: 10,
            fill: ['#ffffff'],
            stroke: '#004620',
            fontSize: 60,
            fontWeight: 'lighter',
            lineJoin: 'round',
            strokeThickness: 12,
        });

        const skewText = new Text('SKEW IS COOL', skewStyle);

        skewText.skew.set(0.65, -0.3);
        skewText.anchor.set(0.5, 0.5);
        skewText.x = 250;
        skewText.y = 300;

        scene.addChild(skewText);
    },
};
