import { BlurFilter } from '~/filters';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

// A non power of two screen, so the pooled filter texture is screen sized instead of padded out to 128x128.
// repeatEdgePixels gives the blur zero padding, so its frame is exactly the screen and the blur samples
// past the frame edge. With a padded texture the right and bottom edges fade into transparent padding
// while the left and top clamp; with a screen sized texture all four edges clamp, as the option intends.
//
// Four solid quadrants give the blur something to soften in the middle, so the snapshot shows the filter
// is running, and each quadrant colour must stay solid all the way to its two screen edges.
const size = 100;
const half = size / 2;

export const scene: TestScene = {
    it: 'should keep a screen filling repeat edge blur solid on all four screen edges',
    options: { width: size, height: size },
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const graphics = new Graphics()
            .rect(0, 0, half, half)
            .fill(0xff3b30)
            .rect(half, 0, half, half)
            .fill(0x34c759)
            .rect(0, half, half, half)
            .fill(0x007aff)
            .rect(half, half, half, half)
            .fill(0xffcc00);

        const blur = new BlurFilter({ strength: 16, quality: 4 });

        // not a constructor option, only the property drops the padding to zero
        blur.repeatEdgePixels = true;

        graphics.filters = [blur];

        scene.addChild(graphics);
    },
};
