import { copyDepthRegion } from './copyDepthRegion';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should copy a region of depth from an antialiased canvas via copyDepthTexture',
    renderers: { webgpu: true, webgl2: true, webgl1: false, canvas: false },
    options: { antialias: true },
    create: async (scene, renderer) => copyDepthRegion(scene, renderer, 'canvas'),
};
