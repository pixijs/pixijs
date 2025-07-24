import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text correctly with tag styles for family',
    create: async (scene: Container, renderer: Renderer) =>
    {
        await Assets.load([
            {
                alias: 'Poppins100',
                src: 'https://fonts.gstatic.com/s/poppins/v21/pxiGyp8kv8JHgFVrLPTucHtAOvWDSA.woff2',
                data: {
                    family: 'Poppins',
                    weights: ['100'],
                },
            },
            {
                alias: 'Poppins400',
                src: 'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2',
                data: {
                    family: 'Poppins',
                    weights: ['400'],
                },
            },
            {
                alias: 'Poppins800',
                src: 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLDD4Z1xlFd2JQEk.woff2',
                data: {
                    family: 'Poppins',
                    weights: ['800'],
                },
            },
        ]);

        const text = new HTMLText({
            text: '<light>B</light><medium>B</medium><bold>B</bold>',
            style: {
                fill: 'white',
                fontSize: 60,
                tagStyles: {
                    light: { fill: '#c66', fontWeight: '100', fontFamily: 'Poppins' },
                    medium: { fill: '#6c6', fontWeight: '400', fontFamily: 'Poppins' },
                    bold: { fill: '#66c', fontWeight: '800', fontFamily: 'Poppins' },
                },
            },
        });

        scene.addChild(text);
        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
