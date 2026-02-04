import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text font weights with tagged text correctly',
    options: {
        width: 200,
        height: 256,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const lineHeight = 28;

        const text = new HTMLText({
            text: `<w1>100</w1> Weight
<w2>200</w2> Weight
<w3>300</w3> Weight
<w4>400</w4> Weight
<w5>500</w5> Weight
<w6>600</w6> Weight
<w7>700</w7> Weight
<w8>800</w8> Weight
<w9>900</w9> Weight`,
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                fill: 'white',
                lineHeight,
                tagStyles: {
                    w1: { fontWeight: '100' },
                    w2: { fontWeight: '200' },
                    w3: { fontWeight: '300' },
                    w4: { fontWeight: '400' },
                    w5: { fontWeight: '500' },
                    w6: { fontWeight: '600' },
                    w7: { fontWeight: '700' },
                    w8: { fontWeight: '800' },
                    w9: { fontWeight: '900' },
                },
            },
        });

        text.position.set(4, 0);
        scene.addChild(text);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
