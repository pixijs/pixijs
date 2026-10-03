import { copyDepthRegion } from './copyDepthRegion';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should copy a region of depth from the canvas via copyDepthTexture',
    renderers: { webgpu: true, webgl2: true, webgl1: false, canvas: false },
    create: async (scene, renderer) => copyDepthRegion(scene, renderer, 'canvas'),
};
