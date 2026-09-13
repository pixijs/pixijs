import { BlurFilter } from '~/filters';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

// A non power of two screen, so the pooled filter texture is screen sized instead of padded out to 128x128.
// repeatEdgePixels gives the blur zero padding, so its frame is exactly the screen and the blur samples
// past the frame edge. With a padded texture the right and bottom edges fade into transparent padding
// while the left and top clamp; with a screen sized texture all four edges clamp, as the option intends.
const size = 100;

export const scene: TestScene = {
    it: 'should not fade a screen filling repeat edge blur at the right and bottom edges',
    options: { width: size, height: size },
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const graphics = new Graphics()
            .rect(0, 0, size, size)
            .fill(0xffffff);

        const blur = new BlurFilter({ strength: 16, quality: 4 });

        // not a constructor option, only the property drops the padding to zero
        blur.repeatEdgePixels = true;

        graphics.filters = [blur];

        scene.addChild(graphics);
    },
};
